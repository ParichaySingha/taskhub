import type { CreateTaskFormData } from "~/components/task/create-task-dialog";
import { fetchData, postData, updateData, deleteData } from "~/lib/fetch-util";
import type { TaskPriority, TaskStatus } from "~/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { projectId: string; taskData: CreateTaskFormData }) =>
      postData(`/task/${data.projectId}/create-task`, data.taskData),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["project", data.project],
      });
    },
  });
};

export const useTaskByIdQuery = (taskId: string) => {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () => fetchData(`/task/${taskId}`),
  });
};

export const useUpdateTaskTitleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; title: string }) =>
      updateData(`/task/${data.taskId}/title`, { title: data.title }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
    },
  });
};

export const useUpdateTaskStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; status: TaskStatus }) =>
      updateData(`/task/${data.taskId}/status`, { status: data.status }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
    },
  });
};

export const useUpdateTaskDescriptionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; description: string }) =>
      updateData(`/task/${data.taskId}/description`, {
        description: data.description,
      }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
    },
  });
};

export const useUpdateTaskAssigneesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; assignees: string[] }) =>
      updateData(`/task/${data.taskId}/assignees`, {
        assignees: data.assignees,
      }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
    },
  });
};

export const useUpdateTaskPriorityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; priority: TaskPriority }) =>
      updateData(`/task/${data.taskId}/priority`, { priority: data.priority }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
    },
  });
};

export const useAddSubTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; title: string }) =>
      postData(`/task/${data.taskId}/add-subtask`, { title: data.title }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
    },
  });
};

export const useUpdateSubTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      taskId: string;
      subTaskId: string;
      completed: boolean;
    }) =>
      updateData(`/task/${data.taskId}/update-subtask/${data.subTaskId}`, {
        completed: data.completed,
      }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
    },
  });
};

export const useAddCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; text: string }) =>
      postData(`/task/${data.taskId}/add-comment`, { text: data.text }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", data.task],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data.task],
      });
    },
  });
};

export const useGetCommentsByTaskIdQuery = (taskId: string) => {
  return useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => fetchData(`/task/${taskId}/comments`),
  });
};

export const useWatchTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string }) =>
      postData(`/task/${data.taskId}/watch`, {}),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
    },
  });
};

export const useAchievedTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string }) =>
      postData(`/task/${data.taskId}/achieved`, {}),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
    },
  });
};

export const useGetMyTasksQuery = () => {
  return useQuery({
    queryKey: ["my-tasks", "user"],
    queryFn: () => fetchData("/task/my-tasks"),
  });
};

export const useGetArchivedTasksQuery = () => {
  return useQuery({
    queryKey: ["archived-tasks", "user"],
    queryFn: () => fetchData("/task/archived-tasks"),
  });
};

export const useUnarchiveTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string }) =>
      postData(`/task/${data.taskId}/unarchive`, {}),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["archived-tasks", "user"],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-tasks", "user"],
      });
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
    },
  });
};

export const useStartTimeTrackingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string }) =>
      postData(`/task/${data.taskId}/time-tracking/start`, {}),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
    },
  });
};

export const usePauseTimeTrackingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string }) =>
      postData(`/task/${data.taskId}/time-tracking/pause`, {}),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
    },
  });
};

export const useStopTimeTrackingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string }) =>
      postData(`/task/${data.taskId}/time-tracking/stop`, {}),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
    },
  });
};

export const useUpdateTimeTrackingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; elapsedTime: number }) =>
      updateData(`/task/${data.taskId}/time-tracking/update`, { elapsedTime: data.elapsedTime }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
    },
  });
};

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => deleteData(`/task/${taskId}`),
    onSuccess: (data: any, taskId) => {
      queryClient.invalidateQueries({
        queryKey: ["task", taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-tasks", "user"],
      });
      queryClient.invalidateQueries({
        queryKey: ["archived-tasks", "user"],
      });
      queryClient.invalidateQueries({
        queryKey: ["calendar-tasks", "user"],
      });
      // Invalidate project queries to update task counts
      queryClient.invalidateQueries({
        queryKey: ["project"],
      });
    },
  });
};

// Attachment hooks
export const useUploadAttachmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { taskId: string; file: File }) => {
      const formData = new FormData();
      formData.append('attachment', data.file);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/task/${data.taskId}/attachments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return response.json();
    },
    onSuccess: (data: any, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["task", variables.taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", variables.taskId],
      });
    },
  });
};

export const useDeleteAttachmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; attachmentId: string }) =>
      deleteData(`/task/${data.taskId}/attachments/${data.attachmentId}`),
    onSuccess: (data: any, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["task", variables.taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", variables.taskId],
      });
    },
  });
};

export const useDownloadAttachment = () => {
  return useMutation({
    mutationFn: async (data: { taskId: string; attachmentId: string }) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/task/${data.taskId}/attachments/${data.attachmentId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      return response;
    },
  });
};