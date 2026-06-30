import { apiClient } from "../lib/api";
import type {
  ComplaintCreateResponseApi,
  ComplaintDetailApi,
  ComplaintHistoryItemApi,
  ComplaintListItemApi,
  CreateComplaintRequest,
  StatusUpdateRequest,
} from "../types/api";
import type { UserRole } from "../types";

export async function getMyComplaints(): Promise<ComplaintListItemApi[]> {
  const response = await apiClient.get<ComplaintListItemApi[]>(
    "/complaints/my",
  );
  return response.data;
}

export async function getAssignedComplaints(): Promise<ComplaintListItemApi[]> {
  const response = await apiClient.get<ComplaintListItemApi[]>(
    "/complaints/assigned",
  );
  return response.data;
}

export async function getAllComplaints(): Promise<ComplaintListItemApi[]> {
  const response = await apiClient.get<ComplaintListItemApi[]>(
    "/complaints/all",
  );
  return response.data;
}

export async function getComplaintsForRole(
  role: UserRole,
): Promise<ComplaintListItemApi[]> {
  if (role === "staff") {
    return getAssignedComplaints();
  }

  if (role === "admin") {
    return getAllComplaints();
  }

  return getMyComplaints();
}

export async function getComplaintById(
  complaintId: string,
): Promise<ComplaintDetailApi> {
  const response = await apiClient.get<ComplaintDetailApi>(
    `/complaints/${complaintId}`,
  );
  return response.data;
}

export async function getComplaintHistory(
  complaintId: string,
): Promise<ComplaintHistoryItemApi[]> {
  const response = await apiClient.get<ComplaintHistoryItemApi[]>(
    `/complaints/${complaintId}/history`,
  );
  return response.data;
}

export async function createComplaint(
  data: CreateComplaintRequest,
): Promise<ComplaintCreateResponseApi> {
  const response = await apiClient.post<ComplaintCreateResponseApi>(
    "/complaints",
    data,
  );
  return response.data;
}

export async function updateComplaintStatus(
  complaintId: string,
  data: StatusUpdateRequest,
): Promise<void> {
  await apiClient.patch(`/complaints/${complaintId}/status`, data);
}

export async function resolveComplaint(
  complaintId: string,
  remarks: string,
): Promise<void> {
  await apiClient.post(`/complaints/${complaintId}/resolve`, { remarks });
}

export async function closeComplaint(
  complaintId: string,
  remarks: string,
): Promise<void> {
  await apiClient.post(`/complaints/${complaintId}/close`, { remarks });
}

export async function reopenComplaint(
  complaintId: string,
  remarks: string,
): Promise<void> {
  await apiClient.post(`/complaints/${complaintId}/reopen`, { remarks });
}

export async function escalateComplaint(
  complaintId: string,
  toUserId: number,
  remarks: string,
): Promise<void> {
  await apiClient.post(`/complaints/${complaintId}/escalate`, {
    to_user_id: toUserId,
    remarks,
  });
}
