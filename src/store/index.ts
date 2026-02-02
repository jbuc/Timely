import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import {
  TimeSpanConfig,
  TimeSpanState,
  ThemeConfig,
  AppSettings,
  UserConfig,
  VisualizerType,
  Marker,
  Reminder,
} from '../types';
import { calculateTimeSpanState } from '../engine/timeEngine';

// Default themes
const defaultDarkTheme: ThemeConfig = {
  id: 'dark',
  name: 'Dark',
  isDark: true,
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#22d3ee',
    background: '#1a1a2e',
    surface: '#16213e',
    surfaceElevated: '#0f3460',
    text: '#e4e4e7',
    textMuted: '#a1a1aa',
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
  },
};

const defaultLightTheme: ThemeConfig = {
  id: 'light',
  name: 'Light',
  isDark: false,
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#0891b2',
    background: '#f4f4f5',
    surface: '#ffffff',
    surfaceElevated: '#fafafa',
    text: '#18181b',
    textMuted: '#71717a',
    success: '#16a34a',
    warning: '#ca8a04',
    error: '#dc2626',
  },
};

// Default settings
const defaultSettings: AppSettings = {
  notificationsEnabled: true,
  soundEnabled: true,
  vibrateEnabled: true,
  alwaysOnTop: false,
  compactMode: false,
  showLabels: true,
  clockFormat: '12h',
  startOfWeek: 0,
};

// Example time spans
const exampleTimeSpans: TimeSpanConfig[] = [
  {
    id: uuid(),
    name: 'Focus Timer',
    duration: { value: 3.5, unit: 'hours' },
    startMode: 'aligned',
    alignTo: 'hours',
    visualizer: {
      type: 'radial',
      foregroundColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      showTimeRemaining: true,
      size: 'large',
    },
    markers: [
      { id: uuid(), position: 0.119, label: '25m', color: '#22d3ee', showLabel: true },
      { id: uuid(), position: 0.238, label: '50m', color: '#22d3ee', showLabel: false },
      { id: uuid(), position: 0.357, label: '75m', color: '#22d3ee', showLabel: false },
      { id: uuid(), position: 0.476, label: '100m', color: '#22d3ee', showLabel: false },
      { id: uuid(), position: 0.595, label: '125m', color: '#22d3ee', showLabel: false },
      { id: uuid(), position: 0.714, label: '150m', color: '#22d3ee', showLabel: false },
      { id: uuid(), position: 0.833, label: '175m', color: '#22d3ee', showLabel: false },
    ],
    reminders: [
      { id: uuid(), position: 0.119, message: 'Time for a water break!', enabled: true },
      { id: uuid(), position: 0.357, message: 'Stand up and stretch!', enabled: true },
      { id: uuid(), position: 0.595, message: 'Water break!', enabled: true },
      { id: uuid(), position: 0.833, message: 'Almost done! Keep going!', enabled: true },
    ],
    enabled: true,
    order: 0,
  },
  {
    id: uuid(),
    name: 'Daily Cycle',
    duration: { value: 24, unit: 'hours' },
    startMode: 'aligned',
    alignTo: 'days',
    visualizer: {
      type: 'color',
      colorStops: [
        { position: 0, color: '#22c55e' },
        { position: 0.5, color: '#eab308' },
        { position: 1, color: '#3b82f6' },
      ],
      showTimeRemaining: true,
      size: 'medium',
    },
    markers: [],
    reminders: [],
    enabled: true,
    order: 1,
  },
];

interface TimelyStore {
  // State
  timeSpans: TimeSpanConfig[];
  timeSpanStates: Record<string, TimeSpanState>;
  themes: ThemeConfig[];
  activeThemeId: string;
  settings: AppSettings;
  user: UserConfig | null;
  isEditing: boolean;
  editingSpanId: string | null;

  // Time span actions
  addTimeSpan: (config: Partial<TimeSpanConfig>) => string;
  updateTimeSpan: (id: string, updates: Partial<TimeSpanConfig>) => void;
  deleteTimeSpan: (id: string) => void;
  reorderTimeSpans: (fromIndex: number, toIndex: number) => void;
  toggleTimeSpan: (id: string) => void;

