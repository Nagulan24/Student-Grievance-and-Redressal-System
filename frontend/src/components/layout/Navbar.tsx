import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Settings,
  Check,
} from "lucide-react";
import { cn, formatRelativeTime } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { Avatar } from "../ui/Avatar";
import { roleLabels } from "../../config/navigation";
import {
  getNotifications,
  getUnreadCount,
} from "../../services/notificationService";
import { mapNotification } from "../../mappers/notificationMapper";
import type { AppNotification } from "../../types";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadNotifications() {
      if (!user) return;

      try {
        const [items, count] = await Promise.all([
          getNotifications(),
          getUnreadCount(),
        ]);
        setNotifications(items.map(mapNotification));
        setUnreadCount(count);
      } catch {
        setNotifications([]);
        setUnreadCount(0);
      }
    }

    loadNotifications();
  }, [user]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/complaints?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  if (!user) return null;

  const previewNotifications = notifications.slice(0, 5);

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 glass border-b border-neutral-200 flex items-center px-4 lg:px-6 gap-3">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search complaints, tickets..."
            className="w-full h-9 pl-10 pr-4 text-sm bg-neutral-100 border border-transparent rounded-lg placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-neutral-300 focus:ring-2 focus:ring-primary-500/10 transition-all"
          />
        </div>
      </form>

      <div className="flex-1 md:hidden" />

      <div className="flex items-center gap-1.5">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-neutral-200 animate-[slide-in_0.2s_ease-out] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                <h3 className="text-sm font-semibold text-neutral-900">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="text-xs font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {previewNotifications.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-neutral-400 text-center">
                    No notifications yet.
                  </p>
                ) : (
                  previewNotifications.map((notif) => (
                    <Link
                      key={notif.id}
                      to={notif.complaintId ? `/complaints/${notif.complaintId}` : "/notifications"}
                      onClick={() => setNotifOpen(false)}
                      className={cn(
                        "flex gap-3 px-4 py-3 border-b border-neutral-50 hover:bg-neutral-50 transition-colors",
                        !notif.read && "bg-primary-50/30",
                      )}
                    >
                      <div className="mt-0.5">
                        {!notif.read ? (
                          <span className="block w-2 h-2 rounded-full bg-primary-600" />
                        ) : (
                          <Check className="w-4 h-4 text-neutral-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {notif.title}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-[11px] text-neutral-400 mt-1">
                          {formatRelativeTime(notif.timestamp)}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
              <Link
                to="/notifications"
                onClick={() => setNotifOpen(false)}
                className="block px-4 py-3 text-center text-sm font-medium text-primary-700 hover:bg-primary-50 transition-colors"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 pr-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Avatar name={user.name} size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-neutral-900 leading-tight">
                {user.name}
              </p>
              <p className="text-[11px] text-neutral-500 leading-tight">
                {roleLabels[user.role]}
              </p>
            </div>
            <ChevronDown
              className={cn(
                "hidden sm:block w-4 h-4 text-neutral-400 transition-transform",
                profileOpen && "rotate-180",
              )}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-neutral-200 animate-[slide-in_0.2s_ease-out] overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-100">
                <p className="text-sm font-semibold text-neutral-900">{user.name}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{user.email}</p>
              </div>
              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-neutral-400" />
                  Profile
                </Link>
                <button className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                  <Settings className="w-4 h-4 text-neutral-400" />
                  Settings
                </button>
              </div>
              <div className="py-1 border-t border-neutral-100">
                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
