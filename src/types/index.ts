// Core time span types

export type TimeUnit = 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';

export interface Duration {
  value: number;
  unit: TimeUnit;
}

// Visualizer types
export type VisualizerType = 'radial' | 'linear' | 'color' | 'bubble' | 'arc' | 'dots';

export interface ColorStop {
  position: number; // 0-1 representing position in the timespan
  color: string;    // CSS color value
}

export interface Marker {
  id: string;
  position: number;     // 0-1 representing position in the timespan
  label?: string;
  color?: string;
  showLabel?: boolean;
}

export interface Reminder {
  id: string;
  position: number;        // 0-1 representing position in the timespan
  message: string;
  sound?: boolean;
  vibrate?: boolean;
  enabled: boolean;
  lastTriggered?: number;  // Timestamp of last trigger
}

// Visualizer configuration
export interface VisualizerConfig {
  type: VisualizerType;

  // Radial/Arc specific
  startAngle?: number;      // degrees, default 0 (top)
  direction?: 'clockwise' | 'counterclockwise';
  thickness?: number;       // for arc type, 0-1

  // Color specific
  colorStops?: ColorStop[];
  interpolation?: 'linear' | 'smooth';

  // Visual style
  backgroundColor?: string;
  foregroundColor?: string;
  borderRadius?: number;
  showPercentage?: boolean;
  showTimeRemaining?: boolean;

  // Size
  size?: 'small' | 'medium' | 'large' | 'fill';
}

// Time span configuration
export interface TimeSpanConfig {
  id: string;
  name: string;
  duration: Duration;

  // Start time configuration
  startMode: 'now' | 'fixed' | 'aligned';
  fixedStartTime?: number;   // Timestamp for fixed mode
  alignTo?: TimeUnit;        // For aligned mode (e.g., align to start of hour)

  // Visualization
  visualizer: VisualizerConfig;
  markers: Marker[];
  reminders: Reminder[];

  // Nesting
  parentId?: string;
  children?: string[];

  // Display
  enabled: boolean;
  order: number;
}

// Theme configuration
export interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    surfaceElevated: string;
    text: string;
    textMuted: string;
    success: string;
    warning: string;
    error: string;
  };
  isDark: boolean;
}

// User configuration (for accounts)
export interface UserConfig {
  id: string;
  email?: string;
  displayName?: string;
  createdAt: number;
  updatedAt: number;
}

// App state
export interface AppState {
  timeSpans: TimeSpanConfig[];
  activeTheme: ThemeConfig;
  themes: ThemeConfig[];
  user: UserConfig | null;
  settings: AppSettings;
}

export interface AppSettings {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  alwaysOnTop: boolean;           // For desktop app
  compactMode: boolean;
  showLabels: boolean;
  clockFormat: '12h' | '24h';
  startOfWeek: 0 | 1 | 6;         // 0=Sunday, 1=Monday, 6=Saturday
}

// Computed time state for a span
export interface TimeSpanState {
  configId: string;
  progress: number;          // 0-1
  elapsed: number;           // milliseconds
  remaining: number;         // milliseconds
  cycleCount: number;        // How many complete cycles
  currentCycleStart: number; // Timestamp
  isActive: boolean;
}
