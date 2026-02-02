import { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { TimeSpanConfig, TimeUnit, VisualizerType, ColorStop, Marker, Reminder } from '../types';
import { useTimelyStore } from '../store';

interface TimeSpanEditorProps {
  spanId: string | null;
  onClose: () => void;
}

const TIME_UNITS: TimeUnit[] = ['seconds', 'minutes', 'hours', 'days', 'weeks'];
const VISUALIZER_TYPES: VisualizerType[] = ['radial', 'arc', 'linear', 'color', 'dots'];

const DEFAULT_CONFIG: Partial<TimeSpanConfig> = {
  name: 'New Timer',
  duration: { value: 1, unit: 'hours' },
  startMode: 'aligned',
  alignTo: 'hours',
  visualizer: {
    type: 'radial',
    showTimeRemaining: true,
    foregroundColor: '#6366f1',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    size: 'medium',
  },
  markers: [],
  reminders: [],
  enabled: true,
};

export function TimeSpanEditor({ spanId, onClose }: TimeSpanEditorProps) {
  const timeSpans = useTimelyStore((s) => s.timeSpans);
  const addTimeSpan = useTimelyStore((s) => s.addTimeSpan);
  const updateTimeSpan = useTimelyStore((s) => s.updateTimeSpan);

  const existingSpan = spanId ? timeSpans.find((s) => s.id === spanId) : null;

  const [config, setConfig] = useState<Partial<TimeSpanConfig>>(
    existingSpan ?? DEFAULT_CONFIG
  );
  const [activeTab, setActiveTab] = useState<'general' | 'visual' | 'markers' | 'reminders'>('general');

  useEffect(() => {
    if (existingSpan) {
      setConfig(existingSpan);
    }
  }, [existingSpan]);

  const handleSave = () => {
    if (spanId && existingSpan) {
      updateTimeSpan(spanId, config);
    } else {
      addTimeSpan(config);
    }
    onClose();
  };

  const updateConfig = <K extends keyof TimeSpanConfig>(
    key: K,
    value: TimeSpanConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const updateVisualizer = <K extends keyof TimeSpanConfig['visualizer']>(
    key: K,
    value: TimeSpanConfig['visualizer'][K]
  ) => {
    setConfig((prev) => ({
      ...prev,
      visualizer: { ...prev.visualizer!, [key]: value },
    }));
  };

  const addMarker = () => {
    const newMarker: Marker = {
      id: uuid(),
      position: 0.5,
      label: '',
      color: '#ffffff',
      showLabel: false,
    };
    setConfig((prev) => ({
      ...prev,
      markers: [...(prev.markers ?? []), newMarker],
    }));
  };

  const updateMarker = (index: number, updates: Partial<Marker>) => {
    setConfig((prev) => ({
      ...prev,
      markers: prev.markers?.map((m, i) =>
        i === index ? { ...m, ...updates } : m
      ),
    }));
  };

  const deleteMarker = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      markers: prev.markers?.filter((_, i) => i !== index),
    }));
  };

  const addReminder = () => {
    const newReminder: Reminder = {
      id: uuid(),
      position: 0.5,
      message: 'Reminder!',
      sound: true,
      vibrate: true,
      enabled: true,
    };
    setConfig((prev) => ({
      ...prev,
      reminders: [...(prev.reminders ?? []), newReminder],
    }));
  };

  const updateReminder = (index: number, updates: Partial<Reminder>) => {
    setConfig((prev) => ({
      ...prev,
      reminders: prev.reminders?.map((r, i) =>
        i === index ? { ...r, ...updates } : r
      ),
    }));
  };

  const deleteReminder = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      reminders: prev.reminders?.filter((_, i) => i !== index),
    }));
  };

  const addColorStop = () => {
    const currentStops = config.visualizer?.colorStops ?? [];
    const newStop: ColorStop = {
      position: currentStops.length > 0 ? 1 : 0,
      color: '#6366f1',
    };
    updateVisualizer('colorStops', [...currentStops, newStop]);
  };

  const updateColorStop = (index: number, updates: Partial<ColorStop>) => {
    const currentStops = config.visualizer?.colorStops ?? [];
    updateVisualizer(
      'colorStops',
      currentStops.map((s, i) => (i === index ? { ...s, ...updates } : s))
    );
  };

  const deleteColorStop = (index: number) => {
    const currentStops = config.visualizer?.colorStops ?? [];
    updateVisualizer(
      'colorStops',
      currentStops.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-text-muted/20 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-text">
            {spanId ? 'Edit Timer' : 'New Timer'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-text-muted/20 transition-colors"
          >
            <CloseIcon className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-text-muted/20">
          {(['general', 'visual', 'markers', 'reminders'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                flex-1 py-3 text-sm font-medium transition-colors
                ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-text-muted hover:text-text'}
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'general' && (
            <>
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Name</label>
                <input
                  type="text"
                  value={config.name ?? ''}
                  onChange={(e) => updateConfig('name', e.target.value)}
                  className="w-full px-3 py-2 bg-background rounded-lg border border-text-muted/30 text-text focus:border-primary focus:outline-none"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Duration</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={config.duration?.value ?? 1}
                    onChange={(e) =>
                      updateConfig('duration', {
                        value: parseFloat(e.target.value) || 1,
                        unit: config.duration?.unit ?? 'hours',
                      })
                    }
                    min="0.1"
                    step="0.1"
                    className="flex-1 px-3 py-2 bg-background rounded-lg border border-text-muted/30 text-text focus:border-primary focus:outline-none"
                  />
                  <select
                    value={config.duration?.unit ?? 'hours'}
                    onChange={(e) =>
                      updateConfig('duration', {
                        value: config.duration?.value ?? 1,
                        unit: e.target.value as TimeUnit,
                      })
                    }
                    className="px-3 py-2 bg-background rounded-lg border border-text-muted/30 text-text focus:border-primary focus:outline-none"
                  >
                    {TIME_UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start Mode */}
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Start Mode</label>
                <select
                  value={config.startMode ?? 'aligned'}
                  onChange={(e) =>
                    updateConfig('startMode', e.target.value as TimeSpanConfig['startMode'])
                  }
                  className="w-full px-3 py-2 bg-background rounded-lg border border-text-muted/30 text-text focus:border-primary focus:outline-none"
                >
                  <option value="aligned">Aligned to time unit</option>
                  <option value="now">Start from now</option>
                  <option value="fixed">Fixed start time</option>
                </select>
              </div>

              {config.startMode === 'aligned' && (
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Align To</label>
                  <select
                    value={config.alignTo ?? 'hours'}
                    onChange={(e) => updateConfig('alignTo', e.target.value as TimeUnit)}
                    className="w-full px-3 py-2 bg-background rounded-lg border border-text-muted/30 text-text focus:border-primary focus:outline-none"
                  >
                    {TIME_UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {activeTab === 'visual' && (
            <>
              {/* Visualizer Type */}
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Type</label>
                <div className="grid grid-cols-5 gap-2">
                  {VISUALIZER_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => updateVisualizer('type', type)}
                      className={`
                        py-2 px-3 rounded-lg text-sm font-medium transition-colors
                        ${config.visualizer?.type === type
                          ? 'bg-primary text-white'
                          : 'bg-background text-text-muted hover:bg-text-muted/20'}
                      `}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Size</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['small', 'medium', 'large', 'fill'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => updateVisualizer('size', size)}
                      className={`
                        py-2 px-3 rounded-lg text-sm font-medium transition-colors
                        ${config.visualizer?.size === size
                          ? 'bg-primary text-white'
                          : 'bg-background text-text-muted hover:bg-text-muted/20'}
                      `}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Foreground Color</label>
                <input
                  type="color"
                  value={config.visualizer?.foregroundColor ?? '#6366f1'}
                  onChange={(e) => updateVisualizer('foregroundColor', e.target.value)}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>

              {/* Color Stops (for color visualizer) */}
              {config.visualizer?.type === 'color' && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-text-muted">Color Stops</label>
                    <button
                      onClick={addColorStop}
                      className="text-sm text-primary hover:text-primary/80"
                    >
                      + Add Color
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(config.visualizer?.colorStops ?? []).map((stop, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="color"
                          value={stop.color}
                          onChange={(e) => updateColorStop(i, { color: e.target.value })}
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="number"
                          value={Math.round(stop.position * 100)}
                          onChange={(e) =>
                            updateColorStop(i, { position: parseInt(e.target.value) / 100 })
                          }
                          min="0"
                          max="100"
                          className="flex-1 px-3 py-2 bg-background rounded-lg border border-text-muted/30 text-text"
                        />
                        <span className="text-text-muted">%</span>
                        <button
                          onClick={() => deleteColorStop(i)}
                          className="p-2 text-error hover:bg-error/20 rounded-lg"
                        >
                          <CloseIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Display Options */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.visualizer?.showTimeRemaining ?? true}
                    onChange={(e) => updateVisualizer('showTimeRemaining', e.target.checked)}
                    className="w-5 h-5 rounded border-text-muted/30 bg-background text-primary focus:ring-primary"
                  />
                  <span className="text-text">Show time remaining</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.visualizer?.showPercentage ?? false}
                    onChange={(e) => updateVisualizer('showPercentage', e.target.checked)}
                    className="w-5 h-5 rounded border-text-muted/30 bg-background text-primary focus:ring-primary"
                  />
                  <span className="text-text">Show percentage</span>
                </label>
              </div>
            </>
          )}

          {activeTab === 'markers' && (
            <>
              <div className="flex justify-between items-center">
                <p className="text-sm text-text-muted">
                  Visual markers on the timer
                </p>
                <button
                  onClick={addMarker}
                  className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/80"
                >
                  + Add Marker
                </button>
              </div>
              <div className="space-y-3">
                {(config.markers ?? []).map((marker, i) => (
                  <div key={marker.id} className="p-3 bg-background rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={marker.color ?? '#ffffff'}
                        onChange={(e) => updateMarker(i, { color: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={marker.label ?? ''}
                        onChange={(e) => updateMarker(i, { label: e.target.value })}
                        placeholder="Label"
                        className="flex-1 px-3 py-1.5 bg-surface rounded border border-text-muted/30 text-text text-sm"
                      />
                      <button
                        onClick={() => deleteMarker(i)}
                        className="p-1.5 text-error hover:bg-error/20 rounded"
                      >
                        <CloseIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted w-16">Position:</span>
                      <input
                        type="range"
                        value={marker.position * 100}
                        onChange={(e) =>
                          updateMarker(i, { position: parseInt(e.target.value) / 100 })
                        }
                        min="0"
                        max="100"
                        className="flex-1"
                      />
                      <span className="text-xs text-text-muted w-10 text-right">
                        {Math.round(marker.position * 100)}%
                      </span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={marker.showLabel ?? false}
                        onChange={(e) => updateMarker(i, { showLabel: e.target.checked })}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-xs text-text-muted">Show label</span>
                    </label>
                  </div>
                ))}
                {(config.markers ?? []).length === 0 && (
                  <p className="text-center text-text-muted py-8">
                    No markers yet. Add one to mark specific points in time.
                  </p>
                )}
              </div>
            </>
          )}

          {activeTab === 'reminders' && (
            <>
              <div className="flex justify-between items-center">
                <p className="text-sm text-text-muted">
                  Notifications at specific times
                </p>
                <button
                  onClick={addReminder}
                  className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/80"
                >
                  + Add Reminder
                </button>
              </div>
              <div className="space-y-3">
                {(config.reminders ?? []).map((reminder, i) => (
                  <div key={reminder.id} className="p-3 bg-background rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={reminder.message}
                        onChange={(e) => updateReminder(i, { message: e.target.value })}
                        placeholder="Reminder message"
                        className="flex-1 px-3 py-1.5 bg-surface rounded border border-text-muted/30 text-text text-sm"
                      />
                      <button
                        onClick={() => deleteReminder(i)}
                        className="p-1.5 text-error hover:bg-error/20 rounded"
                      >
                        <CloseIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted w-16">At:</span>
                      <input
                        type="range"
                        value={reminder.position * 100}
                        onChange={(e) =>
                          updateReminder(i, { position: parseInt(e.target.value) / 100 })
                        }
                        min="0"
                        max="100"
                        className="flex-1"
                      />
                      <span className="text-xs text-text-muted w-10 text-right">
                        {Math.round(reminder.position * 100)}%
                      </span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reminder.enabled}
                        onChange={(e) => updateReminder(i, { enabled: e.target.checked })}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-xs text-text-muted">Enabled</span>
                    </label>
                  </div>
                ))}
                {(config.reminders ?? []).length === 0 && (
                  <p className="text-center text-text-muted py-8">
                    No reminders yet. Add one to get notified at specific times.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-text-muted/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-text-muted hover:bg-text-muted/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/80 transition-colors"
          >
            {spanId ? 'Save Changes' : 'Create Timer'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
