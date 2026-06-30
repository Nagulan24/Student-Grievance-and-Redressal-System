import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import {
  Search,
  UserPlus,
  Users,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Pencil,
} from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Input";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { Modal } from "../../components/ui/Modal";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { SkeletonTable } from "../../components/ui/Skeleton";
import {
  createUser,
  getUserStats,
  listUsers,
  updateUser,
} from "../../services/userService";
import { getDepartments } from "../../services/departmentService";
import { mapUserListItemToUser } from "../../mappers/userMapper";
import {
  ALL_ASSIGNABLE_ROLES,
  formatBackendRole,
} from "../../mappers/roleMapper";
import { formatDate } from "../../lib/utils";
import type { User, UserRole } from "../../types";
import type {
  DepartmentApi,
  UserListItemApi,
  UserStatsApi,
} from "../../types/api";

const roleConfig: Record<
  UserRole,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }
> = {
  student: {
    label: "Student",
    icon: GraduationCap,
    color: "bg-primary-50 text-primary-700 border-primary-200",
  },
  staff: {
    label: "Staff",
    icon: Briefcase,
    color: "bg-accent-50 text-accent-700 border-accent-200",
  },
  admin: {
    label: "Admin",
    icon: ShieldCheck,
    color: "bg-error-50 text-error-700 border-error-200",
  },
};

