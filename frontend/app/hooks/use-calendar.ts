import { useQuery } from "@tanstack/react-query";
import { fetchData } from "~/lib/fetch-util";
import type { Task } from "~/types";

export const useCalendarTasksQuery = () => {
  return useQuery({
    queryKey: ["calendar-tasks"],
    queryFn: () => fetchData("/task/calendar-tasks"),
  });
};

export interface CalendarTask extends Task {
  projectName: string;
  workspaceName: string;
}
