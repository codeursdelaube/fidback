"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, X, CheckCheck, Trash2, ExternalLink } from "lucide-react";
import {
  FidbackNotification,
  getStoredNotifications,
  getUnreadCount,
  markAllRead,
  markOneRead,
  clearNotifications,
  requestNotificationPermission,
  timeAgo,
} from "@/lib/notifications";
import Link from "next/link";

interface NotificationBellProps {
  variant?: "light" | "dark"; // light = user navbar, dark = dashboard header
}

export default function NotificationBell({ variant = "light" }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<FidbackNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [permissionAsked, setPermissionAsked] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const refresh = () => {
    const notifs = getStoredNotifications();
    setNotifications(notifs);
    setUnread(getUnreadCount());
  };

  useEffect(() => {
    refresh();

    const onNotif = () => refresh();
    const onRead = () => refresh();

    window.addEventListener("fidback_notification", onNotif);
    window.addEventListener("fidback_notifications_read", onRead);

    // Poll every 5s for cross-tab updates
    const interval = setInterval(refresh, 5000);

    return () => {
      window.removeEventListener("fidback_notification", onNotif);
      window.removeEventListener("fidback_notifications_read", onRead);
      clearInterval(interval);
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleBellClick = async () => {
    if (!open && !permissionAsked) {
      setPermissionAsked(true);
      await requestNotificationPermission();
    }
    setOpen((v) => !v);
    if (!open) {
      // Mark all read when opening panel
      markAllRead();
      setUnread(0);
    }
  };

  const typeIcon = (type: FidbackNotification["type"]) => {
    switch (type) {
      case "feedback": return "💬";
      case "update": return "📢";
      case "moderation": return "🛡️";
      default: return "🔔";
    }
  };

  const bellClass =
    variant === "dark"
      ? "p-2 rounded-full text-slate-400 hover:text-emerald-400 hover:bg-slate-900 transition-colors relative"
      : "p-2 rounded-full text-slate-500 hover:text-slate-950 hover:bg-slate-100 transition-colors relative";

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={handleBellClick}
        className={bellClass}
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className={`w-5 h-5 ${open ? (variant === "dark" ? "text-emerald-400" : "text-slate-950") : ""}`} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center px-1 shadow-sm animate-bounce-once">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl shadow-xl border z-50 overflow-hidden ${
            variant === "dark"
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200"
          }`}
          style={{ maxHeight: "28rem" }}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between px-5 py-3.5 border-b ${
              variant === "dark" ? "border-slate-800" : "border-slate-100"
            }`}
          >
            <span className={`text-xs font-extrabold ${variant === "dark" ? "text-white" : "text-slate-950"}`}>
              Notifications
            </span>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={() => { markAllRead(); refresh(); }}
                    title="Tout marquer comme lu"
                    className="p-1.5 rounded-full hover:bg-emerald-50 text-emerald-600 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { clearNotifications(); refresh(); }}
                    title="Tout effacer"
                    className="p-1.5 rounded-full hover:bg-rose-50 text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
              <button
                onClick={() => setOpen(false)}
                className={`p-1.5 rounded-full transition-colors ${
                  variant === "dark" ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-400"
                }`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: "22rem" }}>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Bell className={`w-8 h-8 ${variant === "dark" ? "text-slate-700" : "text-slate-200"}`} />
                <p className={`text-xs font-medium ${variant === "dark" ? "text-slate-500" : "text-slate-400"}`}>
                  Aucune notification pour l&apos;instant
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markOneRead(notif.id)}
                  className={`flex items-start gap-3 px-4 py-3.5 border-b last:border-b-0 cursor-pointer transition-colors ${
                    variant === "dark"
                      ? `border-slate-800 ${!notif.read ? "bg-emerald-950/20" : "hover:bg-slate-800/50"}`
                      : `border-slate-50 ${!notif.read ? "bg-emerald-50/60" : "hover:bg-slate-50"}`
                  }`}
                >
                  <span className="text-lg shrink-0 mt-0.5">{typeIcon(notif.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-[11px] font-bold leading-tight ${variant === "dark" ? "text-white" : "text-slate-950"}`}>
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
                      )}
                    </div>
                    <p className={`text-[10px] mt-0.5 leading-relaxed line-clamp-2 ${variant === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                      {notif.body}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className={`text-[10px] ${variant === "dark" ? "text-slate-600" : "text-slate-400"}`}>
                        {timeAgo(notif.createdAt)}
                      </span>
                      {notif.href && (
                        <Link
                          href={notif.href}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-0.5"
                        >
                          Voir <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
