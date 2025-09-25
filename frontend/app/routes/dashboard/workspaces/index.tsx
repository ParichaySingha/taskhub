import { PlusCircle, Users, Edit, Trash2, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Link, useLoaderData } from "react-router"
import { Loader } from "~/components/loader";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { ViewToggle } from "~/components/ui/view-toggle";
import { CreateWorkspace } from "~/components/workspace/create-workspace";
import { EditWorkspace } from "~/components/workspace/edit-workspace";
import { DeleteWorkspace } from "~/components/workspace/delete-workspace";
import { NoDataFound } from "~/components/workspace/no-data-found";
import { WorkspaceAvatar } from "~/components/workspace/workspace-avatar";
import { WorkspaceListItem } from "~/components/workspace/workspace-list-item";
import { useGetWorkspacesQuery, useUpdateWorkspaceMutation, useDeleteWorkspaceMutation } from "~/hooks/use-workspace";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { useViewPreference } from "~/hooks/use-view-preference";
import type { Workspace } from "~/types";

const Workspaces = () => {
  const [viewMode, setViewMode] = useViewPreference("workspace-view-mode", "grid");
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [isEditingWorkspace, setIsEditingWorkspace] = useState(false);
  const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

  const queryClient = useQueryClient();
  const { data: workspaces, isLoading } = useGetWorkspacesQuery() as { 
    data: { workspaces: Workspace[] },
    isLoading: boolean
  };

  const handleEdit = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setIsEditingWorkspace(true);
  };

  const handleDelete = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setIsDeletingWorkspace(true);
  };

  const handleCloseEdit = (open: boolean) => {
    setIsEditingWorkspace(open);
    if (!open) {
      setSelectedWorkspace(null);
    }
  };

  const handleCloseDelete = (open: boolean) => {
    setIsDeletingWorkspace(open);
    if (!open) {
      setSelectedWorkspace(null);
    }
  };

  const handleCloseCreate = (open: boolean) => {
    setIsCreatingWorkspace(open);
    // If closing, ensure we're not in a creating state
    if (!open) {
      // Additional cleanup if needed
    }
  };

  // Optimistic delete function
  const handleOptimisticDelete = (workspaceId: string) => {
    // Optimistically update the cache
    queryClient.setQueryData(["workspaces"], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        workspaces: old.workspaces.filter((ws: Workspace) => ws._id !== workspaceId)
      };
    });
  };

  if(isLoading) {
    return <Loader />
  }

  return (
    <>
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-3xl font-bold">Workspaces</h1>
        <div className="flex items-center gap-4">
          <ViewToggle 
            currentView={viewMode} 
            onViewChange={setViewMode}
          />
          <Button onClick={() => setIsCreatingWorkspace(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Workspace
          </Button>
        </div>
      </div>

      {workspaces.workspaces.length === 0 ? (
        <NoDataFound 
          title={"No workspaces found"} 
          description={"Create a new workspace to get started"} 
          buttonText={"Create Workspace"} 
          buttonAction={() => setIsCreatingWorkspace(true)}
        />
      ) : (
        <div className={
          viewMode === "grid" 
            ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" 
            : "space-y-4"
        }>
          {workspaces.workspaces.map((ws) => 
            viewMode === "grid" ? (
              <WorkspaceCard 
                key={ws._id} 
                workspace={ws} 
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <WorkspaceListItem
                key={ws._id}
                workspace={ws}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )
          )}
        </div>
      )}

    </div>

    <CreateWorkspace
    key={isCreatingWorkspace ? 'open' : 'closed'}
    isCreatingWorkspace={isCreatingWorkspace}
    setIsCreatingWorkspace={handleCloseCreate}
    />

    {selectedWorkspace && (
      <>
        <EditWorkspace
          isOpen={isEditingWorkspace}
          onOpenChange={handleCloseEdit}
          workspace={selectedWorkspace}
        />
        
        <DeleteWorkspace
          isOpen={isDeletingWorkspace}
          onOpenChange={handleCloseDelete}
          workspace={selectedWorkspace}
        />
      </>
    )}
    </>
  )
}

const WorkspaceCard = ({ 
  workspace, 
  onEdit, 
  onDelete 
}: { 
  workspace: Workspace;
  onEdit: (workspace: Workspace) => void;
  onDelete: (workspace: Workspace) => void;
}) => {
  return (
    <Card className="group relative transition-all hover:shadow-md hover:-translate-y-1">
      <Link to={`/dashboard/workspaces/${workspace._id}`} className="block">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <WorkspaceAvatar name={workspace.name} color={workspace.color}  />

              <div>
                <CardTitle>{workspace.name}</CardTitle>
                <span className="text-sm text-muted-foreground">
                  Created at {format(new Date(workspace.createdAt), "MMM d, yyyy hh:mm a")}
                </span>
              </div>

            </div>

            <div className="flex items-center text-muted-foreground">
              <Users className="size-4 mr-1" />
              <span className="text-xs">{workspace.members.length}</span>
            </div>
          </div>

        <CardDescription>
          {workspace.description || "No description"}
        </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="text-sm text-muted-foreground">
            View workspace details and projects
          </div>
        </CardContent>
      </Link>

      {/* Hover Actions */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(workspace);
            }}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(workspace);
              }}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};

export default Workspaces