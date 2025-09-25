import type {
  ProjectStatusData,
  StatsCardProps,
  TaskPriorityData,
  TaskTrendsData,
  WorkspaceProductivityData,
} from "~/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ChartBarBig, ChartLine, ChartPie } from "lucide-react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

interface StatisticsChartsProps {
  stats: StatsCardProps;
  taskTrendsData: TaskTrendsData[];
  projectStatusData: ProjectStatusData[];
  taskPriorityData: TaskPriorityData[];
  workspaceProductivityData: WorkspaceProductivityData[];
}

export const StatisticsCharts = ({
  stats,
  taskTrendsData,
  projectStatusData,
  taskPriorityData,
  workspaceProductivityData,
}: StatisticsChartsProps) => {
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-medium">Task Trends</CardTitle>
            <CardDescription>Daily task status changes</CardDescription>
          </div>
          <ChartLine className="size-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="w-full overflow-x-auto md:overflow-x-hidden">
          <div className="min-w-[350px]">
            <ChartContainer
              className="h-[300px]"
              config={{
                completed: { color: "#10b981" }, // green
                inProgress: { color: "#f59e0b" }, // blue
                todo: { color: "#3b82f6" }, // gray
              }}
            >
              <LineChart data={taskTrendsData}>
                <XAxis
                  dataKey={"name"}
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />

                <CartesianGrid strokeDasharray={"3 3"} vertical={false} />
                <ChartTooltip />

                <Line
                  type="monotone"
                  dataKey={"completed"}
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="inProgress"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="todo"
                  stroke="#6b7280"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />

                <ChartLegend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* project status  */}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-medium">
              Project Status
            </CardTitle>
            <CardDescription>Project status breakdown</CardDescription>
          </div>

          <ChartPie className="size-5 text-muted-foreground" />
        </CardHeader>

        <CardContent className="w-full overflow-x-auto md:overflow-x-hidden">
          <div className="min-w-[350px] flex flex-col items-center">
            <ChartContainer
              className="h-[200px] w-[200px]"
              config={{
                Completed: { color: "#10b981" },
                "In Progress": { color: "#3b82f6" },
                Planning: { color: "#f59e0b" },
              }}
            >
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ChartContainer>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {projectStatusData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {entry.name} ({entry.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* task priority  */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-medium">
              Task Priority
            </CardTitle>
            <CardDescription>Task priority breakdown</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="w-full overflow-x-auto md:overflow-x-hidden">
          <div className="min-w-[350px] flex flex-col items-center">
            <ChartContainer
              className="h-[200px] w-[200px]"
              config={{
                High: { color: "#ef4444" },
                Medium: { color: "#f59e0b" },
                Low: { color: "#6b7280" },
              }}
            >
              <PieChart>
                <Pie
                  data={taskPriorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {taskPriorityData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ChartContainer>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {taskPriorityData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {entry.name} ({entry.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workspace Productivity Chart */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-medium">
              Project Performance
            </CardTitle>
            <CardDescription>Task completion efficiency by project</CardDescription>
          </div>
          <ChartBarBig className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="w-full overflow-x-auto md:overflow-x-hidden">
          <div className="min-w-[350px]">
            <ChartContainer
              className="h-[300px]"
              config={{
                efficiency: { color: "#3b82f6" },
                completed: { color: "#10b981" },
                total: { color: "#6b7280" },
              }}
            >
              <BarChart
                data={workspaceProductivityData}
                barGap={4}
                barSize={28}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'dataMax + 5']}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <ChartTooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-semibold text-gray-900">{label}</p>
                          <div className="space-y-1 mt-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Efficiency:</span> {data.efficiency}%
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Completed:</span> {data.completed} tasks
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Total:</span> {data.total} tasks
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Status:</span> {data.projectStatus}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="efficiency"
                  radius={[4, 4, 0, 0]}
                  name="Efficiency %"
                >
                  {workspaceProductivityData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index % 2 === 0 ? "#3b82f6" : "#60a5fa"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};