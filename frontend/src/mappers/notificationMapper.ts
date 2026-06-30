import type { NotificationApi } from "../types/api";
import type { AppNotification, NotificationType } from "../types";

const TYPE_MAP: Record<string, NotificationType> = {
  COMPLAINT_ASSIGNED: "complaint_assigned",
  COMPLAINT_SUBMITTED: "system",
  STATUS_UPDATED: "status_update",
  COMPLAINT_RESOLVED: "complaint_resolved",
  COMPLAINT_CLOSED: "status_update",
  COMPLAINT_REOPENED: "status_update",
  COMPLAINT_ESCALATED: "escalation",
  SLA_BREACH: "sla_breach",
};

export function mapNotification(item: NotificationApi): AppNotification {
  return {
    id: String(item.notification_id),
    type: TYPE_MAP[item.notification_type] ?? "system",
    title: item.title,
    message: item.message,
    timestamp: item.created_at,
    read: item.is_read,
    complaintId: item.complaint_id
      ? String(item.complaint_id)
      : undefined,
  };
}
