import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/auth/auth-layout.tsx", [
    index("routes/root/home.tsx"),
    route("/sign-in", "routes/auth/sign-in.tsx"),
    route("/sign-up", "routes/auth/sign-up.tsx"),
    route("/forgot-password", "routes/auth/forgot-password.tsx"),
    route("/reset-password", "routes/auth/reset-password.tsx"),
    route("/verify-email", "routes/auth/verify-email.tsx"),
  ]),
  layout("routes/dashboard/dashboard-layout.tsx", [
    route("/dashboard", "routes/dashboard/index.tsx"),
    route("/dashboard/workspaces", "routes/dashboard/workspaces/index.tsx"),
    route("/dashboard/workspaces/:workspaceId", "routes/dashboard/workspaces/workspace-details.tsx"),
    route("/dashboard/workspaces/:workspaceId/projects/:projectId", "routes/dashboard/project/project-details.tsx"),
    route("/dashboard/workspaces/:workspaceId/projects/:projectId/tasks/:taskId", "routes/dashboard/task/task-details.tsx"),
    route("/calendar", "routes/dashboard/calendar.tsx"),
    route("/my-tasks", "routes/dashboard/my-tasks.tsx"),
    route("/archived-tasks", "routes/dashboard/archived-tasks.tsx"),
    route("/notifications", "routes/dashboard/notifications.tsx"),
    route("/members", "routes/dashboard/members.tsx"),
    route("/verifications", "routes/dashboard/verifications.tsx"),
    route("/settings", "routes/dashboard/settings.tsx"),
  ]),

  route(
    "workspace-invite/:workspaceId",
    "routes/dashboard/workspaces/workspace-invite.tsx"
  ),
  layout("routes/user/user-layout.tsx", [
    route("/user/profile", "routes/user/profile.tsx"),
  ]),
  
] satisfies RouteConfig;
