import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { useAuth } from "~/provider/auth-context";
import { fetchData, postData, updateData, patchData, deleteData } from "~/lib/fetch-util";

export interface Notification {
  _id: string;
  recipient: string;
  sender: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  type: string;
  title: string;
  message: string;
  data: {
    taskId?: string;
    projectId?: string;
    workspaceId?: string;
    commentId?: string;
  };
  isRead: boolean;
  readAt?: string;
  workspace: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
  unreadCount: number;
}

interface UseNotificationsProps {
  workspaceId?: string;
}

export const useNotifications = ({ workspaceId }: UseNotificationsProps = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get notifications
  const {
    data: notificationsData,
    isLoading: isLoadingNotifications,
    error: notificationsError,
  } = useQuery<NotificationsResponse>({
    queryKey: ["notifications", workspaceId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (workspaceId) params.append("workspaceId", workspaceId);
      
      return fetchData(`/notifications?${params.toString()}`);
    },
    enabled: !!user,
  });

  // Get unread count
  const {
    data: unreadCountData,
    refetch: refetchUnreadCount,
  } = useQuery<{ unreadCount: number }>({
    queryKey: ["notifications", "unread-count", workspaceId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (workspaceId) params.append("workspaceId", workspaceId);
      
      return fetchData(`/notifications/unread-count?${params.toString()}`);
    },
    enabled: !!user,
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return patchData(`/notifications/${notificationId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      refetchUnreadCount();
    },
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return patchData(`/notifications/mark-all-read`, { workspaceId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      refetchUnreadCount();
    },
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return deleteData(`/notifications/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      refetchUnreadCount();
    },
  });

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    const newSocket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000", {
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("Connected to notification server");
      newSocket.emit("join-user-room", user._id);
    });

    newSocket.on("new-notification", (notification: Notification) => {
      console.log("New notification received:", notification);
      
      // Update the notifications cache
      queryClient.setQueryData(
        ["notifications", workspaceId],
        (oldData: NotificationsResponse | undefined) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            notifications: [notification, ...oldData.notifications],
            unreadCount: oldData.unreadCount + 1,
          };
        }
      );
      
      // Update unread count
      setUnreadCount(prev => prev + 1);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from notification server");
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user, queryClient, workspaceId]);

  // Join workspace room when workspace changes
  useEffect(() => {
    if (socket && workspaceId) {
      socket.emit("join-workspace", workspaceId);
    }
  }, [socket, workspaceId]);

  // Update unread count from query
  useEffect(() => {
    if (unreadCountData) {
      setUnreadCount(unreadCountData.unreadCount);
    }
  }, [unreadCountData]);

  const markAsRead = useCallback(
    (notificationId: string) => {
      markAsReadMutation.mutate(notificationId);
    },
    [markAsReadMutation]
  );

  const markAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  const deleteNotification = useCallback(
    (notificationId: string) => {
      deleteNotificationMutation.mutate(notificationId);
    },
    [deleteNotificationMutation]
  );

  return {
    notifications: notificationsData?.notifications || [],
    unreadCount,
    isLoading: isLoadingNotifications,
    error: notificationsError,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
  };
};
