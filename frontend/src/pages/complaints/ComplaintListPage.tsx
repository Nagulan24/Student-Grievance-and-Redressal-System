import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Inbox,
  ArrowUpDown,
  Plus,
  Download,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { PageHeader } from "../../components/layout/PageHeader";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Input";
import { StatusBadge, PriorityBadge } from "../../components/ui/Badge";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { Pagination } from "../../components/ui/Pagination";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonTable } from "../../components/ui/Skeleton";
import {
  formatRelativeTime,
  getCategoryLabel,
  paginate,
  totalPages,
} from "../../lib/utils";
import { getComplaintsForRole } from "../../services/complaintService";
import { mapListItemToComplaint } from "../../mappers/complaintMapper";
import type { Complaint, ComplaintStatus, ComplaintPriority } from "../../types";

type SortField = "createdAt" | "priority" | "status" | "ticketId";
type SortDir = "asc" | "desc";

const priorityOrder: Record<ComplaintPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const statusOrder: Record<ComplaintStatus, number> = {
  open: 0,
  in_review: 1,
  assigned: 2,
  in_progress: 3,
  resolved: 4,
  closed: 5,
  rejected: 6,
};

export function ComplaintListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    async function loadComplaints() {
      try {
        const data = await getComplaintsForRole(user!.role);
        setComplaints(data.map(mapListItemToComplaint));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadComplaints();
    }
  }, [user]);

  const filtered = useMemo(() => {
    let result = [...complaints];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.ticketId.toLowerCase().includes(q),
      );
    }
    if (statusFilter) result = result.filter((c) => c.status === statusFilter);
    if (priorityFilter) result = result.filter((c) => c.priority === priorityFilter);
    if (categoryFilter) result = result.filter((c) => c.category === categoryFilter);

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "createdAt") {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === "priority") {
        cmp = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortField === "status") {
        cmp = statusOrder[a.status] - statusOrder[b.status];
      } else if (sortField === "ticketId") {
        cmp = a.ticketId.localeCompare(b.ticketId);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [complaints, search, statusFilter, priorityFilter, categoryFilter, sortField, sortDir]);

  const paginatedData = paginate(filtered, currentPage, perPage);
  const total = totalPages(filtered.length, perPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const handleExport = () => {
    if (filtered.length === 0) return;

    const headers = [
      "Ticket ID",
      "Title",
      "Category",
      "Status",
      "Priority",
      "Submitted By",
      "Created At",
    ];

    const rows = filtered.map((c) => [
      c.ticketId,
      `"${c.title.replace(/"/g, '""')}"`,
      c.category,
      c.status,
      c.priority,
      c.submittedByName,
      c.createdAt,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join(
      "\n",
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `complaints-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<Complaint>[] = [
    {
      key: "ticketId",
      header: "Ticket",
      width: "120px",
      render: (item) => (
        <span className="font-mono text-xs text-neutral-500">{item.ticketId}</span>
      ),
    },
    {
      key: "title",
      header: "Title",
      render: (item) => (
        <div className="max-w-xs">
          <p className="font-medium text-neutral-900 truncate">{item.title}</p>
          <p className="text-xs text-neutral-500 mt-0.5">
            {getCategoryLabel(item.category)}
          </p>
        </div>
      ),
    },
    {
      key: "submittedByName",
      header: user?.role === "student" ? "Assigned To" : "Submitted By",
      render: (item) =>
        user?.role === "student" ? (
          <span className="text-sm text-neutral-600">
            {item.assignedToName || "Unassigned"}
          </span>
        ) : (
          <span className="text-sm text-neutral-600">{item.submittedByName}</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      width: "130px",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "priority",
      header: "Priority",
      width: "100px",
      render: (item) => <PriorityBadge priority={item.priority} />,
    },
    {
      key: "createdAt",
      header: "Created",
      width: "120px",
      render: (item) => (
        <span className="text-xs text-neutral-500">
          {formatRelativeTime(item.createdAt)}
        </span>
      ),
    },
  ];

  const pageTitle =
    user?.role === "staff"
      ? "Assigned Complaints"
      : user?.role === "admin"
        ? "Complaint Management"
        : "My Complaints";

  return (
    <DashboardLayout>
      <PageHeader
        title={pageTitle}
        description={
          user?.role === "student"
            ? "View and track all complaints you have submitted."
            : user?.role === "staff"
              ? "Complaints assigned to you for resolution."
              : "Manage and monitor all complaints across the system."
        }
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: pageTitle }]}
        actions={
          user?.role === "student" ? (
            <Button onClick={() => navigate("/complaints/new")} icon={<Plus className="w-4 h-4" />}>
              New Complaint
            </Button>
          ) : user?.role === "admin" ? (
            <Button
              variant="outline"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExport}
            >
              Export
            </Button>
          ) : undefined
        }
      />

      <Card className="mb-5">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by title, ticket ID, or name..."
              icon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex gap-3">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_review">In Review</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="rejected">Rejected</option>
            </Select>
            <Select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </Select>
            <Select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Categories</option>
              {Array.from(
                new Set(complaints.map((c) => c.category)),
              ).map((category) => (
                <option key={category} value={category}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100">
          <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-400">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort by:
          </span>
          {(["createdAt", "priority", "status", "ticketId"] as SortField[]).map((field) => (
            <button
              key={field}
              onClick={() => handleSort(field)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                sortField === field
                  ? "bg-primary-50 text-primary-700"
                  : "text-neutral-500 hover:bg-neutral-100"
              }`}
            >
              {field === "createdAt" ? "Date" : field.charAt(0).toUpperCase() + field.slice(1)}
              {sortField === field && (sortDir === "asc" ? " ↑" : " ↓")}
            </button>
          ))}
        </div>
      </Card>

      <Card noPadding>
        {loading ? (
          <div className="p-5">
            <SkeletonTable rows={8} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Inbox className="w-7 h-7" />}
            title="No complaints found"
            description={
              search || statusFilter || priorityFilter || categoryFilter
                ? "Try adjusting your filters or search query."
                : "There are no complaints to display yet."
            }
            action={
              user?.role === "student" ? (
                <Button onClick={() => navigate("/complaints/new")} icon={<Plus className="w-4 h-4" />}>
                  Create your first complaint
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={paginatedData}
              onRowClick={(item) => navigate(`/complaints/${item.id}`)}
            />
            <div className="px-5 py-4 border-t border-neutral-100">
              <Pagination
                currentPage={currentPage}
                totalPages={total}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </Card>
    </DashboardLayout>
  );
}
