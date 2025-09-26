import { format } from "date-fns/format";
import { ArrowUpRight, CheckCircle, Clock, FilterIcon, TestTube, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Loader } from "~/components/loader";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useGetMyTasksQuery } from "~/hooks/use-task";
import type { Task } from "~/types";


const MyTasks = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilter = searchParams.get("filter") || "all";
  const initialSort = searchParams.get("sort") || "desc";
  const initialSearch = searchParams.get("search") || "";

  const [filter, setFilter] = useState<string>(initialFilter);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialSort === "asc" ? "asc" : "desc"
  );
  const [search, setSearch] = useState<string>(initialSearch);

  useEffect(() => {
    const params: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    params.filter = filter;
    params.sort = sortDirection;
    params.search = search;

    setSearchParams(params, { replace: true });
  }, [filter, sortDirection, search]);

  useEffect(() => {
    const urlFilter = searchParams.get("filter") || "all";
    const urlSort = searchParams.get("sort") || "desc";
    const urlSearch = searchParams.get("search") || "";

    if (urlFilter !== filter) setFilter(urlFilter);
    if (urlSort !== sortDirection)
      setSortDirection(urlSort === "asc" ? "asc" : "desc");
    if (urlSearch !== search) setSearch(urlSearch);
  }, [searchParams]);

  const { data: myTasks, isLoading } = useGetMyTasksQuery() as {
    data: Task[];
    isLoading: boolean;
  };

  // Count tasks with null projects for debugging
  const tasksWithNullProjects = myTasks?.filter(task => !task.project) || [];

  const filteredTasks =
    myTasks?.length > 0
      ? myTasks
          .filter((task) => {
            // Filter out tasks with null projects
            if (!task.project) return false;
            
            if (filter === "all") return true;
            if (filter === "todo") return task.status === "To Do";
            if (filter === "inprogress") return task.status === "In Progress";
            if (filter === "testing") return task.status === "Testing";
            if (filter === "done") return task.status === "Done";
            if (filter === "achieved") return task.isArchived === true;
            if (filter === "high") return task.priority === "High";

            return true;
          })
          .filter(
            (task) =>
              task.title.toLowerCase().includes(search.toLowerCase()) ||
              task.description?.toLowerCase().includes(search.toLowerCase())
          )
      : [];

  //   sort task
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      return sortDirection === "asc"
        ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
    return 0;
  });

  const todoTasks = sortedTasks.filter((task) => task.status === "To Do");
  const inProgressTasks = sortedTasks.filter(
    (task) => task.status === "In Progress"
  );
  const testingTasks = sortedTasks.filter((task) => task.status === "Testing");
  const doneTasks = sortedTasks.filter((task) => task.status === "Done");

  if (isLoading)
    return (
      <div>
        <Loader />
      </div>
    );
  return (
    <div className="space-y-6">
      <div className="flex items-start md:items-center justify-between">
        <h1 className="text-2xl font-bold">My Tasks</h1>

        <div
          className="flex flex-col items-start md:flex-row md:items-center gap-2"
          itemScope
        >
          <Button
            variant={"outline"}
            onClick={() =>
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }
          >
            {sortDirection === "asc" ? "Oldest First" : "Newest First"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"}>
                <FilterIcon className="w-4 h-4" /> Filter
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuLabel>Filter Tasks</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilter("all")}>
                All Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("todo")}>
                To Do
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("inprogress")}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("testing")}>
                Testing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("done")}>
                Done
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("achieved")}>
                Achieved
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("high")}>
                High
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Input
        placeholder="Search tasks ...."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="board">Board View</TabsTrigger>
        </TabsList>

        {/* LIST VIEW */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>My Tasks</CardTitle>
              <CardDescription>
                {sortedTasks?.length} tasks assigned to you
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="divide-y">
                {sortedTasks?.map((task) => (
                  <div key={task._id} className="p-4 hover:bg-muted/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-3">
                      <div className="flex">
                        <div className="flex gap-2 mr-2">
                          {task.status === "Done" ? (
                            <CheckCircle className="size-4 text-green-500" />
                          ) : (
                            <Clock className="size-4 text-yellow-500" />
                          )}
                        </div>

                        <div>
                          <Link
                            to={task.project ? `/dashboard/workspaces/${task.project.workspace._id}/projects/${task.project._id}/tasks/${task._id}` : '#'}
                            className="font-medium hover:text-primary hover:underline transition-colors flex items-center"
                          >
                            {task.title}
                            <ArrowUpRight className="size-4 ml-1" />
                          </Link>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge
                              variant={
                                task.status === "Done" ? "default" : "outline"
                              }
                            >
                              {task.status}
                            </Badge>

                            {task.priority && (
                              <Badge
                                variant={
                                  task.priority === "High"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {task.priority}
                              </Badge>
                            )}

                            {task.isArchived && (
                              <Badge variant={"outline"}>Archived</Badge>
                            )}

                            {task.requiresVerification && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                <span className="text-xs">Verification</span>
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        {task.dueDate && (
                          <div>Due: {format(task.dueDate, "PPPP")}</div>
                        )}

                        <div>
                          Project:{" "}
                          <span className="font-medium">
                            {task.project?.title || 'Unknown Project'}
                          </span>
                        </div>

                        <div>Modified on: {format(task.updatedAt, "PPPP")}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {sortedTasks?.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No tasks found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BOARD VIEW */}
        <TabsContent value="board">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* To Do Column */}
            <div className="flex flex-col">
              <Card className="flex-1 flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>To Do</span>
                    <Badge variant="outline" className="ml-2">
                      {todoTasks?.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[70vh] scrollbar-hide">
                  {todoTasks?.map((task) => (
                    <Card
                      key={task._id}
                      className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 bg-card/50"
                    >
                      <Link
                        to={task.project ? `/dashboard/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}` : '#'}
                        className="block p-4"
                      >
                        <div className="space-y-3">
                          <h3 className="font-semibold text-base leading-tight">
                            {task.title}
                          </h3>
                          
                          {task.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <Badge
                              variant={
                                task.priority === "High"
                                  ? "destructive"
                                  : task.priority === "Medium"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {task.priority}
                            </Badge>

                            {task.dueDate && (
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                Due: {format(task.dueDate, "MMM dd")}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </Card>
                  ))}

                  {todoTasks?.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                        <Clock className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">No tasks to do</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* In Progress Column */}
            <div className="flex flex-col">
              <Card className="flex-1 flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>In Progress</span>
                    <Badge variant="outline" className="ml-2">
                      {inProgressTasks?.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[70vh] scrollbar-hide">
                  {inProgressTasks?.map((task) => (
                    <Card
                      key={task._id}
                      className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-yellow-500 bg-card/50"
                    >
                      <Link
                        to={task.project ? `/dashboard/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}` : '#'}
                        className="block p-4"
                      >
                        <div className="space-y-3">
                          <h3 className="font-semibold text-base leading-tight">
                            {task.title}
                          </h3>
                          
                          {task.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <Badge
                              variant={
                                task.priority === "High"
                                  ? "destructive"
                                  : task.priority === "Medium"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {task.priority}
                            </Badge>

                            {task.dueDate && (
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                Due: {format(task.dueDate, "MMM dd")}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </Card>
                  ))}

                  {inProgressTasks?.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                        <Clock className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">No tasks in progress</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Testing Column */}
            <div className="flex flex-col">
              <Card className="flex-1 flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>Testing</span>
                    <Badge variant="outline" className="ml-2">
                      {testingTasks?.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[70vh] scrollbar-hide">
                  {testingTasks?.map((task) => (
                    <Card
                      key={task._id}
                      className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500 bg-card/50"
                    >
                      <Link
                        to={task.project ? `/dashboard/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}` : '#'}
                        className="block p-4"
                      >
                        <div className="space-y-3">
                          <h3 className="font-semibold text-base leading-tight">
                            {task.title}
                          </h3>
                          
                          {task.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <Badge
                              variant={
                                task.priority === "High"
                                  ? "destructive"
                                  : task.priority === "Medium"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {task.priority}
                            </Badge>

                            {task.dueDate && (
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                Due: {format(task.dueDate, "MMM dd")}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </Card>
                  ))}

                  {testingTasks?.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                        <TestTube className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">No testing tasks</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Done Column */}
            <div className="flex flex-col">
              <Card className="flex-1 flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>Done</span>
                    <Badge variant="outline" className="ml-2">
                      {doneTasks?.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[70vh] scrollbar-hide">
                  {doneTasks?.map((task) => (
                    <Card
                      key={task._id}
                      className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500 bg-card/50"
                    >
                      <Link
                        to={task.project ? `/dashboard/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}` : '#'}
                        className="block p-4"
                      >
                        <div className="space-y-3">
                          <h3 className="font-semibold text-base leading-tight">
                            {task.title}
                          </h3>
                          
                          {task.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <Badge
                              variant={
                                task.priority === "High"
                                  ? "destructive"
                                  : task.priority === "Medium"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {task.priority}
                            </Badge>

                            {task.dueDate && (
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                Due: {format(task.dueDate, "MMM dd")}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </Card>
                  ))}

                  {doneTasks?.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                        <CheckCircle className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">No completed tasks</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyTasks;