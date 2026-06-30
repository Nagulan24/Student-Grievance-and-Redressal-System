import { Link, useLocation } from "react-router-dom";
import { X, ChevronRight, ShieldCheck } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { navConfig, roleLabels } from "../../config/navigation";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const navItems = navConfig[user.role];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-neutral-900/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-neutral-200 flex flex-col transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-neutral-100 shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-neutral-900 tracking-tight">
                Resolve
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-3 pt-4 pb-2">
          <div className="px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-100">
            <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
              Signed in as
            </p>
            <p className="text-sm font-medium text-neutral-700 mt-0.5">
              {roleLabels[user.role]}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          <p className="px-3 pt-2 pb-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
            Menu
          </p>
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary-50 text-primary-800"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
                )}
              >
                <Icon
                  className={cn(
                    "w-[18px] h-[18px] shrink-0 transition-colors",
                    isActive
                      ? "text-primary-700"
                      : "text-neutral-400 group-hover:text-neutral-600",
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-primary-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-neutral-100 shrink-0">
          <div className="px-3 py-2.5 rounded-lg bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-100">
            <p className="text-xs font-medium text-neutral-700">
              Need help?
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Check the help center or contact support.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
