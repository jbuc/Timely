import { Duration, TimeUnit, TimeSpanConfig, TimeSpanState } from '../types';

// Convert any duration to milliseconds
export function durationToMs(duration: Duration): number {
  const { value, unit } = duration;

  switch (unit) {
    case 'milliseconds':
      return value;
    case 'seconds':
      return value * 1000;
    case 'minutes':
      return value * 60 * 1000;
    case 'hours':
      return value * 60 * 60 * 1000;
    case 'days':
      return value * 24 * 60 * 60 * 1000;
    case 'weeks':
      return value * 7 * 24 * 60 * 60 * 1000;
    case 'months':
      // Approximate: 30.44 days per month
      return value * 30.44 * 24 * 60 * 60 * 1000;
    case 'years':
      // Approximate: 365.25 days per year
      return value * 365.25 * 24 * 60 * 60 * 1000;
    default:
      return value;
  }
}

// Get the start of a time unit for alignment
export function getAlignedStart(timestamp: number, alignTo: TimeUnit): number {
  const date = new Date(timestamp);

  switch (alignTo) {
    case 'seconds':
      date.setMilliseconds(0);
      break;
    case 'minutes':
      date.setSeconds(0, 0);
      break;
    case 'hours':
      date.setMinutes(0, 0, 0);
      break;
    case 'days':
      date.setHours(0, 0, 0, 0);
      break;
    case 'weeks': {
      date.setHours(0, 0, 0, 0);
      // Go back to Sunday (or configured start of week)
      const day = date.getDay();
      date.setDate(date.getDate() - day);
      break;
    }
    case 'months':
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      break;
    case 'years':
      date.setMonth(0, 1);
      date.setHours(0, 0, 0, 0);
      break;
  }

  return date.getTime();
}

// Calculate the current cycle start time for a repeating timespan
export function getCurrentCycleStart(config: TimeSpanConfig, now: number): number {
  const durationMs = durationToMs(config.duration);

  let baseStart: number;

  switch (config.startMode) {
    case 'fixed':
      baseStart = config.fixedStartTime ?? now;
      break;
    case 'aligned':
      baseStart = getAlignedStart(now, config.alignTo ?? 'hours');
      break;
    case 'now':
    default:
      // For 'now' mode, we need to track when it was first started
      // This should be stored in the config or state
      baseStart = config.fixedStartTime ?? now;
      break;
  }

  // Calculate how many complete cycles have passed
  const elapsed = now - baseStart;
  const completeCycles = Math.floor(elapsed / durationMs);

  // Return the start of the current cycle
  return baseStart + (completeCycles * durationMs);
}

// Calculate the full state of a time span
export function calculateTimeSpanState(config: TimeSpanConfig, now: number = Date.now()): TimeSpanState {
  if (!config.enabled) {
    return {
      configId: config.id,
      progress: 0,
      elapsed: 0,
      remaining: durationToMs(config.duration),
      cycleCount: 0,
      currentCycleStart: now,
      isActive: false,
    };
  }

  const durationMs = durationToMs(config.duration);
  const cycleStart = getCurrentCycleStart(config, now);
  const elapsed = now - cycleStart;
  const progress = Math.min(1, Math.max(0, elapsed / durationMs));
  const remaining = durationMs - elapsed;

  // Calculate total cycles
  let baseStart: number;
  if (config.startMode === 'fixed' || config.startMode === 'now') {
    baseStart = config.fixedStartTime ?? now;
  } else {
    baseStart = getAlignedStart(now, config.alignTo ?? 'hours');
  }
  const cycleCount = Math.floor((now - baseStart) / durationMs);

  return {
    configId: config.id,
    progress,
    elapsed,
    remaining,
    cycleCount,
    currentCycleStart: cycleStart,
    isActive: config.enabled,
  };
}

// Format duration for display
export function formatDuration(ms: number, compact: boolean = false): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (compact) {
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours % 24 > 0) parts.push(`${hours % 24} hour${hours % 24 !== 1 ? 's' : ''}`);
  if (minutes % 60 > 0) parts.push(`${minutes % 60} minute${minutes % 60 !== 1 ? 's' : ''}`);
  if (seconds % 60 > 0 && days === 0) parts.push(`${seconds % 60} second${seconds % 60 !== 1 ? 's' : ''}`);

  return parts.join(', ') || '0 seconds';
}

// Format time remaining
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return '0:00';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Check if a reminder should be triggered
export function shouldTriggerReminder(
  config: TimeSpanConfig,
  state: TimeSpanState,
  reminderIndex: number,
  tolerance: number = 1000 // 1 second tolerance
): boolean {
  const reminder = config.reminders[reminderIndex];
  if (!reminder || !reminder.enabled) return false;

  const durationMs = durationToMs(config.duration);
  const reminderTimeInCycle = reminder.position * durationMs;
  const currentTimeInCycle = state.elapsed;

  // Check if we're within tolerance of the reminder time
  const diff = Math.abs(currentTimeInCycle - reminderTimeInCycle);
  if (diff > tolerance) return false;

  // Check if we already triggered this reminder in this cycle
  if (reminder.lastTriggered) {
    const lastTriggerCycle = Math.floor((reminder.lastTriggered - state.currentCycleStart) / durationMs);
    const currentCycle = Math.floor((Date.now() - state.currentCycleStart) / durationMs);
    if (lastTriggerCycle === currentCycle) return false;
  }

  return true;
}

// Get all due reminders for a time span
export function getDueReminders(
  config: TimeSpanConfig,
  state: TimeSpanState,
  tolerance: number = 1000
): number[] {
  return config.reminders
    .map((_, index) => index)
    .filter(index => shouldTriggerReminder(config, state, index, tolerance));
}
