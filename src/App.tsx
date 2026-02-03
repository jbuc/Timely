import { useState, useEffect } from 'react';
import { useTimelyStore } from './store';
import { ThemeProvider } from './components/ThemeProvider';
import { TimeSpanCard } from './components/TimeSpanCard';
import { TimeSpanEditor } from './components/TimeSpanEditor';
import { SettingsPanel } from './components/SettingsPanel';
import { useTimeLoop } from './hooks/useTimeLoop';
import { requestNotificationPermission } from './services/notifications';

function AppContent() {
  const timeSpans = useTimelyStore((s) => s.timeSpans);
  const timeSpanStates = useTimelyStore((s) => s.timeSpanStates);
  const deleteTimeSpan = useTimelyStore((s) => s.deleteTimeSpan);
  const toggleTimeSpan = useTimelyStore((s) => s.toggleTimeSpan);
  const settings = useTimelyStore((s) => s.settings);

  const [editingSpanId, setEditingSpanId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showNewTimer, setShowNewTimer] = useState(false);

  // Start the time loop
  useTimeLoop(100);

  // Request notification permission on first load
  useEffect(() => {
    if (settings.notificationsEnabled) {
      requestNotificationPermission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this timer?')) {
      deleteTimeSpan(id);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-lg border-b border-text-muted/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text">Timely</h1>
              <p className="text-xs text-text-muted hidden sm:block">
                Making time real for the time blind
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewTimer(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/80 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span className="hidden sm:inline">New Timer</span>
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-xl hover:bg-text-muted/20 transition-colors"
              title="Settings"
            >
              <SettingsIcon className="w-6 h-6 text-text-muted" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {timeSpans.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface flex items-center justify-center">
              <ClockIcon className="w-10 h-10 text-text-muted" />
            </div>
            <h2 className="text-xl font-semibold text-text mb-2">No timers yet</h2>
            <p className="text-text-muted mb-6">
              Create your first timer to start visualizing time
            </p>
            <button
              onClick={() => setShowNewTimer(true)}
              className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/80 transition-colors"
            >
              Create Timer
            </button>
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              settings.compactMode
                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {timeSpans
              .sort((a, b) => a.order - b.order)
              .map((span) => {
                const state = timeSpanStates[span.id];
                if (!state) return null;

                return (
                  <TimeSpanCard
                    key={span.id}
                    config={span}
                    state={state}
                    onEdit={() => setEditingSpanId(span.id)}
                    onToggle={() => toggleTimeSpan(span.id)}
                    onDelete={() => handleDelete(span.id)}
                  />
                );
              })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-lg border-t border-text-muted/10 py-2 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-text-muted">
          <span>
            {timeSpans.filter((s) => s.enabled).length} active timer
            {timeSpans.filter((s) => s.enabled).length !== 1 ? 's' : ''}
          </span>
          <span>PWA Ready</span>
        </div>
      </footer>

      {/* Modals */}
      {(editingSpanId || showNewTimer) && (
        <TimeSpanEditor
          spanId={editingSpanId}
          onClose={() => {
            setEditingSpanId(null);
            setShowNewTimer(false);
          }}
        />
      )}

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

// Icons
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
