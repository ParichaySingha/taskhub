import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "task_assigned",
        "task_updated",
        "task_commented",
        "task_status_changed",
        "project_created",
        "workspace_invite",
        "mention"
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      // Additional data for the notification
      taskId: { type: Schema.Types.ObjectId, ref: "Task" },
      projectId: { type: Schema.Types.ObjectId, ref: "Project" },
      workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace" },
      commentId: { type: Schema.Types.ObjectId, ref: "Comment" },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ workspace: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
