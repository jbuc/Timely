import { useRef, useEffect } from 'react';
import { VisualizerConfig, Marker } from '../../types';
import { formatTimeRemaining } from '../../engine/timeEngine';

interface RadialVisualizerProps {
  progress: number;
  remaining: number;
  config: VisualizerConfig;
  markers?: Marker[];
  size?: number;
  className?: string;
}

export function RadialVisualizer({
  progress,
  remaining,
  config,
  markers = [],
  size = 200,
  className = '',
}: RadialVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    startAngle = -90,
    direction = 'clockwise',
    backgroundColor = 'rgba(255, 255, 255, 0.1)',
    foregroundColor = 'var(--color-primary, #6366f1)',
    showPercentage = false,
    showTimeRemaining = true,
  } = config;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displaySize = size;
    canvas.width = displaySize * dpr;
    canvas.height = displaySize * dpr;
    ctx.scale(dpr, dpr);

    const centerX = displaySize / 2;
    const centerY = displaySize / 2;
    const radius = displaySize / 2 - 10;
    const lineWidth = Math.max(8, displaySize / 12);

    // Clear canvas
    ctx.clearRect(0, 0, displaySize, displaySize);

    // Draw background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = backgroundColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Calculate angles
    const startRad = (startAngle * Math.PI) / 180;
    const progressAngle = progress * Math.PI * 2;
    const endRad = direction === 'clockwise'
      ? startRad + progressAngle
      : startRad - progressAngle;

    // Draw progress arc
    if (progress > 0) {
      ctx.beginPath();
      ctx.arc(
        centerX,
        centerY,
        radius,
        startRad,
        endRad,
        direction === 'counterclockwise'
      );

      // Create gradient for the progress arc
      const gradient = ctx.createLinearGradient(0, 0, displaySize, displaySize);
      gradient.addColorStop(0, foregroundColor);
      gradient.addColorStop(1, config.colorStops?.[1]?.color ?? foregroundColor);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Draw markers
    markers.forEach(marker => {
      const markerAngle = startRad + (direction === 'clockwise' ? 1 : -1) * marker.position * Math.PI * 2;
      const markerX = centerX + Math.cos(markerAngle) * radius;
      const markerY = centerY + Math.sin(markerAngle) * radius;

      ctx.beginPath();
      ctx.arc(markerX, markerY, lineWidth / 2 + 2, 0, Math.PI * 2);
      ctx.fillStyle = marker.color ?? '#ffffff';
      ctx.fill();

      // Draw marker label if enabled
      if (marker.showLabel && marker.label) {
        const labelRadius = radius + lineWidth + 10;
        const labelX = centerX + Math.cos(markerAngle) * labelRadius;
        const labelY = centerY + Math.sin(markerAngle) * labelRadius;

        ctx.font = `${Math.max(10, displaySize / 16)}px Inter, sans-serif`;
        ctx.fillStyle = 'var(--color-text, #e4e4e7)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(marker.label, labelX, labelY);
      }
    });

    // Draw center text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (showPercentage) {
      ctx.font = `bold ${displaySize / 5}px Inter, sans-serif`;
      ctx.fillStyle = 'var(--color-text, #e4e4e7)';
      ctx.fillText(`${Math.round(progress * 100)}%`, centerX, centerY);
    } else if (showTimeRemaining) {
      ctx.font = `bold ${displaySize / 6}px JetBrains Mono, monospace`;
      ctx.fillStyle = 'var(--color-text, #e4e4e7)';
      ctx.fillText(formatTimeRemaining(remaining), centerX, centerY);
    }

  }, [progress, remaining, config, markers, size, startAngle, direction, backgroundColor, foregroundColor, showPercentage, showTimeRemaining]);

  return (
    <canvas
      ref={canvasRef}
      className={`${className}`}
      style={{ width: size, height: size }}
    />
  );
}
