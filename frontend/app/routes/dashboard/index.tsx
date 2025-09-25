import { Loader } from "lucide-react";
import { useSearchParams } from "react-router";
import { RecentProjects } from "~/components/dashboard/recnt-projects";
import { StatsCard } from "~/components/dashboard/stat-card";
import { StatisticsCharts } from "~/components/dashboard/statistics-charts";
import { UpcomingTasks } from "~/components/upcoming-tasks";
import { RealTimeClock } from "~/components/ui/real-time-clock";
import { useGetWorkspaceStatsQuery } from "~/hooks/use-workspace";
import type { StatsCardProps, TaskTrendsData, ProjectStatusData, TaskPriorityData, WorkspaceProductivityData, Task, Project } from "~/types";


const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  const { data, isPending } = useGetWorkspaceStatsQuery(workspaceId || "") as {
    data: {
      stats: StatsCardProps;
      taskTrendsData: TaskTrendsData[];
      projectStatusData: ProjectStatusData[];
      taskPriorityData: TaskPriorityData[];
      workspaceProductivityData: WorkspaceProductivityData[];
      upcomingTasks: Task[];
      recentProjects: Project[];
    };
    isPending: boolean;
  };

  if (isPending) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!workspaceId) {
    return (
      <div className="space-y-8 2xl:space-y-12">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">No Workspace Selected</h2>
            <p className="text-muted-foreground">
              Please select a workspace to view dashboard statistics.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 2xl:space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <RealTimeClock />
      </div>

      <StatsCard data={data.stats} />

      <StatisticsCharts
        stats={data.stats}
        taskTrendsData={data.taskTrendsData}
        projectStatusData={data.projectStatusData}
        taskPriorityData={data.taskPriorityData}
        workspaceProductivityData={data.workspaceProductivityData}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentProjects data={data.recentProjects} />
        <UpcomingTasks data={data.upcomingTasks} />
      </div>
    </div>
  );
};

export default Dashboard;