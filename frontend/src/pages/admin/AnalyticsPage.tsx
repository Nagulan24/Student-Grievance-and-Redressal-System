import { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  Clock,
  Target,
} from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";
import { StatCard } from "../../components/dashboard/StatCard";
import { Skeleton } from "../../components/ui/Skeleton";
import { LineChart } from "../../components/charts/LineChart";
import { DoughnutChart } from "../../components/charts/DoughnutChart";
import { BarChart } from "../../components/charts/BarChart";
import {
  getCategoryAnalytics,
  getDashboardSummary,
  getPriorityAnalytics,
  getStatusAnalytics,
} from "../../services/dashboardService";
import { getAllComplaints } from "../../services/complaintService";
import {
  buildMonthlyChartFromComplaints,
  mapCategoryAnalytics,
  mapDashboardSummary,
  mapPriorityAnalytics,
  mapStatusAnalytics,
} from "../../mappers/dashboardMapper";
import type { ChartDataPoint } from "../../types/api";
import type { DashboardStats } from "../../types";

export function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lineData, setLineData] = useState<ChartDataPoint[]>([]);
  const [categoryData, setCategoryData] = useState<ChartDataPoint[]>([]);
  const [priorityData, setPriorityData] = useState<ChartDataPoint[]>([]);
  const [statusData, setStatusData] = useState<ChartDataPoint[]>([]);
  const [avgResolution, setAvgResolution] = useState<string>("—");
  const [slaCompliance, setSlaCompliance] = useState<string>("—");
  const [activeUsers, setActiveUsers] = useState<number | string>("—");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const complaints = await getAllComplaints();
        setLineData(buildMonthlyChartFromComplaints(complaints));

        try {
          const [summary, categories, priorities, statuses] =
            await Promise.all([
              getDashboardSummary(),
              getCategoryAnalytics(),
              getPriorityAnalytics(),
              getStatusAnalytics(),
            ]);

          setStats(mapDashboardSummary(summary));
          setCategoryData(mapCategoryAnalytics(categories));
          setPriorityData(mapPriorityAnalytics(priorities));
          setStatusData(mapStatusAnalytics(statuses));

          if (summary.avg_resolution_hours != null) {
            setAvgResolution(`${summary.avg_resolution_hours} hrs`);
          }

          if (summary.sla_compliance_percent != null) {
            setSlaCompliance(`${summary.sla_compliance_percent}%`);
          }

          if (summary.active_users != null) {
            setActiveUsers(summary.active_users);
          }
        } catch {
          setStats(null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  const hasChartData = (data: ChartDataPoint[]) =>
    data.some((d) => d.value > 0);

  return (
    <DashboardLayout>
      <PageHeader
        title="Analytics Dashboard"
        description="System-wide metrics, trends, and performance insights."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Analytics" }]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Complaints"
          value={stats?.total ?? "—"}
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="primary"
          loading={loading}
        />
        <StatCard
          label="Avg. Resolution Time"
          value={avgResolution}
          icon={<Clock className="w-5 h-5" />}
          accentColor="accent"
          loading={loading}
        />
        <StatCard
          label="SLA Compliance"
          value={slaCompliance}
          icon={<Target className="w-5 h-5" />}
          accentColor="success"
          loading={loading}
        />
        <StatCard
          label="Active Users"
          value={activeUsers}
          icon={<Users className="w-5 h-5" />}
          accentColor="warning"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Complaint Volume Trend</CardTitle>
              <p className="text-sm text-neutral-500 mt-0.5">
                Monthly complaint submissions over the past year
              </p>
            </div>
          </CardHeader>
          {loading ? (
            <Skeleton className="w-full h-[280px]" />
          ) : hasChartData(lineData) ? (
            <LineChart data={lineData} height={280} />
          ) : (
            <p className="text-sm text-neutral-400 py-20 text-center">
              No data available.
            </p>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By Category</CardTitle>
          </CardHeader>
          {loading ? (
            <Skeleton className="w-full h-[280px]" />
          ) : hasChartData(categoryData) ? (
            <DoughnutChart
              data={categoryData.map((d) => ({
                ...d,
                color: d.color ?? "#71717a",
              }))}
              height={280}
            />
          ) : (
            <p className="text-sm text-neutral-400 py-20 text-center">
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
        <CardHeader className="px-5 pt-5 mb-0">
          <CardTitle>Staff Performance</CardTitle>
        </CardHeader>
        <div className="px-5 pb-5">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400 py-8 text-center">
              Coming Soon — staff performance analytics are not yet available from the backend.
            </p>
          )}
        </div>
      </Card>
    </DashboardLayout>
  );
}
