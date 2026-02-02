import { Reminder, TimeSpanConfig, AppSettings } from '../types';

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Check if notifications are supported and permitted
export function canShowNotifications(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

// Show a notification
export function showNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!canShowNotifications()) return null;

  return new Notification(title, {
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    ...options,
  });
}

// Trigger a reminder notification
export function triggerReminder(
  reminder: Reminder,
  timeSpan: TimeSpanConfig,
  settings: AppSettings
): void {
  if (!settings.notificationsEnabled) return;

  const notification = showNotification(`Timely: ${timeSpan.name}`, {
    body: reminder.message,
    tag: `reminder-${reminder.id}`,
    requireInteraction: false,
    silent: !settings.soundEnabled,
  });

  // Vibrate if supported and enabled
  if (settings.vibrateEnabled && 'vibrate' in navigator) {
    navigator.vibrate([200, 100, 200]);
  }

  // Auto-close notification after 5 seconds
  if (notification) {
    setTimeout(() => notification.close(), 5000);
  }
}

// Play a notification sound
export function playNotificationSound(soundUrl?: string): void {
  const audio = new Audio(soundUrl ?? '/sounds/notification.mp3');
  audio.volume = 0.5;
  audio.play().catch(() => {
    // Ignore errors (e.g., user hasn't interacted with page)
  });
}

// Vibrate pattern
export function vibrate(pattern: number | number[] = [200, 100, 200]): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

// Service worker registration for background notifications
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}

// Schedule a notification using service worker (for when app is in background)
export async function scheduleNotification(
  reminder: Reminder,
  timeSpan: TimeSpanConfig,
  triggerTime: number
): Promise<void> {
  const registration = await navigator.serviceWorker.ready;

  // Check if showNotification is available on the registration
  if ('showNotification' in registration) {
    // Calculate delay
    const delay = triggerTime - Date.now();
    if (delay <= 0) return;

    // Use setTimeout for now (in a real app, you'd use the Background Sync API or Push)
    setTimeout(() => {
      registration.showNotification(`Timely: ${timeSpan.name}`, {
        body: reminder.message,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: `reminder-${reminder.id}`,
        requireInteraction: false,
      });
    }, delay);
  }
}
