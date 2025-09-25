import { useState } from 'react';
import { Navigate, Outlet } from 'react-router';
import { Button } from '~/components/ui/button';
import { Loader } from '~/components/loader';
import { useAuth } from '~/provider/auth-context';
import type { Workspace } from '~/types';
import { Header } from '~/components/layout/header';
import { SidebarComponent } from '~/components/layout/sidebar-component';
import { CreateWorkspace } from '~/components/workspace/create-workspace';
import { fetchData } from '~/lib/fetch-util';

export const clientLoader = async () => {
  try{
    const response = await fetchData<{ workspaces: Workspace[] }>("/workspace");
    // Backend returns { workspaces: [...] }, so we need to extract the workspaces array
    const workspaces = response.workspaces || [];
    return { workspaces };
  }catch(error){
    console.log(error);
    // Return empty array as fallback when there's an error
    return { workspaces: [] };
  }
}

const DashboardLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  const [isCreateWorkspace, setIsCreateWorkspace] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);

  if(isLoading) {
    return <Loader />
  }
  if(!isAuthenticated) {
    return <Navigate to="/sign-in" />
  }

  const handleWorkspaceSelected = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
  }

  return (
    <div className='flex h-screen w-full'>

      <SidebarComponent currentWorkspace={currentWorkspace} />

      <div className='flex flex-1 flex-col h-full'>
        <Header 
        onWorkspaceSelected={ handleWorkspaceSelected}
        selectedWorkspace={currentWorkspace}
        onCreateWorkspace={() => setIsCreateWorkspace(true)}
        />

        <main className='flex-1 overflow-y-auto h-full w-full'>
          <div className='mx-auto container px-2 sm:px-6 lg:px-8 py-0 md:py-6 w-full h-full'>
            <Outlet />
          </div>
        </main>
      </div>
      
      <CreateWorkspace
      isCreatingWorkspace={isCreateWorkspace}
      setIsCreatingWorkspace={setIsCreateWorkspace}
      />

    </div>
  )
}

export default DashboardLayout