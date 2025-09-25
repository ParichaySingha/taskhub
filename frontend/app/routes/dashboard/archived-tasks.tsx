import { format } from "date-fns/format";
import { Archive, ArrowUpRight, FilterIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Loader } from "~/components/loader";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useGetArchivedTasksQuery, useUnarchiveTaskMutation } from "~/hooks/use-task";
import type { Task } from "~/types";

const ArchivedTasks = () => {
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

  const { data: archivedTasks, isLoading } = useGetArchivedTasksQuery() as {
    data: Task[];
    isLoading: boolean;
  };

  const unarchiveMutation = useUnarchiveTaskMutation();

  const filteredTasks =
    archivedTasks?.length > 0
      ? archivedTasks
          .filter((task) => {
            // Filter out tasks with missing project data
            if (!task.project || !task.project._id) return false;
            
            if (filter === "all") return true;
            if (filter === "high") return task.priority === "High";
            if (filter === "medium") return task.priority === "Medium";
            if (filter === "low") return task.priority === "Low";
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

  if (isLoading)
    return (
      <div>
        <Loader />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-start md:items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Archive className="size-6 text-orange-500" />
          Archived Tasks
        </h1>

        <div className="flex flex-col items-start md:flex-row md:items-center gap-2">
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
              <DropdownMenuItem onClick={() => setFilter("high")}>
                High Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("medium")}>
                Medium Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("low")}>
                Low Priority
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Input
        placeholder="Search archived tasks ...."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
        </TabsList>

        {/* LIST VIEW */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Archived Tasks</CardTitle>
              <CardDescription>
                {sortedTasks?.length} archived tasks
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="divide-y">
                {sortedTasks?.map((task) => (
                  <div key={task._id} className="p-4 hover:bg-muted/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-3">
                      <div className="flex">
                        <div className="flex gap-2 mr-2">
                          <Archive className="size-4 text-orange-500" />
                        </div>

                        <div>
                          <Link
                            to={`/dashboard/workspaces/${task.project?.workspace || 'unknown'}/projects/${task.project?._id || 'unknown'}/tasks/${task._id}`}
                            className="font-medium hover:text-primary hover:underline transition-colors flex items-center"
                          >
                            {task.title}
                            <ArrowUpRight className="size-4 ml-1" />
                          </Link>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-orange-600 border-orange-200">
                              Archived
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

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => unarchiveMutation.mutate({ taskId: task._id })}
                              disabled={unarchiveMutation.isPending}
                              className="text-xs"
                            >
                              Unarchive
                            </Button>
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

                        <div>Archived on: {format(task.updatedAt, "PPPP")}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {sortedTasks?.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No archived tasks found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GRID VIEW */}
        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTasks?.map((task) => (
              <Card
                key={task._id}
                className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500 bg-card/50"
              >
                <Link
                  to={`/dashboard/workspaces/${task.project?.workspace || 'unknown'}/projects/${task.project?._id || 'unknown'}/tasks/${task._id}`}
                  className="block p-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-base leading-tight">
                        {task.title}
                      </h3>
                      <Archive className="size-4 text-orange-500" />
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <Badge variant="outline" className="text-orange-600 border-orange-200 text-xs">
                        Archived
                      </Badge>

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

                    <div className="text-xs text-muted-foreground">
                      Project: {task.project?.title || 'Unknown Project'}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => unarchiveMutation.mutate({ taskId: task._id })}
                      disabled={unarchiveMutation.isPending}
                      className="w-full mt-2 text-xs"
                    >
                      Unarchive
                    </Button>
                  </div>
                </Link>
              </Card>
            ))}

            {sortedTasks?.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Archive className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Archived Tasks</h3>
                <p className="text-sm text-muted-foreground">
                  Tasks that are archived will appear here
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArchivedTasks;
