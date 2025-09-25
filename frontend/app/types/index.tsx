export interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: Date;
  isEmailVerified: boolean;
  updatedAt: Date;
  profilePicture?: string;
  logo?: string;
}

export interface Workspace {
  projects: Project[];
  _id: string;
  name: string;
  description?: string;
  owner: User | string;
  color: string;
  members: {
    user: User;
    role: "admin" | "member" | "owner" | "viewer";
    joinedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
export enum ProjectStatus {
  PLANNING = "Planning",
  IN_PROGRESS = "In Progress",
  ON_HOLD = "On Hold",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
}

export interface Project {
  _id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  workspace: Workspace;
  startDate: Date;
  dueDate: Date;
  progress: number;
  tasks: Task[];
  members: {
    user: User;
    role: "admin" | "member" | "owner" | "viewer";
  }[];
  createdBy: User | string;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
}
export type TaskStatus = "To Do" | "In Progress" | "Testing" | "Done" | "Archive";
export type TaskPriority = "High" | "Medium" | "Low";
export enum ProjectMemberRole {
  MANAGER = "manager",
  CONTRIBUTOR = "contributor",
  VIEWER = "viewer",
}

export interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface EstimatedTime {
  value: number;
  unit: "minutes" | "hours" | "days";
}

export interface TimeTrackingSession {
  startTime: Date;
  endTime?: Date;
  duration: number;
}

export interface TimeTracking {
  isTracking: boolean;
  startTime?: Date;
  elapsedTime: number;
  sessions: TimeTrackingSession[];
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  project: Project;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  dueDate: Date;
  priority: TaskPriority;
  assignee: User | string;
  createdBy: User | string;
  assignees: User[];
  subtasks?: Subtask[];
  watchers?: User[];
  attachments?: Attachment[];
  estimatedTime?: EstimatedTime;
  timeTracking?: TimeTracking;
}

export interface Attachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
  _id: string;
}

export interface MemberProps {
  _id: string;
  user: User;
  role: "admin" | "member" | "owner" | "viewer";
  joinedAt: Date;
}

export type ResourceType =
  | "Task"
  | "Project"
  | "Workspace"
  | "Comment"
  | "User";

export type ActionType =
  | "created_task"
  | "updated_task"
  | "created_subtask"
  | "updated_subtask"
  | "completed_task"
  | "created_project"
  | "updated_project"
  | "completed_project"
  | "created_workspace"
  | "updated_workspace"
  | "added_comment"
  | "added_member"
  | "removed_member"
  | "joined_workspace"
  | "added_attachment";

export interface ActivityLog {
  _id: string;
  user: User;
  action: ActionType;
  resourceType: ResourceType;
  resourceId: string;
  description: string;
  metadata: any;
  createdAt: Date;
}

export interface CommentReaction {
  emoji: string;
  user: User;
}

export interface Comment {
  _id: string;
  author: User;
  text: string;
  createdAt: Date;
  reactions?: CommentReaction[];
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileType?: string;
    fileSize?: number;
  }[];
}

export interface StatsCardProps {
  totalProjects: number;
  totalTasks: number;
  totalProjectInProgress: number;
  totalTaskCompleted: number;
  totalTaskToDo: number;
  totalTaskInProgress: number;
  totalTaskTesting: number;
}

export interface TaskTrendsData {
  name: string;
  completed: number;
  inProgress: number;
  todo: number;
}

export interface TaskPriorityData {
  name: string;
  value: number;
  color: string;
}

export interface ProjectStatusData {
  name: string;
  value: number;
  color: string;
}

export interface WorkspaceProductivityData {
  name: string;
  completed: number;
  total: number;
  efficiency: string;
  projectStatus: string;
  projectAge: number;
}