# Timely

Making time real for the time blind.

Timely is a configurable time visualizer that helps you perceive the passage of time through visual representations. Perfect for people with time blindness, ADHD, or anyone who wants better awareness of time.

## Features

- **Multiple Visualizer Types**: Radial fill, color transitions, arcs, linear bars, and dot patterns
- **Configurable Time Spans**: Set any duration from seconds to years
- **Nested Time Spans**: Track multiple overlapping time periods
- **Smart Markers**: Visual indicators at specific points in your time span
- **Reminders**: Get notified at specific times within your tracked period
- **Offline Support**: Full PWA with service worker - works without internet
- **Cross-Platform**: Runs on any device with a modern browser
- **Theme Engine**: Customizable colors and styles
- **Local Persistence**: Your settings are saved locally

## Examples

### Focus Timer with Water Reminders
A 3.5-hour cycle that fills radially, with markers and reminders every 25 minutes to stay hydrated.

### Daily Mood Indicator
A bubble that smoothly transitions from green to yellow to blue over 24 hours, giving you an intuitive sense of the day's progress.

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

## Usage

1. **Create a Timer**: Click "New Timer" and configure your time span
2. **Choose a Visualizer**: Pick from radial, arc, color, linear, or dots
3. **Add Markers**: Set visual checkpoints within your time span
4. **Set Reminders**: Get notified at specific progress points
5. **Customize**: Adjust colors, sizes, and display options

## Architecture

```
src/
├── components/          # React components
│   ├── visualizers/     # Time visualization components
│   ├── TimeSpanCard.tsx # Timer display card
│   ├── TimeSpanEditor.tsx # Timer configuration
│   ├── SettingsPanel.tsx # App settings
│   └── ThemeProvider.tsx # Theme management
├── engine/              # Core time calculation logic
│   └── timeEngine.ts    # Time span calculations
├── hooks/               # Custom React hooks
│   └── useTimeLoop.ts   # Animation loop hook
├── services/            # External services
│   ├── auth.ts          # Authentication scaffolding
│   ├── notifications.ts # Browser notifications
│   └── sync.ts          # Data sync scaffolding
├── store/               # State management
│   └── index.ts         # Zustand store
├── types/               # TypeScript type definitions
│   └── index.ts         # Core types
├── App.tsx              # Main application
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## Configuration

### Environment Variables

```bash
# Auth provider: 'local', 'firebase', or 'supabase'
VITE_AUTH_PROVIDER=local

# Sync provider: 'local' or 'cloud'
VITE_SYNC_PROVIDER=local

# API URL for cloud sync (if using cloud provider)
VITE_SYNC_API_URL=
```

## Roadmap

- [ ] Watch app support (watchOS, Wear OS)
- [ ] Desktop app with always-on-top mode (Electron/Tauri)
- [ ] Cloud sync for cross-device access
- [ ] Custom sound notifications
- [ ] Import/export configurations
- [ ] Widget support for mobile
- [ ] Calendar integration

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Vite PWA Plugin** - Progressive Web App support

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT

---

Made with focus and determination for the time-blind community.
