import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Settings,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import type { UserRole } from "../../types";

interface LoginForm {
  email: string;
  password: string;
}

const demoAccounts: { role: UserRole; label: string; email: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { role: "student", label: "Student", email: "aarav.sharma@university.edu", icon: GraduationCap },
  { role: "staff", label: "Staff", email: "emily.chen@university.edu", icon: Briefcase },
  { role: "admin", label: "Admin", email: "marcus.johnson@university.edu", icon: Settings },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: {
      email: "aarav.sharma@university.edu",
      password: "demo1234",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success("Welcome back! Redirecting to your dashboard...");
      navigate("/dashboard");
    } catch {
      toast.error("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: UserRole, email: string) => {
    setSelectedRole(role);
    setValue("email", email);
    setValue("password", "demo1234");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-900 to-primary-950" />
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">Resolve</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
              Student Grievance & Wellbeing Management
            </h1>
            <p className="mt-5 text-base text-primary-200 leading-relaxed">
              A unified platform for students to raise concerns, track resolution
              progress, and access wellbeing support — all in one place.
            </p>

            <div className="mt-10 space-y-4">
              {[
                "Submit and track complaints with full transparency",
                "Real-time status updates and SLA monitoring",
                "Role-based dashboards for students, staff, and admins",
                "Comprehensive analytics and reporting",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                    <svg className="w-3 h-3 text-accent-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-primary-100">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-primary-300">
            <span>Trusted by 12,000+ students</span>
            <span className="w-1 h-1 rounded-full bg-primary-400" />
            <span>98% resolution rate</span>
          </div>
        </div>
      </div>

      {/* Right panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-neutral-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-primary-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-neutral-900">Resolve</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">Sign in to your account</h2>
            <p className="text-sm text-neutral-500 mt-1.5">
              Enter your credentials to access the portal
            </p>
          </div>

          {/* Demo role selector */}
          <div className="mb-6">
            <p className="text-xs font-medium text-neutral-500 mb-2.5">
              Quick demo access
            </p>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                const isActive = selectedRole === acc.role;
                return (
                  <button
                    key={acc.role}
                    onClick={() => handleDemoLogin(acc.role, acc.email)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? "border-primary-300 bg-primary-50 text-primary-800 shadow-sm"
                        : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {acc.label}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@university.edu"
              icon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              icon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-neutral-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                Remember me
              </label>
              <button
                type="button"
                className="text-sm font-medium text-primary-700 hover:text-primary-800 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="w-full"
            >
              {!loading && "Sign in"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-neutral-400">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
