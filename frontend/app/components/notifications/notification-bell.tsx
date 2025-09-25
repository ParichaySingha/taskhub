import { Bell, Check, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useNotifications } from "~/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { toast } from "sonner";

interface NotificationBellProps {
  workspaceId?: string;
}

export const NotificationBell = ({ workspaceId }: NotificationBellProps) => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isMarkingAllAsRead,
  } = useNotifications({ workspaceId });

  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
      toast.success("Notification marked as read");
    }
    setIsOpen(false);
    
    // Navigate to the correct URL
    const link = getNotificationLink(notification);
    navigate(link);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast.success("All notifications marked as read");
  };

  const handleDeleteNotification = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    deleteNotification(notificationId);
    toast.success("Notification deleted successfully");
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task_assigned":
        return "📋";
      case "task_updated":
        return "✏️";
      case "task_commented":
        return "💬";
      case "task_status_changed":
        return "🔄";
      case "project_created":
        return "📁";
      case "workspace_invite":
        return "👥";
      case "mention":
        return "👤";
      default:
        return "🔔";
    }
  };

  const getNotificationLink = (notification: any) => {
    if (notification.data.taskId && notification.data.projectId && notification.data.workspaceId) {
      return `/dashboard/workspaces/${String(notification.data.workspaceId)}/projects/${String(notification.data.projectId)}/tasks/${String(notification.data.taskId)}`;
    }
    if (notification.data.projectId && notification.data.workspaceId) {
      return `/dashboard/workspaces/${String(notification.data.workspaceId)}/projects/${String(notification.data.projectId)}`;
    }
    if (notification.data.workspaceId) {
      return `/dashboard/workspaces/${String(notification.data.workspaceId)}`;
    }
    return "/dashboard";
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4 pb-2">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAllAsRead}
                className="text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <Separator />

        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`relative group p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors ${
                    !notification.isRead ? "bg-accent/50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <span className="text-lg">
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Avatar className="h-4 w-4">
                              <AvatarImage 
                                src={notification.sender.profilePicture} 
                                alt={notification.sender.name}
                              />
                              <AvatarFallback className="text-xs">
                                {notification.sender.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {notification.sender.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              • {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteNotification(e, notification._id)}
                            className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {!notification.isRead && (
                        <div className="absolute top-3 right-3 h-2 w-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Link
                to="/notifications"
                className="block w-full text-center text-sm text-primary hover:text-primary/80 py-2"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
