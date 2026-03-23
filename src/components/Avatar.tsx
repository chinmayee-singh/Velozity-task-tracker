interface AvatarProps {
  name: string;
  color: string;
  size?: 'sm' | 'md';
}

export function Avatar({ name, color, size = 'md' }: AvatarProps) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const cls = size === 'sm'
    ? 'w-6 h-6 text-[10px]'
    : 'w-8 h-8 text-xs';
  return (
    <div
      className={`${cls} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ring-2 ring-white`}
      style={{ backgroundColor: color }}
      title={name}
    >
      {initials}
    </div>
  );
}
