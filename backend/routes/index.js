import express from "express";
import authRoutes from "./auth.js";
import workspaceRoutes from "./workspace.js";
import projectRoutes from "./project.js";
import userRoutes from "./user.js";
import taskRoutes from "./task.js";
import notificationRoutes from "./notification.js";

const router = express.Router();

router.use("/auth", authRoutes);

router.use("/workspace", workspaceRoutes);

router.use("/users", userRoutes);

router.use("/task", taskRoutes);

router.use("/projects", projectRoutes);

router.use("/notifications", notificationRoutes);

export default router;