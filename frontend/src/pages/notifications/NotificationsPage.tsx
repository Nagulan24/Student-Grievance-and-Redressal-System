import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Bell,
  CheckCheck,
  UserCheck,
  MessageSquare,
  CheckCircle2,
  Timer,
  ShieldAlert,
  Settings as SettingsIcon,
} from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { cn, formatRelativeTime } from "../../lib/utils";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../services/notificationService";
import { mapNotification } from "../../mappers/notificationMapper";
import type { AppNotification, NotificationType } from "../../types";

const notifIcons: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  complaint_assigned: UserCheck,
  status_update: CheckCircle2,
  new_comment: MessageSquare,
  complaint_resolved: CheckCircle2,
  sla_breach: Timer,
  escalation: ShieldAlert,
  system: SettingsIcon,
};

const notifColors: Record<NotificationType, string> = {
  complaint_assigned: "bg-accent-100 text-accent-700",
  status_update: "bg-primary-100 text-primary-700",
  new_comment: "bg-neutral-100 text-neutral-600",
  complaint_resolved: "bg-success-100 text-success-700",
  sla_breach: "bg-warning-100 text-warning-700",
  escalation: "bg-error-100 text-error-700",
  system: "bg-neutral-100 text-neutral-500",
};

type FilterType = "all" | "unread";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await getNotifications();
        setNotifications(data.map(mapNotification));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, []);

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    try {
      await markAllNotificationsRead(unreadIds);
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch {
      toast.error("Failed to mark notification as read");
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Notifications"
        description="Stay updated on complaint activity and system announcements."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Notifications" }]}
        actions={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              icon={<CheckCheck className="w-4 h-4" />}
            >
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      <div className="flex items-center gap-1 mb-5 p-1 bg-neutral-100 rounded-lg w-fit">
        {(["all", "unread"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3.5 py-1.5 text-sm font-medium rounded-md transition-all",
              filter === f
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700",
            )}
          >
            {f === "all" ? "All" : "Unread"}
            {f === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 text-xs text-primary-700">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      <Card noPadding>
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-3">
                <Skeleton className="w-10 h-10" rounded="full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" rounded="sm" />
                  <Skeleton className="h-3 w-2/3" rounded="sm" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-7 h-7" />}
            title="No notifications"
            description={
              filter === "unread"
                ? "You're all caught up! No unread notifications."
                : "You don't have any notifications yet."
            }
          />
        ) : (
          <div className="divide-y divide-neutral-100">
            {filtered.map((notif) => {
              const Icon = notifIcons[notif.type];
              return (
                <div
                  key={notif.id}
                  className={cn(
                    "flex gap-3.5 px-5 py-4 hover:bg-neutral-50 transition-colors group",
                    !notif.read && "bg-primary-50/20",
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                      notifColors[notif.type],
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-neutral-900">
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-primary-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-neutral-600 mt-0.5">
                          {notif.message}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1.5">
                          {formatRelativeTime(notif.timestamp)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notif.read && (
                          <button
                            onClick={() => handleMarkRead(notif.id)}
                            className="p-1.5 text-neutral-400 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <CheckCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    {notif.complaintId && (
                      <Link
                        to={`/complaints/${notif.complaintId}`}
                        className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary-700 hover:text-primary-800 transition-colors"
                      >
                        View complaint
                        <span className="text-primary-400">→</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
