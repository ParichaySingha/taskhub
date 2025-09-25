import express from "express";
import authMiddleware from "../middleware/auth-middleware.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from "../controllers/notification.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get notifications
router.get("/", getNotifications);

// Get unread count
router.get("/unread-count", getUnreadCount);

// Mark notification as read
router.patch("/:notificationId/read", markAsRead);

// Mark all notifications as read
router.patch("/mark-all-read", markAllAsRead);

// Delete notification
router.delete("/:notificationId", deleteNotification);

export default router;
