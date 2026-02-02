import { TimeSpanConfig, TimeSpanState } from '../types';
import { TimeVisualizer } from './visualizers';
import { formatDuration, durationToMs } from '../engine/timeEngine';

interface TimeSpanCardProps {
  config: TimeSpanConfig;
  state: TimeSpanState;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

export function TimeSpanCard({
  config,
  state,
  onEdit,
  onToggle,
  onDelete,
}: TimeSpanCardProps) {
  const durationMs = durationToMs(config.duration);

  return (
    <div
      className={`
        relative p-6 rounded-2xl transition-all duration-300
        ${config.enabled ? 'bg-surface' : 'bg-surface/50 opacity-60'}
        hover:bg-surface-elevated
      `}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={onToggle}
          className={`
            p-2 rounded-lg transition-colors
            ${config.enabled ? 'bg-primary/20 text-primary' : 'bg-text-muted/20 text-text-muted'}
            hover:bg-primary/30
          `}
          title={config.enabled ? 'Pause' : 'Resume'}
        >
          {config.enabled ? (
            <PauseIcon className="w-4 h-4" />
          ) : (
            <PlayIcon className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={onEdit}
          className="p-2 rounded-lg bg-text-muted/20 text-text-muted hover:bg-text-muted/30 transition-colors"
          title="Edit"
        >
          <EditIcon className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg bg-error/20 text-error hover:bg-error/30 transition-colors"
          title="Delete"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Visualizer */}
      <div className="flex justify-center mb-4">
        <TimeVisualizer config={config} state={state} />
      </div>

      {/* Info */}
      <div className="text-center">
        <div className="text-sm text-text-muted">
          Duration: {formatDuration(durationMs, true)}
        </div>
        {config.reminders.length > 0 && (
          <div className="text-xs text-text-muted mt-1">
            {config.reminders.filter((r) => r.enabled).length} reminder
            {config.reminders.filter((r) => r.enabled).length !== 1 ? 's' : ''} active
          </div>
        )}
        {config.markers.length > 0 && (
          <div className="text-xs text-text-muted">
            {config.markers.length} marker{config.markers.length !== 1 ? 's' : ''}
          </div>
        )}
        <div className="text-xs text-text-muted mt-1">
          Cycle #{state.cycleCount + 1}
        </div>
      </div>
    </div>
  );
}

// Simple icon components
function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
