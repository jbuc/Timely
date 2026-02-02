import { useMemo } from 'react';
import { VisualizerConfig, ColorStop } from '../../types';
import { formatTimeRemaining } from '../../engine/timeEngine';

interface ColorVisualizerProps {
  progress: number;
  remaining: number;
  config: VisualizerConfig;
  size?: number;
  className?: string;
}

// Interpolate between two hex colors
function interpolateColor(color1: string, color2: string, factor: number): string {
  // Convert hex to RGB
  const hex2rgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 0, 0];
  };

  // Convert RGB to hex
  const rgb2hex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const [r1, g1, b1] = hex2rgb(color1);
  const [r2, g2, b2] = hex2rgb(color2);

  const r = r1 + (r2 - r1) * factor;
  const g = g1 + (g2 - g1) * factor;
  const b = b1 + (b2 - b1) * factor;

  return rgb2hex(r, g, b);
}

// Get color at a specific progress point given color stops
function getColorAtProgress(colorStops: ColorStop[], progress: number): string {
  if (colorStops.length === 0) return '#6366f1';
  if (colorStops.length === 1) return colorStops[0].color;

  // Sort stops by position
  const sorted = [...colorStops].sort((a, b) => a.position - b.position);

  // Find the two stops we're between
  let startStop = sorted[0];
  let endStop = sorted[sorted.length - 1];

  for (let i = 0; i < sorted.length - 1; i++) {
    if (progress >= sorted[i].position && progress <= sorted[i + 1].position) {
      startStop = sorted[i];
      endStop = sorted[i + 1];
      break;
    }
  }

  // Handle edge cases
  if (progress <= startStop.position) return startStop.color;
  if (progress >= endStop.position) return endStop.color;

  // Interpolate between the two stops
  const range = endStop.position - startStop.position;
  const factor = (progress - startStop.position) / range;

  return interpolateColor(startStop.color, endStop.color, factor);
}

// Default color stops for a nice gradient
const DEFAULT_COLOR_STOPS: ColorStop[] = [
  { position: 0, color: '#22c55e' },    // Green
  { position: 0.5, color: '#eab308' },  // Yellow
  { position: 1, color: '#3b82f6' },    // Blue
];

export function ColorVisualizer({
  progress,
  remaining,
  config,
  size = 200,
  className = '',
}: ColorVisualizerProps) {
  const {
    colorStops = DEFAULT_COLOR_STOPS,
    borderRadius = 50,
    showTimeRemaining = true,
    showPercentage = false,
  } = config;

  const currentColor = useMemo(() => {
    return getColorAtProgress(colorStops, progress);
  }, [colorStops, progress]);

  // Calculate a contrasting text color
  const textColor = useMemo(() => {
    const hex2rgb = (hex: string): [number, number, number] => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
        : [0, 0, 0];
    };

    const [r, g, b] = hex2rgb(currentColor);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#1a1a2e' : '#ffffff';
  }, [currentColor]);

  const borderRadiusStyle = borderRadius === 50 ? '50%' : `${borderRadius}%`;

  return (
    <div
      className={`flex items-center justify-center transition-colors duration-500 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: currentColor,
        borderRadius: borderRadiusStyle,
        boxShadow: `0 0 ${size / 4}px ${currentColor}40`,
      }}
    >
      <div className="text-center" style={{ color: textColor }}>
        {showPercentage && (
          <div
            className="font-bold"
            style={{ fontSize: size / 5 }}
          >
            {Math.round(progress * 100)}%
          </div>
        )}
        {showTimeRemaining && (
          <div
            className="font-mono"
            style={{ fontSize: size / 8 }}
          >
            {formatTimeRemaining(remaining)}
          </div>
        )}
      </div>
    </div>
  );
}
