import { Users, Edit, Trash2, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { cn } from "~/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { WorkspaceAvatar } from "./workspace-avatar";
import type { Workspace } from "~/types";

interface WorkspaceListItemProps {
  workspace: Workspace;
  onEdit: (workspace: Workspace) => void;
  onDelete: (workspace: Workspace) => void;
}

export const WorkspaceListItem = ({
  workspace,
  onEdit,
  onDelete,
}: WorkspaceListItemProps) => {
  return (
    <div className="group border rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:bg-muted/50">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left side - Workspace info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
            <div className="flex items-center gap-3">
              <WorkspaceAvatar name={workspace.name} color={workspace.color} />
              <div className="flex-1 min-w-0">
                <Link 
                  to={`/dashboard/workspaces/${workspace._id}`}
                  className="hover:text-primary transition-colors"
                >
                  <h3 className="font-semibold text-lg truncate">
                    {workspace.name}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground">
                  Created at {format(new Date(workspace.createdAt), "MMM d, yyyy hh:mm a")}
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
            {workspace.description || "No description"}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Members:</span>
              <span className="font-medium">{workspace.members.length}</span>
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center justify-between lg:justify-end gap-4 lg:ml-4">
          <div className="text-sm text-muted-foreground hidden lg:block">
            View workspace details and projects
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(workspace)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(workspace)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
