export const TODAY_ISO = new Date().toISOString().split('T')[0];

export function getDaysDiff(dateStr: string): number {
  const due = new Date(dateStr);
  const now = new Date(TODAY_ISO);
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export interface DateLabel {
  label: string;
  isOverdue: boolean;
  isToday: boolean;
}

export function formatDueDate(dueDate: string): DateLabel {
  const diff = getDaysDiff(dueDate);
  const isOverdue = diff < 0;
  const isToday   = diff === 0;
  const daysOver  = Math.abs(diff);

  let label: string;
  if (isToday) {
    label = 'Due Today';
  } else if (isOverdue && daysOver > 7) {
    label = `${daysOver}d overdue`;
  } else if (isOverdue) {
    label = 'Overdue';
  } else {
    label = new Date(dueDate + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
    });
  }

  return { label, isOverdue, isToday };
}
