import type { Project } from "~/types";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
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

interface ProjectCardProps {
  project: Project;
  progress: number;
  workspaceId: string;
  workspaceMembers?: any[];
}

export const ProjectCard = ({
  project,
  progress,
  workspaceId,
  workspaceMembers = [],
}: ProjectCardProps) => {
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
      <Card className="transition-all duration-300 hover:shadow-md hover:translate-y-1 group">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Link to={`/dashboard/workspaces/${workspaceId}/projects/${project._id}`}>
              <CardTitle className="hover:text-primary transition-colors">
                {project.title}
              </CardTitle>
            </Link>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-xs rounded-full",
                  getTaskStatusColor(project.status)
                )}
              >
                {project.status}
              </span>
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
          <CardDescription className="line-clamp-2">
            {project.description && project.description.trim() !== "" 
              ? project.description 
              : "No description provided"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>

              <Progress value={progress} className="h-2" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm gap-2 text-muted-foreground">
                <span>{project.tasks?.length || 0}</span>
                <span>Tasks</span>
              </div>

              {project.dueDate && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <CalendarDays className="w-4 h-4" />
                  <span>{format(project.dueDate, "MMM d, yyyy")}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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