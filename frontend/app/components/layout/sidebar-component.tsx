import { Archive, Bell, Calendar, CheckCircle2, ChevronsLeft, ChevronsRight, LayoutDashboard, ListCheck, LogOut, Settings, Users, Wrench } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";
import { useAuth } from "~/provider/auth-context";
import type { Workspace } from "~/types";
import { Button } from "../ui/button";
import { Link } from "react-router";
import { ScrollArea } from "../ui/scroll-area";
import { SidebarNav } from "./sidebar-nav";

interface SidebarComponentProps {
  currentWorkspace: Workspace | null;
}

export const SidebarComponent = ({ 
  currentWorkspace,
}: {
  currentWorkspace: Workspace | null;
}) => {

  const {user, logout} = useAuth();

  const [isCreateWorkspace, setIsCreateWorkspace] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "Workspaces",
      icon: Users,
      href: "/dashboard/workspaces",
    },
    {
      title: "Calendar",
      icon: Calendar,
      href: "/calendar",
    },
    {
      title: "My Tasks",
      icon: ListCheck,
      href: "/my-tasks",
    },
    {
      title: "Notifications",
      icon: Bell,
      href: "/notifications",
    },
    {
      title: "Members",
      icon: Users,
      href: "/members",
    },
    {
      title: "Archived",
      icon: Archive,
      href: "/archived-tasks",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    }
  ]

  return (
    <div
    className={cn("flex flex-col border-r bg-sidebar transition-all duration-300",
      isCollapsed ? "w-16 md:w[80px]" : "w-16 md:w-[240px]"
    )}
    >
      <div className='flex h-16 items-center border-b px-2 mb-4 relative'>
        <Link to="/dashboard" className="flex items-center w-full h-full">
          {!isCollapsed && (
            <div className="flex items-center w-full h-full px-2">
              {user?.logo ? (
                <img 
                  src={user.logo} 
                  alt="Logo" 
                  className="w-full h-full max-h-12 object-contain"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Wrench className="size-6 text-blue-600"/>
                  <span className="font-semibold text-lg hidden md:block">TaskHub</span>
                </div>
              )}
            </div>
          )}

          {isCollapsed && (
            <div className="flex items-center justify-center w-full h-full">
              {user?.logo ? (
                <img 
                  src={user.logo} 
                  alt="Logo" 
                  className="w-full h-full max-h-12 object-contain"
                />
              ) : (
                <Wrench className="size-6 text-blue-600"/>
              )}
            </div>
          )}
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 hidden md:block z-10"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {
            isCollapsed ? (
              <ChevronsRight className="size-4"/>
            ) : (
              <ChevronsLeft className="size-4"/>
            )
          }
        </Button>
      </div>

      <ScrollArea>
        <SidebarNav
        items={navItems}
        isCollapsed={isCollapsed}
        className={cn(isCollapsed && "items-center space-y-2")}
        currentWorkspace={currentWorkspace}
        />
      </ScrollArea>

      <div className="mt-auto border-t p-2">
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "default"}
          onClick={logout}
          className="w-full justify-start"
        >
          <LogOut className={cn("size-4", isCollapsed && "mr-2")} />
          {!isCollapsed && <span className="hidden md:block">Logout</span>}
        </Button>
      </div>
    </div>
  )
}