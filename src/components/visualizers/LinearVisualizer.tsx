import { VisualizerConfig, Marker } from '../../types';
import { formatTimeRemaining } from '../../engine/timeEngine';

interface LinearVisualizerProps {
  progress: number;
  remaining: number;
  config: VisualizerConfig;
  markers?: Marker[];
  width?: number;
  height?: number;
  className?: string;
}

export function LinearVisualizer({
  progress,
  remaining,
  config,
  markers = [],
  width = 300,
  height = 40,
  className = '',
}: LinearVisualizerProps) {
  const {
    backgroundColor = 'rgba(255, 255, 255, 0.1)',
    foregroundColor = 'var(--color-primary, #6366f1)',
    borderRadius = 20,
    showPercentage = false,
    showTimeRemaining = true,
  } = config;

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* Background bar */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor,
          borderRadius: `${borderRadius}px`,
        }}
      />

      {/* Progress bar */}
      <div
        className="absolute top-0 left-0 h-full transition-all duration-100 ease-linear"
        style={{
          width: `${progress * 100}%`,
          background: `linear-gradient(90deg, ${foregroundColor}, ${config.colorStops?.[1]?.color ?? foregroundColor})`,
          borderRadius: `${borderRadius}px`,
          boxShadow: `0 0 10px ${foregroundColor}40`,
        }}
      />

      {/* Markers */}
      {markers.map((marker) => (
        <div
          key={marker.id}
          className="absolute top-0 h-full flex flex-col items-center"
          style={{
            left: `${marker.position * 100}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <div
            className="w-0.5 h-full"
            style={{ backgroundColor: marker.color ?? '#ffffff' }}
          />
          {marker.showLabel && marker.label && (
            <span
              className="absolute -top-5 text-xs whitespace-nowrap"
              style={{ color: marker.color ?? '#ffffff' }}
            >
              {marker.label}
            </span>
          )}
        </div>
      ))}

      {/* Center text */}
      <div
        className="absolute inset-0 flex items-center justify-center text-white font-medium"
        style={{ fontSize: Math.min(height * 0.5, 16) }}
      >
        {showPercentage && <span>{Math.round(progress * 100)}%</span>}
        {showTimeRemaining && !showPercentage && (
          <span className="font-mono">{formatTimeRemaining(remaining)}</span>
        )}
      </div>
    </div>
  );
}