export function UserManagementPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [users, setUsers] = useState<UserListItemApi[]>([]);
  const [stats, setStats] = useState<UserStatsApi | null>(null);
  const [departments, setDepartments] = useState<DepartmentApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserListItemApi | null>(
    null,
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("STUDENT");
  const [formRegisterNo, setFormRegisterNo] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formDepartmentId, setFormDepartmentId] = useState("");

  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editActive, setEditActive] = useState(true);

  const loadUsers = useCallback(async () => {
    const [userRows, userStats, departmentRows] = await Promise.all([
      listUsers({
        search: search.trim() || undefined,
        role: roleFilter || undefined,
      }),
      getUserStats(),
      getDepartments(),
    ]);
    setUsers(userRows);
    setStats(userStats);
    setDepartments(departmentRows);
  }, [search, roleFilter]);

  useEffect(() => {
    async function load() {
      try {
        await loadUsers();
      } catch (error) {
        console.error(error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [loadUsers]);

  const tableUsers = useMemo(
    () => users.map(mapUserListItemToUser),
    [users],
  );

  const openEditModal = (item: UserListItemApi) => {
    setSelectedUser(item);
    setEditName(item.name);
    setEditPhone(item.phone ?? "");
    setEditRole(item.role);
    setEditActive(item.is_active);
  };

  const resetAddForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("STUDENT");
    setFormRegisterNo("");
    setFormPhone("");
    setFormDepartmentId("");
  };

  const handleCreateUser = async () => {
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      toast.error("Name, email, and password are required");
      return;
    }

    setSaving(true);
    try {
      await createUser({
        name: formName.trim(),
        email: formEmail.trim(),
        password: formPassword,
        role: formRole,
        register_no: formRegisterNo.trim() || undefined,
        phone: formPhone.trim() || undefined,
        department_id: formDepartmentId
          ? Number(formDepartmentId)
          : undefined,
      });
      toast.success("User created");
      setShowAddModal(false);
      resetAddForm();
      await loadUsers();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      await updateUser(selectedUser.user_id, {
        name: editName.trim(),
        phone: editPhone.trim() || undefined,
        role: editRole,
        is_active: editActive,
      });
      toast.success("User updated");
      setSelectedUser(null);
      await loadUsers();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "User",
      render: (item) => (
        <div className="flex items-center gap-3">
          <Avatar name={item.name} size="sm" />
          <div>
            <p className="font-medium text-neutral-900">{item.name}</p>
            <p className="text-xs text-neutral-500">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      width: "120px",
      render: (item) => (
        <Badge variant="default">{roleConfig[item.role].label}</Badge>
      ),
    },
    {
      key: "department",
      header: "Department",
      render: (item) => (
        <span className="text-sm text-neutral-600">
          {item.department || "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "100px",
      render: (item) => (
        <span
          className={`text-xs font-medium ${
            item.lastActive === "Active"
              ? "text-success-600"
              : "text-neutral-400"
          }`}
        >
          {item.lastActive}
        </span>
      ),
    },
    {
      key: "joinedAt",
      header: "Joined",
      width: "120px",
      render: (item) => (
        <span className="text-xs text-neutral-500">
          {item.joinedAt ? formatDate(item.joinedAt) : "—"}
        </span>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="User Management"
        description="Manage student, staff, and admin accounts."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Users" }]}
        actions={
          <Button
            icon={<UserPlus className="w-4 h-4" />}
            onClick={() => setShowAddModal(true)}
          >
            Add User
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">
                {stats?.students ?? "—"}
              </p>
              <p className="text-xs text-neutral-500">Students</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-accent-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">
                {stats?.staff ?? "—"}
              </p>
              <p className="text-xs text-neutral-500">Staff</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-error-50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-error-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">
                {stats?.admins ?? "—"}
              </p>
              <p className="text-xs text-neutral-500">Admins</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by name, email, or student ID..."
              icon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="staff">Staff</option>
            <option value="admin">Admins</option>
          </Select>
        </div>
      </Card>

      <Card noPadding>
        {loading ? (
          <div className="p-5">
            <SkeletonTable rows={8} />
          </div>
        ) : tableUsers.length === 0 ? (
          <EmptyState
            icon={<Users className="w-7 h-7" />}
            title="No users found"
            description="Try adjusting your search or filters."
          />
        ) : (
          <DataTable
            columns={columns}
            data={tableUsers}
            onRowClick={(item) => {
              const source = users.find((u) => u.user_id.toString() === item.id);
              if (source) openEditModal(source);
            }}
          />
        )}
      </Card>

      <Modal
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="User Details"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelectedUser(null)}>
              Close
            </Button>
            <Button
              icon={<Pencil className="w-4 h-4" />}
              onClick={handleUpdateUser}
              loading={saving}
            >
              Save Changes
            </Button>
          </>
        }
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar name={selectedUser.name} size="xl" />
              <div>
                <h3 className="text-lg font-bold text-neutral-900">
                  {selectedUser.name}
                </h3>
                <p className="text-sm text-neutral-500">{selectedUser.email}</p>
              </div>
            </div>
            <Input
              label="Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <Input
              label="Phone"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
            />
            <Select
              label="Role"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
            >
              {ALL_ASSIGNABLE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {formatBackendRole(role)}
                </option>
              ))}
            </Select>
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={editActive}
                onChange={(e) => setEditActive(e.target.checked)}
                className="rounded border-neutral-300"
              />
              Active account
            </label>
          </div>
        )}
      </Modal>

      <Modal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetAddForm();
        }}
        title="Add User"
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setShowAddModal(false);
                resetAddForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateUser} loading={saving}>
              Create User
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            value={formPassword}
            onChange={(e) => setFormPassword(e.target.value)}
          />
          <Select
            label="Role"
            value={formRole}
            onChange={(e) => setFormRole(e.target.value)}
          >
            {ALL_ASSIGNABLE_ROLES.map((role) => (
              <option key={role} value={role}>
                {formatBackendRole(role)}
              </option>
            ))}
          </Select>
          {formRole === "STUDENT" && (
            <Input
              label="Register Number"
              value={formRegisterNo}
              onChange={(e) => setFormRegisterNo(e.target.value)}
            />
          )}
          <Input
            label="Phone"
            value={formPhone}
            onChange={(e) => setFormPhone(e.target.value)}
          />
          <Select
            label="Department"
            value={formDepartmentId}
            onChange={(e) => setFormDepartmentId(e.target.value)}
          >
            <option value="">No department</option>
            {departments.map((department) => (
              <option
                key={department.department_id}
                value={department.department_id}
              >
                {department.department_name}
              </option>
            ))}
          </Select>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
