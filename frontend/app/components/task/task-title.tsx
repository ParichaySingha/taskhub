import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Edit } from "lucide-react";
import { toast } from "sonner";
import { useUpdateTaskTitleMutation } from "~/hooks/use-task";

export const TaskTitle = ({
  title,
  taskId,
}: {
  title: string;
  taskId: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const { mutate, isPending } = useUpdateTaskTitleMutation();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditing && e.key === "Escape") {
        setIsEditing(false);
        setNewTitle(title);
      }
    };

    if (isEditing) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEditing, title]);
  const updateTitle = () => {
    mutate(
      { taskId, title: newTitle },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Title updated successfully");
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
          <Input
            className="text-xl font-semibold flex-1"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={isPending}
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={updateTitle}
              disabled={isPending}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setNewTitle(title);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 group">
          <h2 className="text-xl font-semibold flex-1">{title}</h2>
          <Edit
            className="size-4 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setIsEditing(true)}
          />
        </div>
      )}
    </div>
  );
};