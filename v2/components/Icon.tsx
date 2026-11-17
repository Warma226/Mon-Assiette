import PATHS from './paths.json';

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 22, color = 'currentColor', width = 2, className }: { name: IconName; size?: number; color?: string; width?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d={PATHS[name]} />
    </svg>
  );
}
