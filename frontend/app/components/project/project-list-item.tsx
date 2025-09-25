import type { Project } from "~/types";
import { Link } from "react-router";
import { cn } from "~/lib/utils";
import { getTaskStatusColor } from "~/lib";
import { Progress } from "../ui/progress";
import { format } from "date-fns";
import { CalendarDays, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useState } from "react";
import { EditProjectDialog } from "./edit-project";
import { DeleteProjectDialog } from "./delete-project";
import { useNavigate } from "react-router";
import { useAuth } from "~/provider/auth-context";
import { canEditProject, canDeleteProject } from "~/lib/permissions";

interface ProjectListItemProps {
  project: Project;
  progress: number;
  workspaceId: string;
  workspaceMembers?: any[];
}

export const ProjectListItem = ({
  project,
  progress,
  workspaceId,
  workspaceMembers = [],
}: ProjectListItemProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const canEdit = canEditProject(project, user);
  const canDelete = canDeleteProject(project, user);

  const handleDeleteSuccess = () => {
    // Navigate back to workspace after successful deletion
    navigate(`/dashboard/workspaces/${workspaceId}`);
  };

  return (
    <>
      <div className="group border rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:bg-muted/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left side - Project info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <Link 
                to={`/dashboard/workspaces/${workspaceId}/projects/${project._id}`}
                className="hover:text-primary transition-colors"
              >
                <h3 className="font-semibold text-lg truncate">
                  {project.title}
                </h3>
              </Link>
              <span
                className={cn(
                  "px-2 py-1 text-xs rounded-full whitespace-nowrap w-fit",
                  getTaskStatusColor(project.status)
                )}
              >
                {project.status}
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
              {project.description && project.description.trim() !== "" 
                ? project.description 
                : "No description provided"}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Progress:</span>
                <span className="font-medium">{progress}%</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Tasks:</span>
                <span className="font-medium">{project.tasks?.length || 0}</span>
              </div>

              {project.dueDate && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <CalendarDays className="w-4 h-4" />
                  <span>{format(project.dueDate, "MMM d, yyyy")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Progress bar and actions */}
          <div className="flex items-center gap-4 lg:ml-4">
            <div className="w-32">
              <Progress value={progress} className="h-2" />
            </div>
            
            {(canEdit || canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEdit && (
                    <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem 
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      <EditProjectDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        project={project}
        workspaceMembers={workspaceMembers}
      />

      <DeleteProjectDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        project={project}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
};