  // Marker actions
  addMarker: (spanId: string, marker: Partial<Marker>) => void;
  updateMarker: (spanId: string, markerId: string, updates: Partial<Marker>) => void;
  deleteMarker: (spanId: string, markerId: string) => void;

  // Reminder actions
  addReminder: (spanId: string, reminder: Partial<Reminder>) => void;
  updateReminder: (spanId: string, reminderId: string, updates: Partial<Reminder>) => void;
  deleteReminder: (spanId: string, reminderId: string) => void;
  markReminderTriggered: (spanId: string, reminderId: string) => void;

  // Theme actions
  setActiveTheme: (themeId: string) => void;
  addTheme: (theme: Partial<ThemeConfig>) => string;
  updateTheme: (id: string, updates: Partial<ThemeConfig>) => void;
  deleteTheme: (id: string) => void;

  // Settings actions
  updateSettings: (updates: Partial<AppSettings>) => void;

  // User actions
  setUser: (user: UserConfig | null) => void;

  // UI actions
  setEditing: (isEditing: boolean, spanId?: string | null) => void;

  // Time state actions
  updateTimeStates: () => void;
}

export const useTimelyStore = create<TimelyStore>()(
  persist(
    (set, get) => ({
      // Initial state
      timeSpans: exampleTimeSpans,
      timeSpanStates: {},
      themes: [defaultDarkTheme, defaultLightTheme],
      activeThemeId: 'dark',
      settings: defaultSettings,
      user: null,
      isEditing: false,
      editingSpanId: null,

      // Time span actions
      addTimeSpan: (config) => {
        const id = uuid();
        const newSpan: TimeSpanConfig = {
          id,
          name: config.name ?? 'New Timer',
          duration: config.duration ?? { value: 1, unit: 'hours' },
          startMode: config.startMode ?? 'aligned',
          alignTo: config.alignTo ?? 'hours',
          fixedStartTime: config.fixedStartTime ?? Date.now(),
          visualizer: config.visualizer ?? {
            type: 'radial' as VisualizerType,
            showTimeRemaining: true,
            size: 'medium',
          },
          markers: config.markers ?? [],
          reminders: config.reminders ?? [],
          enabled: config.enabled ?? true,
          order: get().timeSpans.length,
          parentId: config.parentId,
          children: config.children,
        };
        set((state) => ({
          timeSpans: [...state.timeSpans, newSpan],
        }));
        return id;
      },

      updateTimeSpan: (id, updates) => {
        set((state) => ({
          timeSpans: state.timeSpans.map((span) =>
            span.id === id ? { ...span, ...updates } : span
          ),
        }));
      },

      deleteTimeSpan: (id) => {
        set((state) => ({
          timeSpans: state.timeSpans.filter((span) => span.id !== id),
        }));
      },

      reorderTimeSpans: (fromIndex, toIndex) => {
        set((state) => {
          const spans = [...state.timeSpans];
          const [moved] = spans.splice(fromIndex, 1);
          spans.splice(toIndex, 0, moved);
          return {
            timeSpans: spans.map((span, i) => ({ ...span, order: i })),
          };
        });
      },

      toggleTimeSpan: (id) => {
        set((state) => ({
          timeSpans: state.timeSpans.map((span) =>
            span.id === id ? { ...span, enabled: !span.enabled } : span
          ),
        }));
      },

      // Marker actions
      addMarker: (spanId, marker) => {
        const id = uuid();
        set((state) => ({
          timeSpans: state.timeSpans.map((span) =>
            span.id === spanId
              ? {
                  ...span,
                  markers: [
                    ...span.markers,
                    {
                      id,
                      position: marker.position ?? 0.5,
                      label: marker.label,
                      color: marker.color ?? '#ffffff',
                      showLabel: marker.showLabel ?? false,
                    },
                  ],
                }
              : span
          ),
        }));
      },

      updateMarker: (spanId, markerId, updates) => {
        set((state) => ({
          timeSpans: state.timeSpans.map((span) =>
            span.id === spanId
              ? {
                  ...span,
                  markers: span.markers.map((m) =>
                    m.id === markerId ? { ...m, ...updates } : m
                  ),
                }
              : span
          ),
        }));
      },

      deleteMarker: (spanId, markerId) => {
        set((state) => ({
          timeSpans: state.timeSpans.map((span) =>
            span.id === spanId
              ? {
                  ...span,
                  markers: span.markers.filter((m) => m.id !== markerId),
                }
              : span
          ),
        }));
      },

      // Reminder actions
      addReminder: (spanId, reminder) => {
        const id = uuid();
        set((state) => ({
          timeSpans: state.timeSpans.map((span) =>
            span.id === spanId
              ? {
                  ...span,
                  reminders: [
                    ...span.reminders,
                    {
                      id,
                      position: reminder.position ?? 0.5,
                      message: reminder.message ?? 'Reminder!',
                      sound: reminder.sound ?? true,
                      vibrate: reminder.vibrate ?? true,
                      enabled: reminder.enabled ?? true,
                    },
                  ],
                }
              : span
          ),
        }));
      },

      updateReminder: (spanId, reminderId, updates) => {
        set((state) => ({
          timeSpans: state.timeSpans.map((span) =>
            span.id === spanId
              ? {
                  ...span,
                  reminders: span.reminders.map((r) =>
                    r.id === reminderId ? { ...r, ...updates } : r
                  ),
                }
              : span
          ),
        }));
      },

      deleteReminder: (spanId, reminderId) => {
        set((state) => ({
          timeSpans: state.timeSpans.map((span) =>
            span.id === spanId
              ? {
                  ...span,
                  reminders: span.reminders.filter((r) => r.id !== reminderId),
                }
              : span
          ),
        }));
      },

      markReminderTriggered: (spanId, reminderId) => {
        set((state) => ({
          timeSpans: state.timeSpans.map((span) =>
            span.id === spanId
              ? {
                  ...span,
                  reminders: span.reminders.map((r) =>
                    r.id === reminderId ? { ...r, lastTriggered: Date.now() } : r
                  ),
                }
              : span
          ),
        }));
      },

      // Theme actions
      setActiveTheme: (themeId) => {
        set({ activeThemeId: themeId });
      },

      addTheme: (theme) => {
        const id = uuid();
        const newTheme: ThemeConfig = {
          id,
          name: theme.name ?? 'Custom Theme',
          isDark: theme.isDark ?? true,
          colors: theme.colors ?? defaultDarkTheme.colors,
        };
        set((state) => ({
          themes: [...state.themes, newTheme],
        }));
        return id;
      },

      updateTheme: (id, updates) => {
        set((state) => ({
          themes: state.themes.map((theme) =>
            theme.id === id ? { ...theme, ...updates } : theme
          ),
        }));
      },

      deleteTheme: (id) => {
        const state = get();
        // Don't delete if it's the active theme or if it's a default theme
        if (id === state.activeThemeId || id === 'dark' || id === 'light') {
          return;
        }
        set((state) => ({
          themes: state.themes.filter((theme) => theme.id !== id),
        }));
      },

      // Settings actions
      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      // User actions
      setUser: (user) => {
        set({ user });
      },

      // UI actions
      setEditing: (isEditing, spanId = null) => {
        set({ isEditing, editingSpanId: spanId });
      },

      // Time state actions
      updateTimeStates: () => {
        const now = Date.now();
        set((state) => ({
          timeSpanStates: state.timeSpans.reduce(
            (acc, span) => {
              acc[span.id] = calculateTimeSpanState(span, now);
              return acc;
            },
            {} as Record<string, TimeSpanState>
          ),
        }));
      },
    }),
    {
      name: 'timely-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        timeSpans: state.timeSpans,
        themes: state.themes,
        activeThemeId: state.activeThemeId,
        settings: state.settings,
        user: state.user,
      }),
    }
  )
);

// Helper hook to get active theme
export function useActiveTheme(): ThemeConfig {
  const { themes, activeThemeId } = useTimelyStore();
  return themes.find((t) => t.id === activeThemeId) ?? themes[0];
}

// Helper hook to get a specific time span state
export function useTimeSpanState(id: string): TimeSpanState | null {
  const state = useTimelyStore((s) => s.timeSpanStates[id]);
  return state ?? null;
}
