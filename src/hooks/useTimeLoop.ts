import { useEffect, useRef } from 'react';
import { useTimelyStore } from '../store';
import { getDueReminders } from '../engine/timeEngine';
import { triggerReminder, canShowNotifications } from '../services/notifications';

export function useTimeLoop(intervalMs: number = 100): void {
  const lastCheckRef = useRef<Record<string, number>>({});

  useEffect(() => {
    // Get stable reference to store actions
    const { updateTimeStates, markReminderTriggered } = useTimelyStore.getState();

    const tick = () => {
      // Update time states
      updateTimeStates();

      // Check reminders using fresh state
      const { timeSpans, timeSpanStates, settings } = useTimelyStore.getState();

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
    };

    // Initial tick
    tick();

    // Set up interval for continuous updates
    const interval = setInterval(tick, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);
}
