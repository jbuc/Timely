import { useEffect, useRef, useCallback } from 'react';
import { useTimelyStore } from '../store';
import { getDueReminders } from '../engine/timeEngine';
import { triggerReminder, canShowNotifications } from '../services/notifications';

export function useTimeLoop(intervalMs: number = 100): void {
  const updateTimeStates = useTimelyStore((s) => s.updateTimeStates);
  const timeSpans = useTimelyStore((s) => s.timeSpans);
  const timeSpanStates = useTimelyStore((s) => s.timeSpanStates);
  const settings = useTimelyStore((s) => s.settings);
  const markReminderTriggered = useTimelyStore((s) => s.markReminderTriggered);

  const lastCheckRef = useRef<Record<string, number>>({});

  const checkReminders = useCallback(() => {
    if (!settings.notificationsEnabled || !canShowNotifications()) return;

    timeSpans.forEach((span) => {
      if (!span.enabled) return;

      const state = timeSpanStates[span.id];
      if (!state) return;

      // Get due reminders with a larger tolerance window
      const tolerance = Math.max(intervalMs * 2, 500);
      const dueReminders = getDueReminders(span, state, tolerance);

      dueReminders.forEach((index) => {
        const reminder = span.reminders[index];
        if (!reminder) return;

        // Check if we've already triggered this in this cycle
        const cycleKey = `${span.id}-${state.cycleCount}-${reminder.id}`;

        if (lastCheckRef.current[cycleKey]) return;

        // Mark as checked for this cycle
        lastCheckRef.current[cycleKey] = Date.now();

        // Trigger the reminder
        triggerReminder(reminder, span, settings);
        markReminderTriggered(span.id, reminder.id);
      });
    });
  }, [timeSpans, timeSpanStates, settings, markReminderTriggered, intervalMs]);

  useEffect(() => {
    // Initial update
    updateTimeStates();

    // Set up interval for continuous updates
    const interval = setInterval(() => {
      updateTimeStates();
      checkReminders();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [updateTimeStates, checkReminders, intervalMs]);
}
