import { useState } from "react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { Check, Trash2, CheckCheck, Filter } from "lucide-react";
import { useNotifications } from "~/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isMarkingAllAsRead,
  } = useNotifications({ workspaceId });

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "unread") {
      return !notification.isRead;
    }
    return true;
  });

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
      toast.success("Notification marked as read");
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast.success("All notifications marked as read");
  };

  const handleDeleteNotification = (notificationId: string) => {
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
    return `/dashboard?workspaceId=${workspaceId}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
              className="h-8"
            >
              All
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("unread")}
              className="h-8"
            >
              Unread
            </Button>
          </div>
          
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAllAsRead}
              className="h-8"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-semibold mb-2">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </h3>
            <p className="text-muted-foreground text-center">
              {filter === "unread" 
                ? "You're all caught up! Check back later for new notifications."
                : "When you get assigned to tasks or receive updates, they'll appear here."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card 
              key={notification._id} 
              className={`transition-all hover:shadow-md ${
                !notification.isRead ? "border-primary/20 bg-primary/5" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-muted-foreground mb-3">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage 
                                src={notification.sender.profilePicture} 
                                alt={notification.sender.name}
                              />
                              <AvatarFallback className="text-xs">
                                {notification.sender.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>{notification.sender.name}</span>
                          </div>
                          
                          <Separator orientation="vertical" className="h-4" />
                          
                          <span>
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                          
                          {notification.workspace && (
                            <>
                              <Separator orientation="vertical" className="h-4" />
                              <span className="text-xs bg-muted px-2 py-1 rounded">
                                {notification.workspace.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-4">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              markAsRead(notification._id);
                              toast.success("Notification marked as read");
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNotification(notification._id)}
                          className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {notification.data.taskId && (
                      <div className="mt-3">
                        <Link
                          to={getNotificationLink(notification)}
                          onClick={() => handleNotificationClick(notification)}
                          className="inline-flex items-center text-sm text-primary hover:text-primary/80"
                        >
                          View task →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
