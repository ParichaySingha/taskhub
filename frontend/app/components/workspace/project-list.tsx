import type { Project } from "~/types";
import { NoDataFound } from "./no-data-found";
import { ProjectCard } from "../project/projetc-card";
import { ProjectListItem } from "../project/project-list-item";
import { ViewToggle } from "../ui/view-toggle";
import { getProjectProgress } from "~/lib";
import { useViewPreference } from "~/hooks/use-view-preference";

interface ProjectListProps {
  workspaceId: string;
  projects: Project[];
  workspaceMembers?: any[];
  onCreateProject: () => void;
}

export const ProjectList = ({
  workspaceId,
  projects,
  workspaceMembers = [],
  onCreateProject,
}: ProjectListProps) => {
  const [viewMode, setViewMode] = useViewPreference("project-view-mode", "grid");

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-medium">Projects</h3>
        <ViewToggle 
          currentView={viewMode} 
          onViewChange={setViewMode}
        />
      </div>
      
      {projects.length === 0 ? (
        <NoDataFound
          title="No projects found"
          description="Create a project to get started"
          buttonText="Create Project"
          buttonAction={onCreateProject}
        />
      ) : (
        <div className={
          viewMode === "grid" 
            ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" 
            : "space-y-4"
        }>
          {projects.map((project) => {
            const projectProgress = getProjectProgress(project.tasks || []);

            return viewMode === "grid" ? (
              <ProjectCard
                key={project._id}
                project={project}
                progress={projectProgress}
                workspaceId={workspaceId}
                workspaceMembers={workspaceMembers}
              />
            ) : (
              <ProjectListItem
                key={project._id}
                project={project}
                progress={projectProgress}
                workspaceId={workspaceId}
                workspaceMembers={workspaceMembers}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};