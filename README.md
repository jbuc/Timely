# Timely

Making time real for the time blind.

Timely is a configurable time visualizer that helps you perceive the passage of time through visual representations. Perfect for people with time blindness, ADHD, or anyone who wants better awareness of time.

## Features

- **Multiple Visualizer Types**: Radial fill, color transitions, arcs, linear bars, and dot patterns
- **Configurable Time Spans**: Set any duration from seconds to years (including decimals like 3.5 hours)
- **Nested Time Spans**: Track multiple overlapping time periods
- **Smart Markers**: Visual indicators at specific points in your time span
- **Reminders**: Get notified at specific times within your tracked period
- **Offline Support**: Full PWA with service worker - works without internet
- **Cross-Platform**: Runs on any device with a modern browser
- **Theme Engine**: Customizable colors and styles with dark/light modes
- **Local Persistence**: Your settings are saved locally and survive browser refreshes

## Visualizer Types

### Radial
A circle that fills up clockwise (or counter-clockwise) like a clock face. Great for focus timers and pomodoro-style work sessions.

### Arc
A thin arc that progresses around a circle. Minimal and elegant, perfect for ambient time awareness.

### Color
A bubble that smoothly transitions between colors over time. For example, green → yellow → blue over 24 hours gives an intuitive sense of daily progress.

### Linear
A horizontal progress bar. Classic and straightforward, works well for shorter time spans.

### Dots
A circle of dots that light up progressively. Visual and discrete, good for counting segments of time.

## Examples

### Focus Timer with Water Reminders
```
Duration: 3.5 hours
Visualizer: Radial
Markers: Every 25 minutes (at 12%, 24%, 36%, 48%, 60%, 71%, 83%)
Reminders: "Time for a water break!" at each marker
Start Mode: Aligned to hour
```

### Daily Mood Indicator
```
Duration: 24 hours
Visualizer: Color
Color Stops: Green (0%) → Yellow (50%) → Blue (100%)
Start Mode: Aligned to day
```

### Weekly Progress Tracker
```
Duration: 1 week
Visualizer: Arc
Markers: Each day
Start Mode: Aligned to week (Sunday)
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/jbuc/Timely.git
cd Timely

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
npm run build
npm run preview
```

### Installing as a PWA

Once the app is running:
1. Open in Chrome, Safari, or Edge
2. Click the install icon in the address bar (or use browser menu)
3. The app will be available as a standalone application

## Usage

### Creating a Timer

1. Click **"New Timer"** in the header
2. Configure in the **General** tab:
   - **Name**: Give your timer a descriptive name
   - **Duration**: Set the time span (value + unit)
   - **Start Mode**: Choose when cycles begin
     - *Aligned*: Starts at the beginning of a time unit (e.g., top of the hour)
     - *Now*: Starts immediately when created
     - *Fixed*: Starts at a specific time

3. Configure in the **Visual** tab:
   - **Type**: Choose your visualizer style
   - **Size**: Small, medium, large, or fill
   - **Colors**: Customize foreground and background
   - **Display**: Toggle time remaining or percentage

4. Add **Markers** (optional):
   - Position: Where in the cycle (0-100%)
   - Label: Optional text
   - Color: Marker color
   - Show Label: Toggle label visibility

5. Add **Reminders** (optional):
   - Position: When to trigger (0-100%)
   - Message: Notification text
   - Enable/disable each reminder individually

### Settings

Access settings via the gear icon:
- **Theme**: Switch between dark and light modes
- **Notifications**: Enable/disable, sound, vibration
- **Display**: Compact mode, labels, clock format
- **Account**: Sign in for cross-device sync (future feature)

## Architecture

```
src/
├── components/           # React components
│   ├── visualizers/      # Time visualization components
│   │   ├── RadialVisualizer.tsx
│   │   ├── ArcVisualizer.tsx
│   │   ├── ColorVisualizer.tsx
│   │   ├── LinearVisualizer.tsx
│   │   └── index.tsx     # Exports + DotsVisualizer
│   ├── TimeSpanCard.tsx  # Timer display card
│   ├── TimeSpanEditor.tsx # Timer configuration modal
│   ├── SettingsPanel.tsx # App settings modal
│   └── ThemeProvider.tsx # Theme management
├── engine/               # Core time calculation logic
│   └── timeEngine.ts     # Duration conversion, cycle calculation
├── hooks/                # Custom React hooks
│   └── useTimeLoop.ts    # Animation loop + reminder checking
├── services/             # External services
│   ├── auth.ts           # Authentication (local/Firebase/Supabase)
│   ├── notifications.ts  # Browser Notifications API
│   └── sync.ts           # Cross-device sync scaffolding
├── store/                # State management
│   └── index.ts          # Zustand store with persistence
├── types/                # TypeScript type definitions
│   └── index.ts          # Core types for timers, themes, etc.
├── App.tsx               # Main application component
├── main.tsx              # Entry point
├── index.css             # Global styles + Tailwind
└── vite-env.d.ts         # Vite environment types
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Auth provider: 'local', 'firebase', or 'supabase'
VITE_AUTH_PROVIDER=local

# Sync provider: 'local' or 'cloud'
VITE_SYNC_PROVIDER=local

# API URL for cloud sync (if using cloud provider)
VITE_SYNC_API_URL=
```

### Adding Custom Themes

Themes are defined in `src/store/index.ts`. Add new themes to the `themes` array:

```typescript
const customTheme: ThemeConfig = {
  id: 'custom',
  name: 'My Theme',
  isDark: true,
  colors: {
    primary: '#your-color',
    secondary: '#your-color',
    accent: '#your-color',
    background: '#your-color',
    surface: '#your-color',
    surfaceElevated: '#your-color',
    text: '#your-color',
    textMuted: '#your-color',
    success: '#your-color',
    warning: '#your-color',
    error: '#your-color',
  },
};
```

## API Reference

### Time Engine (`src/engine/timeEngine.ts`)

#### `durationToMs(duration: Duration): number`
Converts a Duration object to milliseconds.

#### `calculateTimeSpanState(config: TimeSpanConfig, now?: number): TimeSpanState`
Calculates the current state of a time span including progress, elapsed time, and cycle count.

#### `formatDuration(ms: number, compact?: boolean): string`
Formats milliseconds as human-readable duration.

#### `formatTimeRemaining(ms: number): string`
Formats remaining time as `H:MM:SS` or `M:SS`.

### Store (`src/store/index.ts`)

The Zustand store provides:
- `timeSpans`: Array of timer configurations
- `addTimeSpan(config)`: Create a new timer
- `updateTimeSpan(id, updates)`: Modify a timer
- `deleteTimeSpan(id)`: Remove a timer
- `toggleTimeSpan(id)`: Pause/resume a timer
- `updateSettings(updates)`: Modify app settings
- `setActiveTheme(themeId)`: Switch themes

## Roadmap

- [ ] Watch app support (watchOS, Wear OS)
- [ ] Desktop app with always-on-top mode (Electron/Tauri)
- [ ] Cloud sync for cross-device access
- [ ] Custom sound notifications
- [ ] Import/export configurations
- [ ] Widget support for mobile
- [ ] Calendar integration
- [ ] Multiple timer views (grid, list, single focus)
- [ ] Timer templates/presets

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management with persistence
- **Vite PWA Plugin** - Progressive Web App support

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the **PolyForm Noncommercial License 1.0.0** - see the [LICENSE](LICENSE) file for details.

This means you can use, modify, and share the software for any noncommercial purpose. Commercial use requires separate licensing.

---

Made with focus and determination for the time-blind community.
