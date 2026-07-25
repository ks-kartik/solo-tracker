// IMPORTANT LIMITATION:
// This app has no backend/push server, so it can only fire reminder
// notifications while the PWA is actually open (foreground, or
// backgrounded but still running in memory). True background push -
// getting notified even when you haven't opened the app in days -
// requires a server that holds VAPID keys and calls the Push API,
// which is out of scope for a no-backend static PWA. If that's
// something you want later, it's a well-documented addition (a small
// Node/Cloudflare Worker endpoint + web-push library), just not
// something GitHub Pages alone can do.

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
}

export function notificationPermissionStatus() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

async function fireNotification(title, body, requireInteraction) {
  if (Notification.permission !== 'granted') return;

  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) {
      reg.showNotification(title, { body, requireInteraction, tag: title });
      return;
    }
  }
  new Notification(title, { body });
}

const notifiedTaskIdsToday = new Set();
let notifiedDate = null;

function timeMatchesNow(reminderTime) {
  if (!reminderTime) return false;
  const now = new Date();
  const [h, m] = reminderTime.split(':').map(Number);
  return now.getHours() === h && now.getMinutes() === m;
}

export function checkReminders(tasks) {
  if (Notification.permission !== 'granted') return;

  const today = new Date().toISOString().slice(0, 10);
  if (notifiedDate !== today) {
    notifiedTaskIdsToday.clear();
    notifiedDate = today;
  }

  for (const task of tasks) {
    if (
      task.type === 'daily' &&
      task.status === 'pending' &&
      task.reminderTime &&
      timeMatchesNow(task.reminderTime) &&
      !notifiedTaskIdsToday.has(task.id)
    ) {
      fireNotification('Quest reminder', task.title, !!task.hasAlarm);
      notifiedTaskIdsToday.add(task.id);
    }
  }
}
