import express from "express";

import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import { taskSchema } from "../libs/validate-schema.js";
import {
  achievedTask,
  addComment,
  addSubTask,
  createTask,
  getActivityByResourceId,
  getArchivedTasks,
  getCalendarTasks,
  getCommentsByTaskId,
  getMyTasks,
  getTaskById,
  unarchiveTask,
  updateSubTask,
  updateTaskAssignees,
  updateTaskDescription,
  updateTaskPriority,
  updateTaskStatus,
  updateTaskTitle,
  watchTask,
  startTimeTracking,
  pauseTimeTracking,
  stopTimeTracking,
  updateTimeTracking,
  deleteTask,
  uploadAttachment,
  deleteAttachment,
  downloadAttachment,
} from "../controllers/task.js";
import authMiddleware from "../middleware/auth-middleware.js";
import { uploadSingle, handleUploadError } from "../middleware/upload-middleware.js";

const router = express.Router();

router.post(
  "/:projectId/create-task",
  authMiddleware,
  validateRequest({
    params: z.object({
      projectId: z.string(),
    }),
    body: taskSchema,
  }),
  createTask
);

router.post(
  "/:taskId/add-subtask",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ title: z.string() }),
  }),
  addSubTask
);

router.post(
  "/:taskId/add-comment",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ text: z.string() }),
  }),
  addComment
);

router.post(
  "/:taskId/watch",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
  }),
  watchTask
);

router.post(
  "/:taskId/achieved",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
  }),
  achievedTask
);

router.put(
  "/:taskId/update-subtask/:subTaskId",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string(), subTaskId: z.string() }),
    body: z.object({ completed: z.boolean() }),
  }),
  updateSubTask
);

router.put(
  "/:taskId/title",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ title: z.string() }),
  }),
  updateTaskTitle
);

router.put(
  "/:taskId/description",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ description: z.string() }),
  }),
  updateTaskDescription
);

router.put(
  "/:taskId/status",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ status: z.string() }),
  }),
  updateTaskStatus
);

router.put(
  "/:taskId/assignees",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ assignees: z.array(z.string()) }),
  }),
  updateTaskAssignees
);

router.get("/my-tasks", authMiddleware, getMyTasks);
router.get("/archived-tasks", authMiddleware, getArchivedTasks);
router.get("/calendar-tasks", authMiddleware, getCalendarTasks);
router.post("/:taskId/unarchive", authMiddleware, unarchiveTask);

router.put(
  "/:taskId/priority",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ priority: z.string() }),
  }),
  updateTaskPriority
);

router.get(
  "/:taskId",
  authMiddleware,
  validateRequest({
    params: z.object({
      taskId: z.string(),
    }),
  }),
  getTaskById
);

router.get(
  "/:resourceId/activity",
  authMiddleware,
  validateRequest({
    params: z.object({ resourceId: z.string() }),
  }),
  getActivityByResourceId
);

router.get(
  "/:taskId/comments",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
  }),
  getCommentsByTaskId
);

// Time tracking routes
router.post(
  "/:taskId/time-tracking/start",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
  }),
  startTimeTracking
);

router.post(
  "/:taskId/time-tracking/pause",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
  }),
  pauseTimeTracking
);

router.post(
  "/:taskId/time-tracking/stop",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
  }),
  stopTimeTracking
);

router.put(
  "/:taskId/time-tracking/update",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ elapsedTime: z.number() }),
  }),
  updateTimeTracking
);

router.delete(
  "/:taskId",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
  }),
  deleteTask
);

// Attachment routes
router.post(
  "/:taskId/attachments",
  authMiddleware,
  uploadSingle,
  handleUploadError,
  validateRequest({
    params: z.object({ taskId: z.string() }),
  }),
  uploadAttachment
);

router.delete(
  "/:taskId/attachments/:attachmentId",
  authMiddleware,
  validateRequest({
    params: z.object({ 
      taskId: z.string(),
      attachmentId: z.string()
    }),
  }),
  deleteAttachment
);

router.get(
  "/:taskId/attachments/:attachmentId/download",
  authMiddleware,
  validateRequest({
    params: z.object({ 
      taskId: z.string(),
      attachmentId: z.string()
    }),
  }),
  downloadAttachment
);

export default router;