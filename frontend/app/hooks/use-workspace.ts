import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { WorkspaceForm } from "~/components/workspace/create-workspace";
import { fetchData, postData, updateData, deleteData } from "~/lib/fetch-util";
import type { Workspace } from "~/types";



export const useWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WorkspaceForm) => postData("/workspace", data),
    onSuccess: () => {
      // Invalidate and refetch workspaces list
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

export const useGetWorkspacesQuery = () => {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => fetchData<{ workspaces: Workspace[] }>("/workspace"),
  });
}

export const useGetWorkspaceQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => fetchData<{ workspace: Workspace; projects: any[] }>(`/workspace/${workspaceId}/projects`),
    enabled: !!workspaceId, // Only run query if workspaceId is not empty
  });
}

export const useGetWorkspaceStatsQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId, "stats"],
    queryFn: async () => fetchData(`/workspace/${workspaceId}/stats`),
    enabled: !!workspaceId, // Only run query if workspaceId is not empty
  });
}

export const useGetWorkspaceDetailsQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId, "details"],
    queryFn: async () => fetchData(`/workspace/${workspaceId}`),
    enabled: !!workspaceId, // Only run query if workspaceId is not empty
  });
}

export const useInviteMemberMutation = () => {
  return useMutation({
    mutationFn: (data: { email: string; role: string; workspaceId: string }) =>
      postData(`/workspace/${data.workspaceId}/invite-member`, data),
  });
};

export const useAcceptInviteByTokenMutation = () => {
  return useMutation({
    mutationFn: (token: string) =>
      postData(`/workspace/accept-invite-token`, {
        token,
      }),
  });
};

export const useAcceptGenerateInviteMutation = () => {
  return useMutation({
    mutationFn: (workspaceId: string) =>
      postData(`/workspace/${workspaceId}/accept-generate-invite`, {}),
  });
};

export const useUpdateWorkspaceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: Partial<WorkspaceForm> }) =>
      updateData(`/workspace/${workspaceId}`, data),
    onSuccess: (_, variables) => {
      // Invalidate workspaces list
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      // Invalidate specific workspace details
      queryClient.invalidateQueries({ queryKey: ["workspace", variables.workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["workspace", variables.workspaceId, "details"] });
    },
  });
};

export const useDeleteWorkspaceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspaceId: string) =>
      deleteData(`/workspace/${workspaceId}`),
    onSuccess: (_, workspaceId) => {
      // Invalidate workspaces list
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      // Remove specific workspace from cache
      queryClient.removeQueries({ queryKey: ["workspace", workspaceId] });
    },
  });
};