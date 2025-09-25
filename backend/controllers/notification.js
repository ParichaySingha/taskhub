import Notification from "../models/notification.js";
import Task from "../models/task.js";
import Project from "../models/project.js";
import Workspace from "../models/workspace.js";

// Get all notifications for a user
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, workspaceId } = req.query;
    const skip = (page - 1) * limit;

    let query = { recipient: req.user._id };
    
    if (workspaceId) {
      query.workspace = workspaceId;
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'name profilePicture')
      .populate('workspace', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      ...query, 
      isRead: false 
    });

    res.status(200).json({
      notifications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
      unreadCount,
    });
  } catch (error) {
    console.log("Get notifications error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { 
        _id: notificationId, 
        recipient: req.user._id 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.log("Mark as read error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const { workspaceId } = req.body;

    let query = { recipient: req.user._id, isRead: false };
    
    if (workspaceId) {
      query.workspace = workspaceId;
    }

    await Notification.updateMany(
      query,
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.status(200).json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.log("Mark all as read error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.status(200).json({
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.log("Delete notification error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const { workspaceId } = req.query;

    let query = { recipient: req.user._id, isRead: false };
    
    if (workspaceId) {
      query.workspace = workspaceId;
    }

    const unreadCount = await Notification.countDocuments(query);

    res.status(200).json({ unreadCount });
  } catch (error) {
    console.log("Get unread count error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Create notification (internal function)
const createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    return notification;
  } catch (error) {
    console.log("Create notification error:", error);
    throw error;
  }
};

// Send real-time notification
const sendRealTimeNotification = (io, notification) => {
  try {
    // Send to user's personal room
    io.to(`user-${notification.recipient}`).emit('new-notification', notification);
    
    // Send to workspace room
    io.to(`workspace-${notification.workspace}`).emit('workspace-notification', notification);
  } catch (error) {
    console.log("Send real-time notification error:", error);
  }
};

// Create and send notification
const createAndSendNotification = async (io, notificationData) => {
  try {
    const notification = await createNotification(notificationData);
    
    // Populate the notification for sending
    const populatedNotification = await Notification.findById(notification._id)
      .populate('sender', 'name profilePicture')
      .populate('workspace', 'name');

    sendRealTimeNotification(io, populatedNotification);
    return populatedNotification;
  } catch (error) {
    console.log("Create and send notification error:", error);
    throw error;
  }
};

export {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  createNotification,
  sendRealTimeNotification,
  createAndSendNotification,
};
