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
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postData } from "~/lib/fetch-util";

interface CreateWorkspaceProps {
  setIsCreatingWorkspace: (isCreatingWorkspace: boolean) => void;
  isCreatingWorkspace: boolean;
}

// Color options
export const colorOptions = [
  "#FF5733", // Vibrant Orange-Red
  "#33FF57", // Bright Green
  "#3357FF", // Strong Blue
  "#FF33A1", // Hot Pink
  "#A133FF", // Purple
  "#FFA133", // Orange
  "#33FFA1", // Aqua Green
  "#FFD700", // Gold
  "#00CED1", // Dark Turquoise
  "#708090", // Slate Gray
];

// Type inference for workspace form
export type WorkspaceForm = z.infer<typeof workspaceSchema>;

// Hook for creating workspace
export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WorkspaceForm) => {
      return await postData("/workspace", data);
    },
    onSuccess: () => {
      // Invalidate and refetch workspaces list
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};

export const CreateWorkspace = ({
  isCreatingWorkspace,
  setIsCreatingWorkspace,
}: CreateWorkspaceProps) => {
  const form = useForm<WorkspaceForm>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
      color: colorOptions[0],
      description: "",
    },
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate, isPending } = useCreateWorkspace();

  const onSubmit = (data: WorkspaceForm) => {
    // Create a temporary workspace for optimistic update
    const tempWorkspace = {
      _id: `temp-${Date.now()}`,
      ...data,
      members: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      projects: []
    };

    // Optimistically add to cache
    queryClient.setQueryData(["workspaces"], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        workspaces: [tempWorkspace, ...old.workspaces]
      };
    });

    mutate(data, {
      onSuccess: (response: any) => {
        // Replace temp workspace with real one
        queryClient.setQueryData(["workspaces"], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            workspaces: old.workspaces.map((ws: any) => 
              ws._id === tempWorkspace._id ? response : ws
            )
          };
        });
        
        // Close dialog and reset form
        setIsCreatingWorkspace(false);
        form.reset();
        toast.success("Workspace created successfully");
        
        // Navigate to the new workspace
        navigate(`/dashboard/workspaces/${response._id}`);
      },
      onError: (error: any) => {
        // Remove temp workspace on error
        queryClient.setQueryData(["workspaces"], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            workspaces: old.workspaces.filter((ws: any) => ws._id !== tempWorkspace._id)
          };
        });
        
        const errorMessage = error.response?.data?.message || "Something went wrong";
        toast.error(errorMessage);
        console.log(error);
      },
    });
  };

  return (
    <Dialog
      open={isCreatingWorkspace}
      onOpenChange={setIsCreatingWorkspace}
      modal
    >
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
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
                {isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
