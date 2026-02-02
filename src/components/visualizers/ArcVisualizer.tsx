import { useRef, useEffect } from 'react';
import { VisualizerConfig, Marker } from '../../types';
import { formatTimeRemaining } from '../../engine/timeEngine';

interface ArcVisualizerProps {
  progress: number;
  remaining: number;
  config: VisualizerConfig;
  markers?: Marker[];
  size?: number;
  className?: string;
}

export function ArcVisualizer({
  progress,
  remaining,
  config,
  markers = [],
  size = 200,
  className = '',
}: ArcVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    startAngle = -90,
    direction = 'clockwise',
    thickness = 0.15,
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
    const outerRadius = displaySize / 2 - 5;
    const innerRadius = outerRadius * (1 - thickness);
    const midRadius = (outerRadius + innerRadius) / 2;
    const lineWidth = outerRadius - innerRadius;

    // Clear canvas
    ctx.clearRect(0, 0, displaySize, displaySize);

    // Draw background arc (full circle)
    ctx.beginPath();
    ctx.arc(centerX, centerY, midRadius, 0, Math.PI * 2);
    ctx.strokeStyle = backgroundColor;
    ctx.lineWidth = lineWidth;
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
        midRadius,
        startRad,
        endRad,
        direction === 'counterclockwise'
      );

      // Create gradient
      const gradient = ctx.createConicGradient(startRad, centerX, centerY);
      gradient.addColorStop(0, foregroundColor);
      gradient.addColorStop(progress, config.colorStops?.[1]?.color ?? foregroundColor);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Draw markers
    markers.forEach(marker => {
      const markerAngle = startRad + (direction === 'clockwise' ? 1 : -1) * marker.position * Math.PI * 2;
      const markerX = centerX + Math.cos(markerAngle) * midRadius;
      const markerY = centerY + Math.sin(markerAngle) * midRadius;

      // Draw marker line
      const innerX = centerX + Math.cos(markerAngle) * innerRadius;
      const innerY = centerY + Math.sin(markerAngle) * innerRadius;
      const outerX = centerX + Math.cos(markerAngle) * outerRadius;
      const outerY = centerY + Math.sin(markerAngle) * outerRadius;

      ctx.beginPath();
      ctx.moveTo(innerX, innerY);
      ctx.lineTo(outerX, outerY);
      ctx.strokeStyle = marker.color ?? '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw marker dot
      ctx.beginPath();
      ctx.arc(markerX, markerY, 4, 0, Math.PI * 2);
      ctx.fillStyle = marker.color ?? '#ffffff';
      ctx.fill();
    });

    // Draw center content
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (showPercentage) {
      ctx.font = `bold ${innerRadius * 0.5}px Inter, sans-serif`;
      ctx.fillStyle = '#e4e4e7';
      ctx.fillText(`${Math.round(progress * 100)}%`, centerX, centerY);
    } else if (showTimeRemaining) {
      ctx.font = `bold ${innerRadius * 0.35}px JetBrains Mono, monospace`;
      ctx.fillStyle = '#e4e4e7';
      ctx.fillText(formatTimeRemaining(remaining), centerX, centerY);
    }

  }, [progress, remaining, config, markers, size, startAngle, direction, thickness, backgroundColor, foregroundColor, showPercentage, showTimeRemaining]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}
