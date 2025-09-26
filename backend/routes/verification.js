import express from "express";
import authMiddleware from "../middleware/auth-middleware.js";
import { validateRequest } from "zod-express-middleware";
import { z } from "zod";
import {
  createVerificationRequest,
  getVerificationRequests,
  getMyVerificationRequests,
  updateVerificationStatus,
  getVerificationStats,
} from "../controllers/verification.js";

const router = express.Router();

// Create verification request
router.post(
  "/task/:taskId/request",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({
      requestedStatus: z.string(),
      reason: z.string().optional(),
    }),
  }),
  createVerificationRequest
);

// Get verification requests for the current user (as owner/manager)
router.get(
  "/requests",
  authMiddleware,
  getVerificationRequests
);

// Get verification requests made by the current user
router.get(
  "/my-requests",
  authMiddleware,
  getMyVerificationRequests
);

// Update verification status (approve/reject)
router.put(
  "/:verificationId/status",
  authMiddleware,
  validateRequest({
    params: z.object({ verificationId: z.string() }),
    body: z.object({
      status: z.enum(["approved", "rejected"]),
      verificationNotes: z.string().optional(),
    }),
  }),
  updateVerificationStatus
);

// Get verification statistics
router.get(
  "/stats",
  authMiddleware,
  getVerificationStats
);

export default router;
