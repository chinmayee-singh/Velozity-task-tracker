import type { Priority } from '../types';

const STYLES: Record<Priority, string> = {
  Critical: 'bg-red-100 text-red-700 border-red-200',
  High:     'bg-orange-100 text-orange-700 border-orange-200',
  Medium:   'bg-yellow-100 text-yellow-800 border-yellow-200',
  Low:      'bg-green-100 text-green-700 border-green-200',
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STYLES[priority]}`}>
      {priority}
    </span>
  );
}
