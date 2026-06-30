import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Inbox,
  Clock,
  UserCheck,
  CheckCircle2,
  Archive,
  AlertTriangle,
  Timer,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { PageHeader } from "../../components/layout/PageHeader";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { StatCard } from "../../components/dashboard/StatCard";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";
import { StatusBadge, PriorityBadge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { LineChart } from "../../components/charts/LineChart";
import { DoughnutChart } from "../../components/charts/DoughnutChart";
import { BarChart } from "../../components/charts/BarChart";
import { formatRelativeTime } from "../../lib/utils";
import { getComplaintsForRole } from "../../services/complaintService";
import {
  getCategoryAnalytics,
  getDashboardSummary,
  getPriorityAnalytics,
  getStatusAnalytics,
} from "../../services/dashboardService";
import {
  buildCategoryChartFromComplaints,
  buildMonthlyChartFromComplaints,
  buildPriorityChartFromComplaints,
  buildStatusChartFromComplaints,
  computeStatsFromComplaints,
  mapCategoryAnalytics,
  mapDashboardSummary,
  mapPriorityAnalytics,
  mapStatusAnalytics,
} from "../../mappers/dashboardMapper";
import { mapListItemToComplaint } from "../../mappers/complaintMapper";
import type { ChartDataPoint } from "../../types/api";
import type { Complaint, DashboardStats } from "../../types";

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [lineChartData, setLineChartData] = useState<ChartDataPoint[]>([]);
  const [doughnutData, setDoughnutData] = useState<ChartDataPoint[]>([]);
  const [priorityData, setPriorityData] = useState<ChartDataPoint[]>([]);
  const [statusData, setStatusData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return;

      try {
        const complaints = await getComplaintsForRole(user.role);
        const mapped = complaints.map(mapListItemToComplaint);

        setRecentComplaints(mapped.slice(0, 5));
        setLineChartData(buildMonthlyChartFromComplaints(complaints));

        if (user.role === "admin") {
          try {
            const [summary, categories, priorities, statuses] =
              await Promise.all([
                getDashboardSummary(),
                getCategoryAnalytics(),
                getPriorityAnalytics(),
                getStatusAnalytics(),
              ]);

            setStats(mapDashboardSummary(summary));
            setDoughnutData(mapCategoryAnalytics(categories));
            setPriorityData(mapPriorityAnalytics(priorities));
            setStatusData(mapStatusAnalytics(statuses));
          } catch {
            setStats(computeStatsFromComplaints(complaints));
            setDoughnutData(buildCategoryChartFromComplaints(complaints));
            setPriorityData(buildPriorityChartFromComplaints(complaints));
            setStatusData(buildStatusChartFromComplaints(complaints));
          }
        } else {
          setStats(computeStatsFromComplaints(complaints));
          setDoughnutData(buildCategoryChartFromComplaints(complaints));
          setPriorityData(buildPriorityChartFromComplaints(complaints));
          setStatusData(buildStatusChartFromComplaints(complaints));
        }
      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user]);

  if (!user) return null;

  const hasChartData = (data: ChartDataPoint[]) =>
    data.some((d) => d.value > 0);

  return (
    <DashboardLayout>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description={
          user.role === "student"
            ? "Track your complaints and wellbeing requests in one place."
            : user.role === "staff"
              ? "Review and manage complaints assigned to you."
              : "Monitor system-wide grievance metrics and team performance."
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Complaints"
          value={stats?.total ?? 0}
          icon={<Inbox className="w-5 h-5" />}
          accentColor="primary"
          loading={loading}
        />
        <StatCard
          label="Pending"
          value={stats?.pending ?? 0}
          icon={<Clock className="w-5 h-5" />}
          accentColor="warning"
          loading={loading}
        />
        <StatCard
          label="Assigned"
          value={stats?.assigned ?? 0}
          icon={<UserCheck className="w-5 h-5" />}
          accentColor="accent"
          loading={loading}
        />
        <StatCard
          label="Resolved"
          value={stats?.resolved ?? 0}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="success"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Closed"
          value={stats?.closed ?? 0}
          icon={<Archive className="w-5 h-5" />}
          accentColor="neutral"
          loading={loading}
        />
        <StatCard
          label="Critical"
          value={stats?.critical ?? 0}
          icon={<AlertTriangle className="w-5 h-5" />}
          accentColor="error"
          loading={loading}
        />
        <StatCard
          label="Overdue SLA"
          value={stats?.overdueSla ?? 0}
          icon={<Timer className="w-5 h-5" />}
          accentColor="error"
          loading={loading}
        />
        <StatCard
          label="Resolution Rate"
          value={`${Math.round(((stats?.resolved ?? 0) / (stats?.total ?? 1)) * 100)}%`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="success"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Monthly Complaints</CardTitle>
              <p className="text-sm text-neutral-500 mt-0.5">
                Complaint volume over the past 12 months
              </p>
            </div>
          </CardHeader>
          {loading ? (
            <Skeleton className="w-full h-[260px]" />
          ) : hasChartData(lineChartData) ? (
            <LineChart data={lineChartData} />
          ) : (
            <p className="text-sm text-neutral-400 py-16 text-center">
              No data available.
            </p>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          {loading ? (
            <Skeleton className="w-full h-[260px]" />
          ) : hasChartData(doughnutData) ? (
            <DoughnutChart
              data={doughnutData.map((d) => ({
                ...d,
                color: d.color ?? "#71717a",
              }))}
            />
          ) : (
            <p className="text-sm text-neutral-400 py-16 text-center">
              No data available.
            </p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          {loading ? (
            <Skeleton className="w-full h-[260px]" />
          ) : hasChartData(priorityData) ? (
            <BarChart data={priorityData} />
          ) : (
            <p className="text-sm text-neutral-400 py-16 text-center">
              No data available.
            </p>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          {loading ? (
            <Skeleton className="w-full h-[260px]" />
          ) : hasChartData(statusData) ? (
            <BarChart data={statusData} horizontal />
          ) : (
            <p className="text-sm text-neutral-400 py-16 text-center">
              No data available.
            </p>
          )}
        </Card>
      </div>

      <Card noPadding>
        <CardHeader className="px-5 pt-5 pb-3 mb-0">
          <CardTitle>Recent Complaints</CardTitle>
          <Link
            to="/complaints"
            className="flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-800 transition-colors"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        {loading ? (
          <div className="px-5 pb-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : recentComplaints.length === 0 ? (
          <p className="text-sm text-neutral-400 px-5 py-8 text-center">
            No complaints yet.
          </p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {recentComplaints.map((complaint) => (
              <Link
                key={complaint.id}
                to={`/complaints/${complaint.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-neutral-400">
                      {complaint.ticketId}
                    </span>
                    <StatusBadge status={complaint.status} />
                  </div>
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {complaint.title}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {formatRelativeTime(complaint.createdAt)}
                  </p>
                </div>
                <PriorityBadge priority={complaint.priority} />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
