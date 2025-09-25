import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const WorkspaceAvatar = ({ color, name }: { color: string, name: string }) => {
  return (
    <div className="w-6 h-6 rounded flex items-center justify-center"
    style={{
      backgroundColor: color,
    }}
    >
      <span className="text-white font-medium text-xs">
        {name.charAt(0).toUpperCase()}
        </span>
    </div>
  )
}