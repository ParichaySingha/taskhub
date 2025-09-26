import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchData, postData, updateData } from "~/lib/fetch-util";

export interface Verification {
  _id: string;
  task: {
    _id: string;
    title: string;
    description?: string;
    status: string;
  };
  project: {
    _id: string;
    title: string;
  };
  workspace: {
    _id: string;
    name: string;
  };
  requestedBy: {
    _id: string;
    name: string;
    email: string;
  };
  requestedFor: {
    _id: string;
    name: string;
    email: string;
  };
  currentStatus: string;
  requestedStatus: string;
  status: "pending" | "approved" | "rejected";
  reason?: string;
  verifiedAt?: string;
  verifiedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  verificationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface CreateVerificationRequest {
  requestedStatus: string;
  reason?: string;
}

export interface UpdateVerificationStatus {
  status: "approved" | "rejected";
  verificationNotes?: string;
}

// Get verification requests
export const useVerifications = (
  endpoint: "requests" | "my-requests" | "stats",
  params?: { status?: string }
) => {
  return useQuery({
    queryKey: ["verifications", endpoint, params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.status && params.status !== "all") {
        queryParams.append("status", params.status);
      }
      
      const url = `/verifications/${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      return await fetchData(url);
    },
  });
};

// Create verification request
export const useCreateVerificationRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: CreateVerificationRequest }) => {
      return await postData(`/verifications/task/${taskId}/request`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verifications"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

// Update verification status
export const useUpdateVerificationStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ verificationId, data }: { verificationId: string; data: UpdateVerificationStatus }) => {
      return await updateData(`/verifications/${verificationId}/status`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verifications"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};
