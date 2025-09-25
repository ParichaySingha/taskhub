import type { Comment, User } from "~/types";
import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  useAddCommentMutation,
  useGetCommentsByTaskIdQuery,
} from "~/hooks/use-task";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatDistanceToNow, format } from "date-fns";
import { Loader } from "../loader";
import { useAuth } from "~/provider/auth-context";
import { Send, Smile, MoreVertical, ThumbsUp, Heart, Laugh, Angry } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "~/lib/utils";

export const CommentSection = ({
  taskId,
  members,
}: {
  taskId: string;
  members: User[];
}) => {
  const [newComment, setNewComment] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  const { mutate: addComment, isPending } = useAddCommentMutation();
  const { data: comments, isLoading } = useGetCommentsByTaskIdQuery(taskId) as {
    data: Comment[];
    isLoading: boolean;
  };

  // Auto-scroll to bottom when new comments are added
  useEffect(() => {
    if (scrollAreaRef.current && comments?.length) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        // Use a more reliable scrolling approach
        const scrollToBottom = () => {
          const maxScroll = scrollElement.scrollHeight - scrollElement.clientHeight;
          scrollElement.scrollTop = maxScroll;
        };
        
        // Immediate scroll
        scrollToBottom();
        
        // Use requestAnimationFrame for better performance
        requestAnimationFrame(() => {
          scrollToBottom();
        });
        
        // Multiple delayed scrolls to ensure we reach the bottom
        setTimeout(scrollToBottom, 50);
        setTimeout(scrollToBottom, 100);
        setTimeout(scrollToBottom, 200);
      }

    }
  }, [comments]);

  // Handle scroll detection for scroll-to-bottom button
  useEffect(() => {
    const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollElement || !comments?.length) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShowScrollToBottom(!isNearBottom);
    };

    // Initial check
    handleScroll();
    
    scrollElement.addEventListener('scroll', handleScroll);
    
    // Also listen for resize events
    const resizeObserver = new ResizeObserver(handleScroll);
    resizeObserver.observe(scrollElement);
    
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [comments]);

  const scrollToBottom = () => {
    const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollElement) {
      // Use a more reliable scrolling approach
      const maxScroll = scrollElement.scrollHeight - scrollElement.clientHeight;
      scrollElement.scrollTop = maxScroll;
      
      // Also try the smooth scroll method
      scrollElement.scrollTo({
        top: maxScroll,
        behavior: 'smooth'
      });
      
      // Hide button after scrolling
      setTimeout(() => setShowScrollToBottom(false), 300);
    }
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    addComment(
      { taskId, text: newComment },
      {
        onSuccess: () => {
          setNewComment("");
          setReplyingTo(null);
          toast.success("Comment added successfully");
          // Force scroll to bottom after adding comment
          setTimeout(() => {
            const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollElement) {
              const maxScroll = scrollElement.scrollHeight - scrollElement.clientHeight;
              scrollElement.scrollTop = maxScroll;
            }
          }, 200);
        },
        onError: (error: any) => {
          toast.error(error.response.data.message);
          console.log(error);
        },
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setNewComment(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
    
    // Show typing indicator
    setIsTyping(true);
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout to hide typing indicator
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
    
    setTypingTimeout(timeout);
  };

  const getMessageStatus = (comment: Comment) => {
    // In a real app, you'd check actual read status from the backend
    const now = new Date();
    const commentTime = new Date(comment.createdAt);
    const timeDiff = now.getTime() - commentTime.getTime();
    
    if (timeDiff < 30000) { // Less than 30 seconds
      return "sending";
    } else if (timeDiff < 300000) { // Less than 5 minutes
      return "sent";
    } else {
      return "delivered";
    }
  };

  const getUserOnlineStatus = (userId: string) => {
    // In a real app, you'd check actual online status from the backend
    // For now, we'll simulate based on recent activity
    const now = new Date();
    const recentActivity = now.getTime() - Math.random() * 3600000; // Random activity within last hour
    
    if (recentActivity < 300000) { // Active within 5 minutes
      return { status: 'online', color: 'bg-green-500' };
    } else if (recentActivity < 1800000) { // Active within 30 minutes
      return { status: 'away', color: 'bg-yellow-500' };
    } else {
      return { status: 'offline', color: 'bg-gray-400' };
    }
  };

  const emojis = [
    { icon: "👍", name: "thumbs-up" },
    { icon: "❤️", name: "heart" },
    { icon: "😂", name: "laugh" },
    { icon: "😢", name: "sad" },
    { icon: "😡", name: "angry" },
    { icon: "🎉", name: "party" },
  ];

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-32">
        <Loader />
      </div>
    );

  return (
    <div className="bg-card rounded-lg shadow-sm flex flex-col h-[500px] max-h-[500px]">
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Comments</h3>
            <p className="text-sm text-muted-foreground">
              {comments?.length || 0} message{comments?.length !== 1 ? 's' : ''}
            </p>
          </div>
          {members && members.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {members.slice(0, 3).map((member, index) => {
                  const userStatus = getUserOnlineStatus(member._id);
                  const displayName = member.name || member.email || 'U';
                  return (
                    <div key={member._id} className="relative">
                      <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${userStatus.color} border-2 border-background rounded-full ${
                        userStatus.status === 'online' ? 'animate-pulse' : ''
                      }`} />
                    </div>
                  );
                })}
                {members.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                    +{members.length - 3}
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {members?.filter(m => m && getUserOnlineStatus(m._id).status === 'online').length || 0} online, {members?.length || 0} total
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full w-full scrollbar-hide" type="always">
          <div className="p-4">
        {comments?.length > 0 ? (
          <div className="space-y-3">
            {(() => {
              const sortedComments = comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
              return sortedComments.map((comment, index) => {
                const isCurrentUser = user?._id === comment.author._id;
                const showAvatar = index === 0 || sortedComments[index - 1].author._id !== comment.author._id;
                const showTime = index === sortedComments.length - 1 || 
                  new Date(comment.createdAt).getTime() - new Date(sortedComments[index + 1].createdAt).getTime() > 300000; // 5 minutes

              return (
                <div key={comment._id} className={cn(
                  "flex gap-2 group",
                  isCurrentUser ? "justify-end" : "justify-start"
                )}>
                  {!isCurrentUser && (
                    <div className="flex-shrink-0">
                      {showAvatar ? (
                        <Avatar className="size-8">
                          <AvatarImage src={comment.author.profilePicture} />
                          <AvatarFallback className="text-xs">
                            {(comment.author.name || comment.author.email || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-8" />
                      )}
                    </div>
                  )}

                  <div className={cn(
                    "flex flex-col max-w-[70%]",
                    isCurrentUser ? "items-end" : "items-start"
                  )}>
                    {!isCurrentUser && showAvatar && (
                      <div className="flex items-center gap-2 mb-1 px-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          {comment.author.name || comment.author.email || 'Unknown User'}
                        </span>
                        {(() => {
                          const userStatus = getUserOnlineStatus(comment.author._id);
                          return (
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 ${userStatus.color} rounded-full ${
                                userStatus.status === 'online' ? 'animate-pulse' : ''
                              }`} />
                              <span className={`text-xs ${
                                userStatus.status === 'online' ? 'text-green-600' :
                                userStatus.status === 'away' ? 'text-yellow-600' : 'text-gray-500'
                              }`}>
                                {userStatus.status}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    <div className={cn(
                      "relative px-4 py-2 rounded-2xl shadow-sm",
                      isCurrentUser 
                        ? "bg-primary text-primary-foreground rounded-br-md" 
                        : "bg-muted rounded-bl-md"
                    )}>
                      {/* New comment indicator */}
                      {index === sortedComments.length - 1 && new Date(comment.createdAt).getTime() > Date.now() - 300000 && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {comment.text}
                      </p>

                      {/* Message time and status */}
                      <div className={cn(
                        "flex items-center gap-1 mt-1 text-xs opacity-70",
                        isCurrentUser ? "justify-end" : "justify-start"
                      )}>
                        <span>
                          {format(comment.createdAt, "HH:mm")}
                        </span>
                        {isCurrentUser && (
                          <div className="flex items-center gap-1">
                            {getMessageStatus(comment) === "sending" && (
                              <span className="text-xs animate-pulse">⏳</span>
                            )}
                            {getMessageStatus(comment) === "sent" && (
                              <span className="text-xs">✓</span>
                            )}
                            {getMessageStatus(comment) === "delivered" && (
                              <span className="text-xs">✓✓</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Reactions */}
                      {comment.reactions && comment.reactions.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {comment.reactions.map((reaction, idx) => (
                            <span key={idx} className="text-xs bg-background/50 rounded-full px-2 py-1">
                              {reaction.emoji}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Message actions */}
                      <div className={cn(
                        "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity",
                        isCurrentUser ? "-left-12" : "-right-12"
                      )}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setReplyingTo(comment)}>
                              Reply
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              React
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {showTime && (
                      <span className="text-xs text-muted-foreground mt-1 px-2">
                        {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                      </span>
                    )}
                  </div>

                  {isCurrentUser && (
                    <div className="flex-shrink-0">
                      {showAvatar ? (
                        <Avatar className="size-8">
                          <AvatarImage src={comment.author.profilePicture} />
                          <AvatarFallback className="text-xs">
                            {(comment.author.name || comment.author.email || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-8" />
                      )}
                    </div>
                  )}
                </div>
              );
            });
            })()}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="flex-shrink-0 relative">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs">
                      {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full animate-pulse" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground">{user?.name || user?.email || 'Someone'} is typing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Smile className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No messages yet</p>
              <p className="text-xs text-muted-foreground mt-1">Start the conversation</p>
            </div>
          </div>
        )}
          </div>
        </ScrollArea>
        
        {/* Scroll to bottom button */}
        {showScrollToBottom && (
          <div className="absolute bottom-4 right-4 z-10">
            <Button
              onClick={scrollToBottom}
              className="h-10 w-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
              size="sm"
              title="Scroll to latest comments"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </Button>
          </div>
        )}
        
        {/* Fade effect at bottom when not at bottom */}
        {showScrollToBottom && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none z-0" />
        )}
      </div>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="px-4 py-2 bg-muted/50 border-t">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-primary rounded-full" />
            <div className="flex-1">
              <p className="text-xs font-medium">Replying to {replyingTo.author.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {replyingTo.text}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(null)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              placeholder="Type a message..."
              value={newComment}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              className="min-h-[40px] max-h-32 resize-none pr-10"
              rows={1}
            />
            
            {/* Emoji picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 p-2 bg-background border rounded-lg shadow-lg">
                <div className="flex gap-1">
                  {emojis.map((emoji) => (
                    <Button
                      key={emoji.name}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEmojiClick(emoji.icon)}
                      className="h-8 w-8 p-0"
                    >
                      {emoji.icon}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="h-8 w-8 p-0"
            >
              <Smile className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || isPending}
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};