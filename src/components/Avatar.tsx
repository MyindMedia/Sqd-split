import { AVATAR_COLORS } from '../data/mockData';

interface AvatarProps {
  name: string;
  size?: number;
  src?: string;
  showBorder?: boolean;
  borderColor?: string;
}

export function Avatar({ name, size = 44, src, showBorder = false, borderColor }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const colorIndex = name.charCodeAt(0) % AVATAR_COLORS.length;
  const bgColor = AVATAR_COLORS[colorIndex];

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: src ? `url(${src}) center/cover` : bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: size * 0.36,
        fontWeight: 700,
        fontFamily: 'var(--font-headline)',
        color: '#1a1919',
        border: showBorder ? `2px solid ${borderColor || bgColor}` : 'none',
        boxShadow: showBorder ? `0 0 0 2px var(--surface)` : 'none',
      }}
    >
      {!src && initials}
    </div>
  );
}

interface AvatarGroupProps {
  names: string[];
  size?: number;
  max?: number;
}

export function AvatarGroup({ names, size = 32, max = 4 }: AvatarGroupProps) {
  const visible = names.slice(0, max);
  const remaining = names.length - max;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {visible.map((name, i) => (
        <div
          key={name + i}
          style={{
            marginLeft: i === 0 ? 0 : -(size * 0.3),
            zIndex: visible.length - i,
            position: 'relative',
          }}
        >
          <Avatar name={name} size={size} showBorder />
        </div>
      ))}
      {remaining > 0 && (
        <div
          style={{
            marginLeft: -(size * 0.3),
            width: size,
            height: size,
            borderRadius: '50%',
            background: 'var(--surface-container-highest)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size * 0.32,
            fontWeight: 600,
            color: 'var(--on-surface-variant)',
            border: '2px solid var(--surface)',
            zIndex: 0,
          }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
