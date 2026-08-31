/**
 * Fidback — Notification Utility
 * Uses the browser's Web Notifications API + persistent dismissal memory.
 */

export type FidbackNotification = {
  id: string;
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  href?: string;
  createdAt: number;
  read: boolean;
  type: "feedback" | "update" | "moderation" | "system";
};

const STORAGE_KEY = "fidback_notifications";
const DISMISSED_KEYS_KEY = "fidback_dismissed_notif_signatures";

/** Get set of permanently dismissed notification signatures */
export function getDismissedSignatures(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DISMISSED_KEYS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

/** Mark a signature as permanently dismissed */
export function markSignatureDismissed(signature: string) {
  if (typeof window === "undefined") return;
  const set = getDismissedSignatures();
  set.add(signature);
  localStorage.setItem(DISMISSED_KEYS_KEY, JSON.stringify(Array.from(set).slice(-300)));
}

/** Request browser notification permission */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return await Notification.requestPermission();
}

/** Fire a native browser notification */
export function sendBrowserNotification(
  title: string,
  body: string,
  options?: { icon?: string; tag?: string; href?: string }
) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const notif = new Notification(title, {
    body,
    icon: options?.icon || "/logo.png",
    tag: options?.tag,
    badge: "/logo.png",
  });

  if (options?.href) {
    notif.onclick = () => {
      window.focus();
      window.location.href = options.href!;
    };
  }
}

/** Store a notification in localStorage and dispatch custom event */
export function pushNotification(notif: Omit<FidbackNotification, "id" | "createdAt" | "read">) {
  if (typeof window === "undefined") return;

  const signature = `${notif.title}_${notif.body}`.trim();
  const dismissed = getDismissedSignatures();
  // If this notification was cleared/dismissed by the user, ignore it
  if (dismissed.has(signature)) {
    return;
  }

  const stored = getStoredNotifications();
  // Check if identical active notification is already in the list
  if (stored.some((n) => `${n.title}_${n.body}`.trim() === signature)) {
    return;
  }

  const newNotif: FidbackNotification = {
    ...notif,
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: Date.now(),
    read: false,
  };

  const updated = [newNotif, ...stored].slice(0, 50); // Keep last 50
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Dispatch event so all layout components can react
  window.dispatchEvent(new CustomEvent("fidback_notification", { detail: newNotif }));

  // Also fire native browser notification
  sendBrowserNotification(notif.title, notif.body, {
    icon: "/logo.png",
    tag: notif.type,
    href: notif.href,
  });
}

/** Get all stored notifications */
export function getStoredNotifications(): FidbackNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Count unread notifications */
export function getUnreadCount(): number {
  return getStoredNotifications().filter((n) => !n.read).length;
}

/** Mark all as read */
export function markAllRead() {
  if (typeof window === "undefined") return;
  const updated = getStoredNotifications().map((n) => ({ ...n, read: true }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("fidback_notifications_read"));
}

/** Mark one as read */
export function markOneRead(id: string) {
  if (typeof window === "undefined") return;
  const updated = getStoredNotifications().map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("fidback_notifications_read"));
}

/** Delete a single notification permanently */
export function deleteOneNotification(id: string) {
  if (typeof window === "undefined") return;
  const stored = getStoredNotifications();
  const target = stored.find((n) => n.id === id);
  if (target) {
    markSignatureDismissed(`${target.title}_${target.body}`.trim());
  }
  const updated = stored.filter((n) => n.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("fidback_notifications_read"));
}

/** Clear all notifications permanently */
export function clearNotifications() {
  if (typeof window === "undefined") return;
  const stored = getStoredNotifications();
  // Mark all current notifications as dismissed so sync won't recreate them
  stored.forEach((n) => {
    markSignatureDismissed(`${n.title}_${n.body}`.trim());
  });
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("fidback_notifications_read"));
}

/** Relative time helper */
export function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return `Il y a ${Math.floor(diff / 86400)} j`;
}
