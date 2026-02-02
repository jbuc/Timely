import { TimeSpanConfig, TimeSpanState } from '../../types';
import { RadialVisualizer } from './RadialVisualizer';
import { ColorVisualizer } from './ColorVisualizer';
import { ArcVisualizer } from './ArcVisualizer';
import { LinearVisualizer } from './LinearVisualizer';

interface TimeVisualizerProps {
  config: TimeSpanConfig;
  state: TimeSpanState;
  size?: number;
  className?: string;
}

export function TimeVisualizer({
  config,
  state,
  size = 200,
  className = '',
}: TimeVisualizerProps) {
  const { visualizer, markers, name } = config;
  const { progress, remaining } = state;

  const sizeClass = {
    small: 120,
    medium: 200,
    large: 300,
    fill: size,
  }[visualizer.size ?? 'medium'];

  const visualizerProps = {
    progress,
    remaining,
    config: visualizer,
    markers,
    size: sizeClass,
    className,
  };

  const renderVisualizer = () => {
    switch (visualizer.type) {
      case 'radial':
        return <RadialVisualizer {...visualizerProps} />;
      case 'color':
      case 'bubble':
        return <ColorVisualizer {...visualizerProps} />;
      case 'arc':
        return <ArcVisualizer {...visualizerProps} />;
      case 'linear':
        return (
          <LinearVisualizer
            {...visualizerProps}
            width={sizeClass * 1.5}
            height={sizeClass / 5}
          />
        );
      case 'dots':
        return <DotsVisualizer {...visualizerProps} />;
      default:
        return <RadialVisualizer {...visualizerProps} />;
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {renderVisualizer()}
      <span className="text-sm text-text-muted">{name}</span>
    </div>
  );
}

// Simple dots visualizer
function DotsVisualizer({
  progress,
  config,
  size = 200,
  className = '',
}: {
  progress: number;
  remaining: number;
  config: TimeSpanConfig['visualizer'];
  size?: number;
  className?: string;
}) {
  const dotCount = 12;
  const activeDots = Math.floor(progress * dotCount);
  const dotSize = size / 10;
  const radius = size / 2 - dotSize;

  const {
    backgroundColor = 'rgba(255, 255, 255, 0.2)',
    foregroundColor = '#6366f1',
  } = config;

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {Array.from({ length: dotCount }).map((_, i) => {
        const angle = (i / dotCount) * Math.PI * 2 - Math.PI / 2;
        const x = size / 2 + Math.cos(angle) * radius - dotSize / 2;
        const y = size / 2 + Math.sin(angle) * radius - dotSize / 2;
        const isActive = i < activeDots;

        return (
          <div
            key={i}
            className="absolute rounded-full transition-all duration-200"
            style={{
              left: x,
              top: y,
              width: dotSize,
              height: dotSize,
              backgroundColor: isActive ? foregroundColor : backgroundColor,
              boxShadow: isActive ? `0 0 ${dotSize}px ${foregroundColor}60` : 'none',
              transform: isActive ? 'scale(1.1)' : 'scale(1)',
            }}
          />
        );
      })}
    </div>
  );
}

export { RadialVisualizer } from './RadialVisualizer';
export { ColorVisualizer } from './ColorVisualizer';
export { ArcVisualizer } from './ArcVisualizer';
export { LinearVisualizer } from './LinearVisualizer';
