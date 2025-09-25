import { Separator } from "~/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div className="px-4 md:px-0">
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your workspace settings and preferences.
        </p>
      </div>

      <Separator />

      <div className="text-center py-8">
        <p className="text-muted-foreground">Under development</p>
      </div>
    </div>
  );
}
