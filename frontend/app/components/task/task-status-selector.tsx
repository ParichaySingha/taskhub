import type { TaskStatus, Task } from "~/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useUpdateTaskStatusMutation } from "~/hooks/use-task";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Shield, Clock } from "lucide-react";

export const TaskStatusSelector = ({
  status,
  taskId,
  task,
}: {
  status: TaskStatus;
  taskId: string;
  task?: Task;
}) => {
  const { mutate, isPending } = useUpdateTaskStatusMutation();

  const handleStatusChange = (value: string) => {
    mutate(
      { taskId, status: value as TaskStatus },
      {
        onSuccess: (response) => {
          if (response.requiresVerification) {
            toast.success("Status change request submitted for verification");
          } else {
            toast.success("Status updated successfully");
          }
        },
        onError: (error: any) => {
          const errorMessage = error.response.data.message;
          toast.error(errorMessage);
          console.log(error);
        },
      }
    );
  };
  return (
    <div className="flex items-center gap-2">
      <Select value={status || ""} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[180px]" disabled={isPending}>
          <SelectValue placeholder="Status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="To Do">To Do</SelectItem>
          <SelectItem value="In Progress">In Progress</SelectItem>
          <SelectItem value="Testing">Testing</SelectItem>
          <SelectItem value="Done">Done</SelectItem>
          <SelectItem value="Archive">Archive</SelectItem>
        </SelectContent>
      </Select>
      
      {task?.requiresVerification && (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span className="text-xs">Under Verification</span>
        </Badge>
      )}
    </div>
  );
};