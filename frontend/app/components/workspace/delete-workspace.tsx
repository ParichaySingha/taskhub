import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { useDeleteWorkspaceMutation } from "~/hooks/use-workspace";
import { useQueryClient } from "@tanstack/react-query";
import type { Workspace } from "~/types";

interface DeleteWorkspaceProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace;
}

export const DeleteWorkspace = ({
  isOpen,
  onOpenChange,
  workspace,
}: DeleteWorkspaceProps) => {
  const [confirmText, setConfirmText] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: deleteWorkspace, isPending } = useDeleteWorkspaceMutation();

  const isConfirmTextValid = confirmText === workspace.name;

  // Reset confirmation text when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setConfirmText("");
    }
  }, [isOpen]);

  const handleDelete = () => {
    if (!isConfirmTextValid) return;

    // Optimistically update the cache
    queryClient.setQueryData(["workspaces"], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        workspaces: old.workspaces.filter((ws: Workspace) => ws._id !== workspace._id)
      };
    });

    deleteWorkspace(workspace._id, {
      onSuccess: () => {
        onOpenChange(false);
        setConfirmText("");
        toast.success("Workspace deleted successfully");
        navigate("/dashboard/workspaces");
      },
      onError: (error: any) => {
        // Revert optimistic update on error
        queryClient.invalidateQueries({ queryKey: ["workspaces"] });
        const errorMessage = error.response?.data?.message || "Something went wrong";
        toast.error(errorMessage);
        console.log(error);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange} modal>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Workspace</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the workspace{" "}
            <strong>{workspace.name}</strong> and all of its projects and tasks.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              Type <strong>{workspace.name}</strong> to confirm deletion:
            </label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={workspace.name}
              className="mt-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmTextValid || isPending}
          >
            {isPending ? "Deleting..." : "Delete Workspace"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
