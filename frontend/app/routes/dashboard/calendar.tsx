import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Search, RefreshCw, X, Calendar, Clock, User, Flag, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { useCalendarTasksQuery } from "~/hooks/use-calendar";
import type { Task } from "~/types";
import { cn } from "~/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  time?: string;
  color: string;
  dotColor: string;
  task: Task;
}

const getTaskColor = (priority: string, status: string, isArchived: boolean): string => {
  if (isArchived) return "bg-gray-100 text-gray-600 border-gray-200";
  if (status === "Done") return "bg-green-100 text-green-800 border-green-200";
  if (status === "Testing") return "bg-purple-100 text-purple-800 border-purple-200";
  if (status === "In Progress") return "bg-blue-100 text-blue-800 border-blue-200";
  if (priority === "High") return "bg-red-100 text-red-800 border-red-200";
  if (priority === "Medium") return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-purple-100 text-purple-800 border-purple-200";
};

const getTaskDotColor = (priority: string, status: string, isArchived: boolean): string => {
  if (isArchived) return "bg-gray-500";
  if (status === "Done") return "bg-green-500";
  if (status === "Testing") return "bg-purple-500";
  if (status === "In Progress") return "bg-blue-500";
  if (priority === "High") return "bg-red-500";
  if (priority === "Medium") return "bg-yellow-500";
  return "bg-purple-500";
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All Tasks");
  const [selectedTask, setSelectedTask] = useState<CalendarEvent | null>(null);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  
  const { data: tasks, isLoading } = useCalendarTasksQuery();

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Get the Monday of the first week
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1));
  
  const calendarDays = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    calendarDays.push(date);
  }

  const events = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return [];
    
    return tasks
      .filter((task: Task) => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        const isCurrentMonth = taskDate.getMonth() === month && taskDate.getFullYear() === year;
        
        // Apply status filter
        if (selectedFilter === "All Tasks") {
          return isCurrentMonth;
        } else if (selectedFilter === "To Do") {
          return isCurrentMonth && task.status === "To Do" && !task.isArchived;
        } else if (selectedFilter === "In Progress") {
          return isCurrentMonth && task.status === "In Progress" && !task.isArchived;
        } else if (selectedFilter === "Testing") {
          return isCurrentMonth && task.status === "Testing" && !task.isArchived;
        } else if (selectedFilter === "Done") {
          return isCurrentMonth && task.status === "Done" && !task.isArchived;
        } else if (selectedFilter === "Archived") {
          return isCurrentMonth && task.isArchived === true;
        }
        
        return isCurrentMonth;
      })
      .map((task: Task) => ({
        id: task._id,
        title: task.title,
        time: task.dueDate ? new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
        color: getTaskColor(task.priority, task.status, task.isArchived),
        dotColor: getTaskDotColor(task.priority, task.status, task.isArchived),
        task,
      }))
      .filter((event: CalendarEvent) => 
        searchQuery === "" || event.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [tasks, month, year, searchQuery, selectedFilter]);

  const getEventsForDate = (date: Date) => {
    return events.filter((event: CalendarEvent) => {
      const eventDate = new Date(event.task.dueDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleTaskClick = (event: CalendarEvent) => {
    setSelectedTask(event);
  };

  const handleCloseTaskDetails = () => {
    setSelectedTask(null);
  };

  const toggleDateExpansion = (dateString: string) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateString)) {
        newSet.delete(dateString);
      } else {
        newSet.add(dateString);
      }
      return newSet;
    });
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "High":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "Medium":
        return <Flag className="h-4 w-4 text-yellow-500" />;
      case "Low":
        return <Flag className="h-4 w-4 text-green-500" />;
      default:
        return <Flag className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Done":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "In Progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "To Do":
        return <Calendar className="h-4 w-4 text-gray-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Mon", "Tues", "Wed", "Thu", "Fri", "Sat", "Sun"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50">
      <div className="flex h-full">
        {/* Main Calendar Section */}
        <div className={cn("flex-1 transition-all duration-300 h-screen", selectedTask ? "w-2/3" : "w-full")}>
          <div className="p-6 h-full overflow-y-auto scrollbar-hide">
        {/* Page Title and Filters */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Calendar</h1>
          <div className="flex space-x-2">
            {["All Tasks", "To Do", "In Progress", "Testing", "Done", "Archived"].map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(filter)}
                className={cn(
                  "rounded-full",
                  selectedFilter === filter 
                    ? "bg-gray-900 text-white" 
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                )}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        {/* Calendar Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center space-x-4 h-10">
              <div className="text-sm font-bold text-gray-900">
                {currentDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {currentDate.getDate()}
              </div>
              <div className="text-sm text-gray-600">
                {monthNames[month]} {year}
              </div>
              <div className="text-xs text-gray-500">
                {firstDayOfMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {
                lastDayOfMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              Month view
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {dayNames.map((day) => (
              <div key={day} className="p-4 text-center text-sm font-medium text-gray-500 bg-gray-50">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((date, index) => {
              const isCurrentMonth = date.getMonth() === month;
              const isToday = date.toDateString() === today.toDateString();
              const dayEvents = getEventsForDate(date);
              const isFirstWeek = index < 7;
              const isLastWeek = index >= 35;
              const dateString = date.toDateString();
              const isExpanded = expandedDates.has(dateString);
              const maxVisibleTasks = isExpanded ? dayEvents.length : 3;

              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-[120px] border-r border-b border-gray-200 p-2",
                    !isCurrentMonth && "bg-gray-50",
                    isFirstWeek && "border-t-0",
                    isLastWeek && "border-b-0"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        !isCurrentMonth && "text-gray-400",
                        isCurrentMonth && "text-gray-900",
                        isToday && "bg-gray-900 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      )}
                    >
                      {date.getDate()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {dayEvents.slice(0, maxVisibleTasks).map((event: CalendarEvent) => (
                      <div
                        key={event.id}
                        onClick={() => handleTaskClick(event)}
                        className={cn(
                          "text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-all",
                          event.color
                        )}
                      >
                        <div className="flex items-center space-x-1">
                          <div className={cn("w-1.5 h-1.5 rounded-full", event.dotColor)} />
                          <span className="truncate">{event.title}</span>
                        </div>
                        {event.time && (
                          <div className="text-xs opacity-75 ml-2">{event.time}</div>
                        )}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <button
                        onClick={() => toggleDateExpansion(dateString)}
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        {isExpanded ? "Show less" : `${dayEvents.length - 3} more...`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
          </div>
        </div>

        {/* Task Details Panel */}
        {selectedTask && (
          <div className="w-1/3 bg-white border-l border-gray-200 h-screen flex flex-col">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Task Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseTaskDetails}
                  className="p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide min-h-0">
              <div className="space-y-6">
              {/* Task Title */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedTask.title}
                </h3>
                {selectedTask.task.description && (
                  <p className="text-gray-600 text-sm">
                    {selectedTask.task.description}
                  </p>
                )}
              </div>

              {/* Task Status and Priority */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(selectedTask.task.status)}
                  <span className="text-sm font-medium text-gray-700">
                    {selectedTask.task.status}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {getPriorityIcon(selectedTask.task.priority)}
                  <span className="text-sm font-medium text-gray-700">
                    {selectedTask.task.priority} Priority
                  </span>
                </div>
              </div>

              {/* Due Date */}
              {selectedTask.task.dueDate && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    Due: {new Date(selectedTask.task.dueDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  {selectedTask.time && (
                    <span className="text-sm text-gray-500">
                      at {selectedTask.time}
                    </span>
                  )}
                </div>
              )}

              {/* Project Information */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Project</h4>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    {selectedTask.task.project?.title || 'Unknown Project'}
                  </span>
                </div>
              </div>

              {/* Assignees */}
              {selectedTask.task.assignees && selectedTask.task.assignees.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Assignees</h4>
                  <div className="space-y-2">
                    {selectedTask.task.assignees.map((assignee: any, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="h-3 w-3 text-gray-600" />
                        </div>
                        <span className="text-sm text-gray-700">
                          {assignee.name || 'Unknown User'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtasks */}
              {selectedTask.task.subtasks && selectedTask.task.subtasks.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Subtasks</h4>
                  <div className="space-y-2">
                    {selectedTask.task.subtasks.map((subtask: any, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className={cn(
                          "w-4 h-4 rounded border-2 flex items-center justify-center",
                          subtask.completed 
                            ? "bg-green-500 border-green-500" 
                            : "border-gray-300"
                        )}>
                          {subtask.completed && (
                            <CheckCircle className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <span className={cn(
                          "text-sm",
                          subtask.completed ? "text-gray-500 line-through" : "text-gray-700"
                        )}>
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Tracking */}
              {selectedTask.task.timeTracking && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Time Tracking</h4>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {Math.floor(selectedTask.task.timeTracking.elapsedTime / 3600)}h {Math.floor((selectedTask.task.timeTracking.elapsedTime % 3600) / 60)}m
                    </span>
                  </div>
                </div>
              )}

              {/* Created and Updated Dates */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="text-xs text-gray-500">
                  Created: {new Date(selectedTask.task.createdAt).toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-500">
                  Updated: {new Date(selectedTask.task.updatedAt).toLocaleDateString()}
                </div>
              </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
