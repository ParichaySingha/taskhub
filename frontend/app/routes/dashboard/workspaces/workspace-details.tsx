import { useState } from "react";
import { useParams } from "react-router";
import { useGetWorkspaceQuery } from "~/hooks/use-workspace";
import type { Workspace, Project } from "~/types";
import { Loader } from "~/components/loader";
import { ProjectList } from "~/components/workspace/project-list";
import { CreateProjectDialog } from "~/components/project/create-project";
import { WorkspaceHeader } from "./workspace-header";
import { InviteMemberDialog } from "~/components/workspace/invite-member";

const WorkspaceDetails = () => {
  const {workspaceId} = useParams<{workspaceId: string}>();
  const [isCreateProject, setIsCreateProject] = useState(false);
  const [isInviteMember, setIsInviteMember] = useState(false);

  if(!workspaceId){
    return <div>No workspace found</div>
  }
  
  const { data: workspaceData, isLoading } = useGetWorkspaceQuery(workspaceId);
  

  if(isLoading) {
    return (
      <div>
        <Loader/>
      </div>
    )
  }

  if (!workspaceData?.workspace) {
    return <div>Workspace not found</div>
  }

  return (
    <div className="space-y-8">
      <WorkspaceHeader
        workspace={workspaceData.workspace}
        members={workspaceData.workspace?.members || []}
        onCreateProject={() => setIsCreateProject(true)}
        onInviteMember={() => setIsInviteMember(true)}
      />

    <ProjectList
        workspaceId={workspaceId}
        projects={workspaceData.projects}
        workspaceMembers={workspaceData.workspace.members}
        onCreateProject={() => setIsCreateProject(true)}
      />

      <CreateProjectDialog
        isOpen={isCreateProject}
        onOpenChange={setIsCreateProject}
        workspaceId={workspaceId}
        workspaceMembers={workspaceData.workspace.members as any}
      />

      <InviteMemberDialog
        isOpen={isInviteMember}
        onOpenChange={setIsInviteMember}
        workspaceId={workspaceId}
      />
    </div>
  )
}

export default WorkspaceDetails;