import { Grid3X3, List } from "lucide-react";
import { Button } from "./button";
import { cn } from "~/lib/utils";

interface ViewToggleProps {
  currentView: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
  className?: string;
}

export const ViewToggle = ({ 
  currentView, 
  onViewChange, 
  className 
}: ViewToggleProps) => {
  return (
    <div className={cn("flex items-center border rounded-lg p-1 bg-background", className)}>
      <Button
        variant={currentView === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("grid")}
        className={cn(
          "h-8 w-8 p-0",
          currentView === "grid" 
            ? "bg-primary text-primary-foreground shadow-sm" 
            : "hover:bg-muted"
        )}
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant={currentView === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("list")}
        className={cn(
          "h-8 w-8 p-0",
          currentView === "list" 
            ? "bg-primary text-primary-foreground shadow-sm" 
            : "hover:bg-muted"
        )}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
};
