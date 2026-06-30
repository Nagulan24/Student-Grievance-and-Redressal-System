export type UserRole = "student" | "staff" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  studentId?: string;
  phone?: string;
  joinedAt: string;
  lastActive: string;
}

export type ComplaintStatus =
  | "open"
  | "in_review"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "closed"
  | "rejected";

export type ComplaintPriority = "low" | "medium" | "high" | "critical";

export type ComplaintCategory =
  | "academic"
  | "infrastructure"
  | "harassment"
  | "financial"
  | "wellbeing"
  | "administrative"
  | "technical";

export interface ComplaintTimelineEvent {
  id: string;
  type: "created" | "assigned" | "status_changed" | "commented" | "escalated" | "resolved" | "closed";
  actor: string;
  actorRole: UserRole;
  message: string;
  timestamp: string;
}

export interface ComplaintComment {
  id: string;
  author: string;
  authorRole: UserRole;
  content: string;
  timestamp: string;
}

export interface Complaint {
  id: string;
  ticketId: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  submittedBy: string;
  submittedByName: string;
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  resolvedAt?: string;
  isOverdue: boolean;
  slaHours: number;
  department: string;
  timeline: ComplaintTimelineEvent[];
  comments: ComplaintComment[];
  attachments: { id: string; name: string; size: string }[];
  severityScore?: number;
  supportCount?: number;
  isAnonymous?: boolean;
}

export type NotificationType =
  | "complaint_assigned"
  | "status_update"
  | "new_comment"
  | "complaint_resolved"
  | "sla_breach"
  | "escalation"
  | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  complaintId?: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  assigned: number;
  resolved: number;
  closed: number;
  critical: number;
  overdueSla: number;
}
