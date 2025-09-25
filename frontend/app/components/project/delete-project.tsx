import { toast } from "sonner";
import { UseDeleteProject } from "~/hooks/use-project";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { AlertTriangle } from "lucide-react";
import type { Project } from "~/types";

interface DeleteProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  onSuccess?: () => void;
}

export const DeleteProjectDialog = ({
  isOpen,
  onOpenChange,
  project,
  onSuccess,
}: DeleteProjectDialogProps) => {
  const { mutate, isPending } = UseDeleteProject();

  const handleDelete = () => {
    mutate(project._id, {
      onSuccess: () => {
        toast.success("Project deleted successfully");
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error: any) => {
        const errorMessage = error.response.data.message;
        toast.error(errorMessage);
        console.log(error);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>Delete Project</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the project and all associated tasks.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-2">Project: {project.title}</h4>
            <p className="text-sm text-red-700">
              This will delete:
            </p>
            <ul className="text-sm text-red-700 mt-2 space-y-1">
              <li>• The project and all its data</li>
              <li>• All tasks associated with this project</li>
              <li>• All project members and their assignments</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
