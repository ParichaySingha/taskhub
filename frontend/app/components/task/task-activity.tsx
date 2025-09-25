import { fetchData } from "~/lib/fetch-util";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "../loader";
import type { ActivityLog } from "~/types";
import { getActivityIcon } from "~/components/task/task-icon";

export const TaskActivity = ({ resourceId }: { resourceId: string }) => {
  const { data, isPending, error } = useQuery({
    queryKey: ["task-activity", resourceId],
    queryFn: () => fetchData(`/task/${resourceId}/activity`),
  }) as {
    data: ActivityLog[];
    isPending: boolean;
    error: any;
  };

  if (isPending) return <Loader />;
  
  if (error) {
    return (
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <h3 className="text-lg text-muted-foreground mb-4">Activity</h3>
        <p className="text-sm text-red-500">Error loading activity</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      <h3 className="text-lg text-muted-foreground mb-4">Activity</h3>

      <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="space-y-4 pr-2">
          {data && data.length > 0 ? (
            data.map((activity) => (
              <div key={activity._id} className="flex gap-2">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  {getActivityIcon(activity.action)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm break-words">
                    <span className="font-medium">
                      {typeof activity.user === 'object' ? activity.user.name : 'User'}
                    </span>{" "}
                    {activity.description}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No activity yet</p>
          )}
        </div>
      </div>
    </div>
  );
};