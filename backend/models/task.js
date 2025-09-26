import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Testing", "Done", "Archive"],
      default: "To Do",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    assignees: [{ type: Schema.Types.ObjectId, ref: "User" }],
    watchers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    dueDate: { type: Date },
    completedAt: { type: Date },
    estimatedTime: {
      value: { type: Number, min: 1 },
      unit: { type: String, enum: ["minutes", "hours", "days"], default: "hours" }
    },
    timeTracking: {
      isTracking: { type: Boolean, default: false },
      startTime: { type: Date },
      elapsedTime: { type: Number, default: 0 }, // in seconds
      sessions: [{
        startTime: { type: Date, required: true },
        endTime: { type: Date },
        duration: { type: Number, default: 0 } // in seconds
      }]
    },
    estimatedHours: { type: Number, min: 0 },
    actualHours: { type: Number, min: 0 },
    tags: [{ type: String }],
    subtasks: [
      {
        title: {
          type: String,
          required: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    attachments: [
      {
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileType: { type: String },
        fileSize: { type: Number },
        uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isArchived: { type: Boolean, default: false },
    requiresVerification: { type: Boolean, default: false },
    pendingVerification: {
      type: Schema.Types.ObjectId,
      ref: "Verification",
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;