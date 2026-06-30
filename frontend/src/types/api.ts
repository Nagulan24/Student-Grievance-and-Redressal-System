export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface CurrentUserResponse {
  user_id: number;
  name: string;
  email: string;
  role: string;
  department_id: number | null;
  register_no: string | null;
  phone: string | null;
  department_name: string | null;
  created_at: string | null;
}

export interface ComplaintListItemApi {
  id: string;
  ticketId: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  isAnonymous: boolean;
  anonymousId?: string | null;
  submittedByName?: string | null;
  assignedToName?: string | null;
  createdAt: string;
}

export interface ComplaintDetailApi {
  id: string;
  ticketId: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string | null;
  location?: string | null;
  priority: string;
  status: string;
  severityScore: number;
  supportCount: number;
  isAnonymous: boolean;
  anonymousId?: string | null;
  submittedByName?: string | null;
  assignedToName?: string | null;
  createdAt: string;
}

export interface ComplaintCreateResponseApi {
  complaint_id: number;
  complaint_code: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  is_anonymous: boolean;
  anonymous_id?: string | null;
  created_at: string;
}

export interface CreateComplaintRequest {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  location?: string;
  is_anonymous: boolean;
}

export interface StatusUpdateRequest {
  status: string;
  remarks?: string;
}

export interface ComplaintHistoryItemApi {
  history_id: number;
  complaint_id: number;
  action_type: string;
  old_status: string | null;
  new_status: string | null;
  remarks: string | null;
  performed_by: number;
  created_at: string;
}

export interface NotificationApi {
  notification_id: number;
  complaint_id: number | null;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface UnreadCountResponse {
  unread_count: number;
}

export interface DashboardSummaryApi {
  total_complaints: number;
  pending_complaints: number;
  resolved_complaints: number;
  closed_complaints: number;
  escalated_complaints: number;
  overdue_complaints: number;
  critical_complaints: number;
  active_users?: number;
  avg_resolution_hours?: number | null;
  sla_compliance_percent?: number | null;
}

export interface CategoryAnalyticsApi {
  category: string;
  total: number;
}

export interface PriorityAnalyticsApi {
  priority: string;
  total: number;
}

export interface StatusAnalyticsApi {
  status: string;
  total: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface StaffOfficerApi {
  user_id: number;
  name: string;
  role: string;
  email: string;
}

export interface UserListItemApi {
  user_id: number;
  name: string;
  email: string;
  role: string;
  register_no?: string | null;
  phone?: string | null;
  department_name?: string | null;
  is_active: boolean;
  created_at?: string | null;
}

export interface UserStatsApi {
  students: number;
  staff: number;
  admins: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  register_no?: string;
  phone?: string;
  department_id?: number;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  role?: string;
  department_id?: number;
  is_active?: boolean;
}

export interface DepartmentApi {
  department_id: number;
  department_code: string;
  department_name: string;
}
