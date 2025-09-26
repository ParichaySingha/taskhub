import { type LucideIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { cn } from "~/lib/utils";
import type { Workspace } from "~/types";
import { Button } from "../ui/button";

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  items: {
    title: string;
    href: string;
    icon: LucideIcon;
  }[];
  isCollapsed: boolean;
  currentWorkspace: Workspace | null;
  className?: string;
}

export const SidebarNav = ({
  items,
  isCollapsed,
  className,
  currentWorkspace,
  ...props
}: SidebarNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className={cn("flex flex-col gap-2", className)} {...props}>
      {items.map((el) => {
        const Icon = el.icon;
        const isActive = el.href === "/dashboard" 
          ? location.pathname === "/dashboard" 
          : location.pathname === el.href;

        const handleClick = () => {
          if (el.href === "/dashboard/workspaces") {
            navigate(el.href);
          } else if (el.href === "/dashboard") {
            // Dashboard should include workspace ID as query parameter
            if (currentWorkspace && currentWorkspace._id) {
              navigate(`${el.href}?workspaceId=${currentWorkspace._id}`);
            } else {
              navigate(el.href);
            }
          } else if (el.href === "/archived-tasks" || el.href === "/my-tasks" || el.href === "/members" || el.href === "/calendar" || el.href === "/notifications" || el.href === "/verifications") {
            // These routes don't need workspace ID in the path
            navigate(el.href);
          } else {
            // For all other routes, navigate directly without appending workspace ID
            navigate(el.href);
          }
        };

        return (
          <Button
            key={el.href}
            variant={isActive ? "default" : "ghost"}
            className={cn(
              "flex items-center",
              isCollapsed ? "justify-center" : "justify-start",
              isActive && "bg-blue-800/20 text-blue-600 font-medium"
            )}
            onClick={handleClick}
          >
            <Icon className="size-4" />
            {!isCollapsed && <span className="ml-2">{el.title}</span>}
          </Button>
        );
      })}
    </nav>
  );
};
