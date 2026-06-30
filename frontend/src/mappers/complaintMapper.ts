import { mapPriority, mapStatus } from "./enumMapper";
import type {
  ComplaintCreateResponseApi,
  ComplaintDetailApi,
  ComplaintHistoryItemApi,
  ComplaintListItemApi,
  CreateComplaintRequest,
} from "../types/api";
import type {
  Complaint,
  ComplaintStatus,
  ComplaintTimelineEvent,
} from "../types";

const HISTORY_TYPE_MAP: Record<string, ComplaintTimelineEvent["type"]> = {
  SUBMITTED: "created",
  ASSIGNED: "assigned",
  STATUS_CHANGED: "status_changed",
  RESOLVED: "resolved",
  CLOSED: "closed",
  REOPENED: "status_changed",
  ESCALATED: "escalated",
};

export const BACKEND_CATEGORIES = [
  { value: "ACADEMIC", label: "Academic" },
  { value: "INFRASTRUCTURE", label: "Infrastructure" },
  { value: "HOSTEL", label: "Hostel" },
  { value: "EXAMINATION", label: "Examination" },
  { value: "PLACEMENT", label: "Placement" },
  { value: "TRANSPORTATION", label: "Transportation" },
  { value: "SAFETY", label: "Safety" },
] as const;

export function mapStatusToBackend(status: ComplaintStatus): string {
  switch (status) {
    case "open":
      return "SUBMITTED";
    case "assigned":
      return "ASSIGNED";
    case "in_progress":
      return "IN_PROGRESS";
    case "in_review":
      return "ESCALATED";
    case "resolved":
      return "RESOLVED";
    case "closed":
      return "CLOSED";
    default:
      return "SUBMITTED";
  }
}

export function mapListItemToComplaint(item: ComplaintListItemApi): Complaint {
  return {
    id: item.id,
    ticketId: item.ticketId,
    title: item.title,
    description: "",
    category: item.category as Complaint["category"],
    status: item.status as ComplaintStatus,
    priority: item.priority as Complaint["priority"],
    submittedBy: "",
    submittedByName: item.submittedByName ?? "—",
    assignedToName: item.assignedToName ?? "Unassigned",
    createdAt: item.createdAt,
    updatedAt: item.createdAt,
    dueDate: item.createdAt,
    isOverdue: false,
    slaHours: 0,
    department: "—",
    timeline: [],
    comments: [],
    attachments: [],
  };
}

export function mapDetailToComplaint(detail: ComplaintDetailApi): Complaint {
  return {
    id: detail.id,
    ticketId: detail.ticketId,
    title: detail.title,
    description: detail.description,
    category: detail.category as Complaint["category"],
    status: detail.status as ComplaintStatus,
    priority: detail.priority as Complaint["priority"],
    submittedBy: "",
    submittedByName: detail.submittedByName ?? (detail.isAnonymous ? "Anonymous" : "—"),
    assignedToName: detail.assignedToName ?? "Unassigned",
    createdAt: detail.createdAt,
    updatedAt: detail.createdAt,
    dueDate: detail.createdAt,
    isOverdue: false,
    slaHours: 0,
    department: detail.subcategory ?? detail.location ?? "—",
    timeline: [],
    comments: [],
    attachments: [],
    severityScore: detail.severityScore,
    supportCount: detail.supportCount,
    isAnonymous: detail.isAnonymous,
  };
}

export function mapHistoryToTimeline(
  history: ComplaintHistoryItemApi[],
): ComplaintTimelineEvent[] {
  return history.map((entry) => {
    const type =
      HISTORY_TYPE_MAP[entry.action_type] ?? "status_changed";

    const statusLabel = entry.new_status
      ? mapStatus(entry.new_status)
      : entry.action_type.toLowerCase().replace(/_/g, " ");

    const message =
      entry.remarks ??
      (entry.new_status
        ? `Status changed to ${statusLabel}`
        : entry.action_type.replace(/_/g, " ").toLowerCase());

    return {
      id: String(entry.history_id),
      type,
      actor: `User #${entry.performed_by}`,
      actorRole: "staff",
      message,
      timestamp: entry.created_at,
    };
  });
}

export function mapCreateFormToRequest(data: {
  title: string;
  description: string;
  category: string;
  department?: string;
  isAnonymous?: boolean;
}): CreateComplaintRequest {
  return {
    title: data.title,
    description: data.description,
    category: data.category,
    subcategory: data.department || undefined,
    is_anonymous: data.isAnonymous ?? false,
  };
}

export function mapCreateResponseToComplaint(
  response: ComplaintCreateResponseApi,
): Complaint {
  return {
    id: String(response.complaint_id),
    ticketId: response.complaint_code,
    title: response.title,
    description: "",
    category: response.category.toLowerCase() as Complaint["category"],
    status: mapStatus(response.status) as ComplaintStatus,
    priority: mapPriority(response.priority) as Complaint["priority"],
    submittedBy: "",
    submittedByName: "—",
    createdAt: response.created_at,
    updatedAt: response.created_at,
    dueDate: response.created_at,
    isOverdue: false,
    slaHours: 0,
    department: "—",
    timeline: [],
    comments: [],
    attachments: [],
  };
}
