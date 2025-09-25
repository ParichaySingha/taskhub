import type { TaskStatus, Task, ProjectStatus } from "~/types";

export const publicRoutes = [
  "/sign-in", 
  "/sign-up", 
  "/verify-email",
  "/reset-password",
  "/forgot-password",
  "/"];

export const getTaskStatusColor = (status: string) => {
  const statusColors = {
    "Planning": "bg-blue-100 text-blue-800 px-2 py-1",
    "In Progress": "bg-yellow-100 text-yellow-800 px-2 py-1", 
    "On Hold": "bg-gray-100 text-gray-800 px-2 py-1",
    "Completed": "bg-green-100 text-green-800 px-2 py-1",
    "Cancelled": "bg-red-100 text-red-800 px-2 py-1"
  };
  return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800 px-2 py-1";
};
export const getProjectProgress = (tasks: { status: TaskStatus; isArchived?: boolean }[]) => {
  // Handle edge cases
  if (!tasks || !Array.isArray(tasks)) {
    return 0;
  }

  const totalTasks = tasks.length;

  // If no tasks, return 0 progress
  if (totalTasks === 0) {
    return 0;
  }

  // Filter out archived tasks and count completed tasks
  const activeTasks = tasks.filter((task) => !task.isArchived);
  const completedTasks = activeTasks.filter((task) => task?.status === "Done").length;

  // Calculate progress based on active tasks only
  const progress = activeTasks.length > 0 
    ? Math.round((completedTasks / activeTasks.length) * 100) 
    : 0;
  
  return progress;
};