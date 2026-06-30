import {
  Mail,
  Phone,
  Building2,
  Calendar,
  CreditCard,
  Bell,
  Shield,
  Globe,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { PageHeader } from "../../components/layout/PageHeader";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { roleLabels } from "../../config/navigation";
import { formatDate } from "../../lib/utils";

export function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <DashboardLayout>
      <PageHeader
        title="Profile"
        description="Manage your personal information and preferences."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Profile" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="space-y-5">
          <Card className="text-center">
            <div className="flex flex-col items-center">
              <Avatar name={user.name} size="xl" className="mb-4" />
              <h2 className="text-lg font-bold text-neutral-900">{user.name}</h2>
              <p className="text-sm text-neutral-500 mt-0.5">{user.email}</p>
              <div className="mt-3">
                <Badge variant="default">{roleLabels[user.role]}</Badge>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-neutral-100 space-y-3 text-left">
              {user.studentId && (
                <div className="flex items-center gap-3 text-sm">
                  <CreditCard className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-500">Student ID</span>
                  <span className="ml-auto font-medium text-neutral-900 font-mono">
                    {user.studentId}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-500">Phone</span>
                <span className="ml-auto font-medium text-neutral-900">
                  {user.phone || "—"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-500">Department</span>
                <span className="ml-auto font-medium text-neutral-900">
                  {user.department || "—"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-500">Joined</span>
                <span className="ml-auto font-medium text-neutral-900">
                  {user.joinedAt ? formatDate(user.joinedAt) : "—"}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Activity</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Last active</span>
                <span className="font-medium text-neutral-500">Coming Soon</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Account status</span>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Two-factor auth</span>
                <Badge variant="warning">Coming Soon</Badge>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Profile details loaded from your account
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" disabled>
                Edit
              </Button>
            </CardHeader>

            <p className="text-sm text-neutral-400 mb-5">
              Profile editing is coming soon. Your information is synced from the
              backend when you sign in.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full name"
                disabled
                icon={<CreditCard className="w-4 h-4" />}
                value={user.name}
                readOnly
              />
              <Input
                label="Email address"
                disabled
                icon={<Mail className="w-4 h-4" />}
                value={user.email}
                readOnly
              />
              <Input
                label="Phone number"
                disabled
                icon={<Phone className="w-4 h-4" />}
                value={user.phone || ""}
                readOnly
              />
              <Input
                label="Department"
                disabled
                icon={<Building2 className="w-4 h-4" />}
                value={user.department || ""}
                readOnly
              />
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what you want to be notified about</CardDescription>
              </div>
              <Bell className="w-5 h-5 text-neutral-400" />
            </CardHeader>
            <p className="text-sm text-neutral-400 mb-4">
              Notification preference settings are coming soon. You will continue
              receiving in-app notifications from the backend.
            </p>
            <div className="space-y-4">
              {[
                { label: "Complaint status updates", desc: "When a complaint's status changes" },
                { label: "New comments", desc: "When someone comments on your complaint" },
                { label: "SLA breach warnings", desc: "When a complaint is approaching its deadline" },
                { label: "Assignment notifications", desc: "When a complaint is assigned to you" },
                { label: "System announcements", desc: "Maintenance and platform updates" },
              ].map((pref, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0 opacity-60"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{pref.label}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{pref.desc}</p>
                  </div>
                  <span className="text-xs text-neutral-400">Coming Soon</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your password and security settings</CardDescription>
              </div>
              <Shield className="w-5 h-5 text-neutral-400" />
            </CardHeader>
            <p className="text-sm text-neutral-400 mb-4">
              Password change is coming soon.
            </p>
            <div className="space-y-4 opacity-60">
              <Input label="Current password" type="password" placeholder="••••••••" disabled />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="New password" type="password" placeholder="••••••••" disabled />
                <Input label="Confirm password" type="password" placeholder="••••••••" disabled />
              </div>
              <div className="flex justify-end">
                <Button variant="outline" icon={<Globe className="w-4 h-4" />} disabled>
                  Update Password
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
