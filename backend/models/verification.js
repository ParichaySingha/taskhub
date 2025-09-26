import mongoose, { Schema } from "mongoose";

const verificationSchema = new Schema(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestedFor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentStatus: {
      type: String,
      required: true,
    },
    requestedStatus: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reason: {
      type: String,
      trim: true,
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    verificationNotes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Verification = mongoose.model("Verification", verificationSchema);

export default Verification;