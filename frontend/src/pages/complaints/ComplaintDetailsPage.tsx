import { useState, useEffect, useCallback } from "react";
import type { ComponentType } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Clock,
  User as UserIcon,
  Building2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  FileText,
  UserCheck,
  ShieldAlert,
  RotateCcw,
  Archive,
  PlayCircle,
  ArrowUpRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge, PriorityBadge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Textarea, Select } from "../../components/ui/Input";
import { Skeleton, SkeletonText } from "../../components/ui/Skeleton";
import { ErrorState } from "../../components/ui/EmptyState";
import {
  formatDateTime,
  formatRelativeTime,
  formatDate,
  getCategoryLabel,
  cn,
} from "../../lib/utils";
import {
  getComplaintById,
  getComplaintHistory,
  closeComplaint,
  reopenComplaint,
  updateComplaintStatus,
  resolveComplaint,
  escalateComplaint,
} from "../../services/complaintService";
import { getStaffOfficers } from "../../services/userService";
import {
  mapDetailToComplaint,
  mapHistoryToTimeline,
} from "../../mappers/complaintMapper";
import type { StaffOfficerApi } from "../../types/api";
import type { Complaint } from "../../types";

type StaffAction = "start" | "resolve" | "escalate" | null;
type StudentAction = "close" | "reopen" | null;

const timelineIcons: Record<
  string,
  ComponentType<{ className?: string }>
> = {
  created: FileText,
  assigned: UserCheck,
  status_changed: AlertCircle,
  commented: MessageSquare,
  escalated: ShieldAlert,
  resolved: CheckCircle2,
  closed: CheckCircle2,
};

const timelineColors: Record<string, string> = {
  created: "bg-primary-100 text-primary-700",
  assigned: "bg-accent-100 text-accent-700",
  status_changed: "bg-warning-100 text-warning-700",
  commented: "bg-neutral-100 text-neutral-600",
  escalated: "bg-error-100 text-error-700",
  resolved: "bg-success-100 text-success-700",
  closed: "bg-neutral-100 text-neutral-500",
};

function getSeverityLabel(score: number): {
  label: string;
  color: string;
  barColor: string;
} {
  if (score >= 81) {
    return {
      label: "Critical Risk",
      color: "text-error-700",
      barColor: "bg-error-500",
    };
  }
  if (score >= 61) {
    return {
      label: "High Risk",
      color: "text-warning-700",
      barColor: "bg-warning-500",
    };
  }
  if (score >= 31) {
    return {
      label: "Moderate Risk",
      color: "text-primary-700",
      barColor: "bg-primary-500",
    };
  }
  return {
    label: "Low Risk",
    color: "text-success-700",
    barColor: "bg-success-500",
  };
}

