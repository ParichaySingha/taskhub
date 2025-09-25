import { useUpdateTaskDescriptionMutation } from "~/hooks/use-task";
import { Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

export const TaskDescription = ({
  description,
  taskId,
}: {
  description: string;
  taskId: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState(description);
  const { mutate, isPending } = useUpdateTaskDescriptionMutation();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditing && e.key === "Escape") {
        setIsEditing(false);
        setNewDescription(description);
      }
    };

    if (isEditing) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEditing, description]);
  const updateDescription = () => {
    mutate(
      { taskId, description: newDescription },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Description updated successfully");
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
    <div className="space-y-2">
      {isEditing ? (
        <div className="flex items-start gap-2">
          <Textarea
            className="flex-1 resize-none"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            disabled={isPending}
            autoFocus
            rows={3}
            placeholder="Enter task description..."
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={updateDescription}
              disabled={isPending}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setNewDescription(description);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2 group">
          <div className="text-sm md:text-base text-pretty flex-1 text-muted-foreground min-h-[1.5rem]">
            {description || "No description provided"}
          </div>
          <Edit
            className="size-4 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
            onClick={() => setIsEditing(true)}
          />
        </div>
      )}
    </div>
  );
};