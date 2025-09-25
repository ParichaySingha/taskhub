import mongoose, { Schema } from "mongoose";

const resetPasswordTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

const ResetPasswordToken = mongoose.model("ResetPasswordToken", resetPasswordTokenSchema);

export default ResetPasswordToken;
