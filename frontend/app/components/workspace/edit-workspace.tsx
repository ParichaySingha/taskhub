import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type z from "zod";
import { workspaceSchema } from "~/lib/schema";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useUpdateWorkspaceMutation } from "~/hooks/use-workspace";
import { useQueryClient } from "@tanstack/react-query";
import { colorOptions, type WorkspaceForm } from "./create-workspace";
import type { Workspace } from "~/types";

interface EditWorkspaceProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace;
}

export const EditWorkspace = ({
  isOpen,
  onOpenChange,
  workspace,
}: EditWorkspaceProps) => {
  const form = useForm<WorkspaceForm>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: workspace.name,
      color: workspace.color,
      description: workspace.description || "",
    },
  });

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        name: workspace.name,
        color: workspace.color,
        description: workspace.description || "",
      });
    }
  }, [isOpen, workspace, form]);

  const queryClient = useQueryClient();
  const { mutate: updateWorkspace, isPending } = useUpdateWorkspaceMutation();

  const onSubmit = (data: WorkspaceForm) => {
    // Optimistically update the cache
    queryClient.setQueryData(["workspaces"], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        workspaces: old.workspaces.map((ws: Workspace) => 
          ws._id === workspace._id 
            ? { ...ws, ...data, updatedAt: new Date() }
            : ws
        )
      };
    });

    updateWorkspace(
      { workspaceId: workspace._id, data },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
          toast.success("Workspace updated successfully");
        },
        onError: (error: any) => {
          // Revert optimistic update on error
          queryClient.invalidateQueries({ queryKey: ["workspaces"] });
          const errorMessage = error.response?.data?.message || "Something went wrong";
          toast.error(errorMessage);
          console.log(error);
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange} modal>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Workspace</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter your workspace name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter your workspace description" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Color Picker */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 flex-wrap">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => field.onChange(color)}
                          className={`w-8 h-8 rounded-full border ${
                            field.value === color ? "ring-2 ring-offset-2 ring-blue-600" : ""
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
