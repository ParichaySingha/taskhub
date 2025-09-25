import { formatDistanceToNow } from "date-fns";
import { Eye, EyeOff, Loader, Paperclip } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { BackButton } from "~/components/back-button";
import { CommentSection } from "~/components/task/comment-section";
import { SubTasksDetails } from "~/components/task/sub-tasks";
import { TaskActivity } from "~/components/task/task-activity";
import { TaskAssigneesSelector } from "~/components/task/task-assignees-selector";
import { TaskDescription } from "~/components/task/task-description";
import { TaskPrioritySelector } from "~/components/task/task-priority-selector";
import { TaskStatusSelector } from "~/components/task/task-status-selector";
import { TaskTitle } from "~/components/task/task-title";
import { Watchers } from "~/components/task/watchers";
import { EstimatedTimeDisplay } from "~/components/task/estimated-time-display";
import { DeleteTaskDialog } from "~/components/task/delete-task";
import { TaskAttachments } from "~/components/task/task-attachments";
import { AttachmentUpload } from "~/components/task/attachment-upload";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { useAchievedTaskMutation, useTaskByIdQuery, useWatchTaskMutation } from "~/hooks/use-task";
import { useAuth } from "~/provider/auth-context";
import type { Project, Task } from "~/types";
import { useState } from "react";


const TaskDetails = () => {
  const { user } = useAuth();
  const { taskId, projectId, workspaceId } = useParams<{
    taskId: string;
    projectId: string;
    workspaceId: string;
  }>();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const { data, isLoading } = useTaskByIdQuery(taskId!) as {
    data: {
      task: Task;
      project: Project;
    };
    isLoading: boolean;
  };
  const { mutate: watchTask, isPending: isWatching } = useWatchTaskMutation();
  const { mutate: achievedTask, isPending: isAchieved } =
    useAchievedTaskMutation();

  if (isLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-bold">Task not found</div>
      </div>
    );
  }

  const { task, project } = data;
  const isUserWatching = task?.watchers?.some(
    (watcher) => watcher._id.toString() === user?._id.toString()
  );

  const goBack = () => navigate(-1);

  const handleDeleteSuccess = () => {
    // Navigate back to project after successful deletion
    navigate(`/dashboard/workspaces/${workspaceId}/projects/${projectId}`);
  };

  const members = task?.assignees || [];

  const handleWatchTask = () => {
    watchTask(
      { taskId: task._id },
      {
        onSuccess: () => {
          toast.success("Task watched");
        },
        onError: () => {
          toast.error("Failed to watch task");
        },
      }
    );
  };

  const handleAchievedTask = () => {
    achievedTask(
      { taskId: task._id },
      {
        onSuccess: () => {
          toast.success("Task achieved");
        },
        onError: () => {
          toast.error("Failed to achieve task");
        },
      }
    );
  };

  return (
    <div className="container mx-auto p-0 py-4 md:px-4">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div className="flex flex-col md:flex-row md:items-center">
          <BackButton />

          <h1 className="text-xl md:text-2xl font-bold">{task.title}</h1>

          {task.isArchived && (
            <Badge className="ml-2" variant={"outline"}>
              Archived
            </Badge>
          )}
        </div>

        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button
            variant={"outline"}
            size="sm"
            onClick={handleWatchTask}
            className="w-fit"
            disabled={isWatching}
          >
            {isUserWatching ? (
              <>
                <EyeOff className="mr-2 size-4" />
                Unwatch
              </>
            ) : (
              <>
                <Eye className="mr-2 size-4" />
                Watch
              </>
            )}
          </Button>

          <Button
            variant={"outline"}
            size="sm"
            onClick={handleAchievedTask}
            className="w-fit"
            disabled={isAchieved}
          >
            {task.isArchived ? "Unarchive" : "Archive"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content - 70% */}
        <div className="lg:w-[70%] w-full">
          <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
            <div className="space-y-4 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <Badge
                    variant={
                      task.priority === "High"
                        ? "destructive"
                        : task.priority === "Medium"
                        ? "default"
                        : "outline"
                    }
                    className="mb-2 capitalize"
                  >
                    {task.priority} Priority
                  </Badge>

                  <TaskTitle title={task.title} taskId={task._id} />

                  <div className="text-sm md:text-base text-muted-foreground mt-2">
                    Created at:{" "}
                    {formatDistanceToNow(new Date(task.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <TaskStatusSelector status={task.status} taskId={task._id} />

                  <Button
                    variant={"destructive"}
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="hidden md:flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete Task</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Description
              </h3>

              <TaskDescription
                description={task.description || ""}
                taskId={task._id}
              />
            </div>

            <TaskAssigneesSelector
              task={task}
              assignees={task.assignees}
              projectMembers={project.members as any}
            />

            <TaskPrioritySelector priority={task.priority} taskId={task._id} />

            <SubTasksDetails subTasks={task.subtasks || []} taskId={task._id} />

            <TaskAttachments 
              attachments={task.attachments || []} 
              taskId={task._id}
              onUpload={() => setIsUploadDialogOpen(true)}
            />
          </div>

          <CommentSection taskId={task._id} members={project.members as any} />
        </div>

        {/* Right sidebar - 30% */}
        <div className="lg:w-[30%] w-full lg:min-w-0 min-w-full lg:max-w-[30%]">
          <div className="space-y-4 sticky top-4">
            <EstimatedTimeDisplay 
              estimatedTime={task.estimatedTime} 
              taskId={task._id}
              timeTracking={task.timeTracking}
            />
            <Watchers watchers={task.watchers || []} />
            <TaskActivity resourceId={task._id} />
          </div>
        </div>
      </div>

      <DeleteTaskDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        task={task}
        onSuccess={handleDeleteSuccess}
      />

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Paperclip className="h-5 w-5" />
              <span>Upload Attachments</span>
            </DialogTitle>
          </DialogHeader>
          <AttachmentUpload
            taskId={task._id}
            onClose={() => setIsUploadDialogOpen(false)}
            onSuccess={() => {
              toast.success("Attachments uploaded successfully");
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskDetails;