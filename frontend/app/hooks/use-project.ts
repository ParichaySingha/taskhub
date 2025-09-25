import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateProjectFormData } from "~/components/project/create-project";
import { fetchData, postData, updateData, deleteData } from "~/lib/fetch-util";

export const UseCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      projectData: CreateProjectFormData;
      workspaceId: string;
    }) =>
      postData(
        `/projects/${data.workspaceId}/create-project`,
        data.projectData
      ),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", data.workspace],
      });
    },
  });
};

export const UseProjectQuery = (projectId: string) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchData(`/projects/${projectId}/tasks`),
  });
};

export const UseUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      projectId: string;
      projectData: Partial<CreateProjectFormData>;
    }) =>
      updateData(`/projects/${data.projectId}`, data.projectData),
    onSuccess: (data: any, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["project", variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace"],
      });
    },
  });
};

export const UseDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) =>
      deleteData(`/projects/${projectId}`),
    onSuccess: (data: any, projectId) => {
      queryClient.invalidateQueries({
        queryKey: ["project", projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace"],
      });
    },
  });
};