export function ComplaintDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [studentAction, setStudentAction] = useState<StudentAction>(null);
  const [staffAction, setStaffAction] = useState<StaffAction>(null);
  const [remarks, setRemarks] = useState("");
  const [escalateToUserId, setEscalateToUserId] = useState("");
  const [officers, setOfficers] = useState<StaffOfficerApi[]>([]);

  const loadComplaint = useCallback(async () => {
    if (!id) return;

    const [detail, history] = await Promise.all([
      getComplaintById(id),
      getComplaintHistory(id).catch(() => []),
    ]);

    const mapped = mapDetailToComplaint(detail);
    mapped.timeline = mapHistoryToTimeline(history);
    setComplaint(mapped);
  }, [id]);

  useEffect(() => {
    async function fetchComplaint() {
      if (!id) return;

      try {
        await loadComplaint();
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchComplaint();
  }, [id, loadComplaint]);

  useEffect(() => {
    async function loadOfficers() {
      if (user?.role !== "staff" && user?.role !== "admin") return;

      try {
        const data = await getStaffOfficers();
        setOfficers(data);
      } catch {
        setOfficers([]);
      }
    }

    loadOfficers();
  }, [user?.role]);

  const handleCloseComplaint = async () => {
    if (!id) return;

    setActionLoading(true);
    try {
      await closeComplaint(id, "Complaint closed by student after review");
      toast.success("Complaint closed successfully");
      setStudentAction(null);
      await loadComplaint();
    } catch {
      toast.error("Unable to close complaint. It must be in resolved status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopenComplaint = async () => {
    if (!id) return;

    setActionLoading(true);
    try {
      await reopenComplaint(id, "Complaint reopened by student for further review");
      toast.success("Complaint reopened successfully");
      setStudentAction(null);
      await loadComplaint();
    } catch {
      toast.error("Unable to reopen complaint. It must be in resolved status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartProgress = async () => {
    if (!id) return;

    setActionLoading(true);
    try {
      await updateComplaintStatus(id, {
        status: "IN_PROGRESS",
        remarks: remarks || "Investigation started",
      });
      toast.success("Complaint marked as in progress");
      setStaffAction(null);
      setRemarks("");
      await loadComplaint();
    } catch {
      toast.error("Unable to update status. Check that you are the assigned officer.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveComplaint = async () => {
    if (!id) return;

    setActionLoading(true);
    try {
      await resolveComplaint(id, remarks || "Complaint resolved by staff");
      toast.success("Complaint resolved successfully");
      setStaffAction(null);
      setRemarks("");
      await loadComplaint();
    } catch {
      toast.error("Unable to resolve complaint. It must be in progress.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalateComplaint = async () => {
    if (!id || !escalateToUserId) {
      toast.error("Please select an officer to escalate to");
      return;
    }

    setActionLoading(true);
    try {
      await escalateComplaint(
        id,
        Number(escalateToUserId),
        remarks || "Complaint escalated for further review",
      );
      toast.success("Complaint escalated successfully");
      setStaffAction(null);
      setRemarks("");
      setEscalateToUserId("");
      await loadComplaint();
    } catch {
      toast.error("Unable to escalate complaint.");
    } finally {
      setActionLoading(false);
    }
  };

  const isStudent = user?.role === "student";
  const isStaff = user?.role === "staff" || user?.role === "admin";
  const canCloseOrReopen =
    isStudent && complaint?.status === "resolved";
  const canStartProgress =
    isStaff &&
    (complaint?.status === "assigned" || complaint?.status === "open");
  const canResolve = isStaff && complaint?.status === "in_progress";
  const canEscalate =
    isStaff &&
    (complaint?.status === "assigned" ||
      complaint?.status === "in_progress");

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mb-4">
          <Skeleton className="h-5 w-48" rounded="sm" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <Card>
              <Skeleton className="h-6 w-3/4 mb-3" rounded="sm" />
              <SkeletonText lines={4} />
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !complaint) {
    return (
      <DashboardLayout>
        <Card>
          <ErrorState
            title="Complaint not found"
            description="The complaint you're looking for doesn't exist or you do not have access."
            onRetry={() => navigate("/complaints")}
          />
        </Card>
      </DashboardLayout>
    );
  }

  const severity = getSeverityLabel(complaint.severityScore ?? 0);

  return (
    <DashboardLayout>
      <div className="mb-4">
        <Breadcrumb
          items={[
            { label: "Home", href: "/dashboard" },
            { label: "Complaints", href: "/complaints" },
            { label: complaint.ticketId },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="font-mono text-xs text-neutral-400">
                    {complaint.ticketId}
                  </span>
                  <StatusBadge status={complaint.status} />
                  <PriorityBadge priority={complaint.priority} />
                  {complaint.isAnonymous && (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                      Anonymous
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-neutral-900 mb-2">
                  {complaint.title}
                </h1>
                <p className="text-sm text-neutral-500">
                  Opened {formatRelativeTime(complaint.createdAt)} ·{" "}
                  {getCategoryLabel(complaint.category)}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                {canStartProgress && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setStaffAction("start")}
                    icon={<PlayCircle className="w-3.5 h-3.5" />}
                  >
                    Start Progress
                  </Button>
                )}
                {canResolve && (
                  <Button
                    size="sm"
                    onClick={() => setStaffAction("resolve")}
                    icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Resolve
                  </Button>
                )}
                {canEscalate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStaffAction("escalate")}
                    icon={<ArrowUpRight className="w-3.5 h-3.5" />}
                  >
                    Escalate
                  </Button>
                )}
                {canCloseOrReopen && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setStudentAction("reopen")}
                      icon={<RotateCcw className="w-3.5 h-3.5" />}
                    >
                      Reopen
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setStudentAction("close")}
                      icon={<Archive className="w-3.5 h-3.5" />}
                    >
                      Close
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100">
              <h3 className="text-sm font-semibold text-neutral-700 mb-2">
                Description
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {complaint.description}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-neutral-100">
              <h3 className="text-sm font-semibold text-neutral-700 mb-2">
                Attachments
              </h3>
              <p className="text-sm text-neutral-400">Coming Soon</p>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            {complaint.timeline.length > 0 ? (
              <div className="space-y-0">
                {complaint.timeline.map((event, index) => {
                  const Icon = timelineIcons[event.type] ?? AlertCircle;
                  const isLast = index === complaint.timeline.length - 1;
                  return (
                    <div key={event.id} className="flex gap-3.5">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                            timelineColors[event.type] ??
                              timelineColors.status_changed,
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {!isLast && (
                          <div className="w-px flex-1 bg-neutral-200 my-1" />
                        )}
                      </div>
                      <div className={cn("flex-1", !isLast && "pb-5")}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-neutral-900">
                            {event.actor}
                          </span>
                          <span className="text-xs text-neutral-400">
                            {formatRelativeTime(event.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 mt-0.5">
                          {event.message}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {formatDateTime(event.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-neutral-400">No activity recorded yet.</p>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <p className="text-sm text-neutral-400">
              Comments — Coming Soon
            </p>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <dl className="space-y-3.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-neutral-500 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-neutral-400" />
                  Submitted by
                </dt>
                <dd className="font-medium text-neutral-900">
                  {complaint.submittedByName}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-neutral-500 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-neutral-400" />
                  Assigned to
                </dt>
                <dd className="font-medium text-neutral-900">
                  {complaint.assignedToName || "Unassigned"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-neutral-500 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-neutral-400" />
                  Department
                </dt>
                <dd className="font-medium text-neutral-900">
                  {complaint.department}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-neutral-500 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-neutral-400" />
                  Created
                </dt>
                <dd className="font-medium text-neutral-900">
                  {formatDate(complaint.createdAt)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-neutral-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-neutral-400" />
                  Due date
                </dt>
                <dd className="font-medium text-neutral-500">
                  Coming Soon
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Severity Assessment</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">Severity Score</span>
                <span className={cn("text-sm font-semibold", severity.color)}>
                  {complaint.severityScore ?? 0}/100
                </span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", severity.barColor)}
                  style={{
                    width: `${Math.min(100, complaint.severityScore ?? 0)}%`,
                  }}
                />
              </div>
              <p className={cn("text-xs", severity.color)}>{severity.label}</p>
              {(complaint.supportCount ?? 0) > 0 && (
                <p className="text-xs text-neutral-500">
                  Community support: {complaint.supportCount}
                </p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SLA Status</CardTitle>
            </CardHeader>
            <p className="text-sm text-neutral-400">Coming Soon</p>
          </Card>
        </div>
      </div>

      <Modal
        open={studentAction === "close"}
        onClose={() => setStudentAction(null)}
        title="Close Complaint"
        description={`Confirm closing ${complaint.ticketId}. This indicates you accept the resolution.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setStudentAction(null)}>
              Cancel
            </Button>
            <Button onClick={handleCloseComplaint} loading={actionLoading}>
              Close Complaint
            </Button>
          </>
        }
      >
        <p className="text-sm text-neutral-600">
          You can only close a complaint after it has been marked as resolved by
          staff.
        </p>
      </Modal>

      <Modal
        open={studentAction === "reopen"}
        onClose={() => setStudentAction(null)}
        title="Reopen Complaint"
        description={`Request further review for ${complaint.ticketId}.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setStudentAction(null)}>
              Cancel
            </Button>
            <Button onClick={handleReopenComplaint} loading={actionLoading}>
              Reopen Complaint
            </Button>
          </>
        }
      >
        <p className="text-sm text-neutral-600">
          Reopening will notify the assigned officer that you need additional
          assistance with this complaint.
        </p>
      </Modal>

      <Modal
        open={staffAction === "start"}
        onClose={() => {
          setStaffAction(null);
          setRemarks("");
        }}
        title="Start Investigation"
        description={`Mark ${complaint.ticketId} as in progress.`}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setStaffAction(null);
                setRemarks("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleStartProgress} loading={actionLoading}>
              Start Progress
            </Button>
          </>
        }
      >
        <Textarea
          label="Remarks (optional)"
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add investigation notes..."
        />
      </Modal>

      <Modal
        open={staffAction === "resolve"}
        onClose={() => {
          setStaffAction(null);
          setRemarks("");
        }}
        title="Resolve Complaint"
        description={`Mark ${complaint.ticketId} as resolved.`}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setStaffAction(null);
                setRemarks("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleResolveComplaint} loading={actionLoading}>
              Resolve Complaint
            </Button>
          </>
        }
      >
        <Textarea
          label="Resolution remarks"
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Describe how the complaint was resolved..."
        />
      </Modal>

      <Modal
        open={staffAction === "escalate"}
        onClose={() => {
          setStaffAction(null);
          setRemarks("");
          setEscalateToUserId("");
        }}
        title="Escalate Complaint"
        description={`Escalate ${complaint.ticketId} to another officer.`}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setStaffAction(null);
                setRemarks("");
                setEscalateToUserId("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEscalateComplaint} loading={actionLoading}>
              Escalate
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Escalate to"
            value={escalateToUserId}
            onChange={(e) => setEscalateToUserId(e.target.value)}
          >
            <option value="">Select an officer</option>
            {officers.map((officer) => (
              <option key={officer.user_id} value={String(officer.user_id)}>
                {officer.name} ({officer.role.replace(/_/g, " ")})
              </option>
            ))}
          </Select>
          {officers.length === 0 && (
            <p className="text-xs text-neutral-400">
              No officers available for escalation.
            </p>
          )}
          <Textarea
            label="Escalation remarks"
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Reason for escalation..."
          />
        </div>
      </Modal>
    </DashboardLayout>
  );
}
