import { useMemo, useRef, useEffect } from "react";
import { useTaskStore } from "../store/useTaskStore";
import type { CollabPresence } from "../hooks/useCollaboration";

const DAY_WIDTH = 48; // Width of each day column in pixels
const ROW_HEIGHT = 40; // Height of each task row

export function TimelineView({ presences }: { presences: CollabPresence[] }) {
  const { getFilteredTasks } = useTaskStore();
  const rawTasks = getFilteredTasks();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate an array of days for the current month
  const { daysInMonth, startDate, todayIndex } = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    const days = new Date(year, month + 1, 0).getDate();
    const start = new Date(year, month, 1);
    
    const daysArray = Array.from({ length: days }, (_, i) => {
      const d = new Date(year, month, i + 1);
      return {
        date: d,
        dayStr: d.getDate().toString().padStart(2, '0'),
        isToday: d.getDate() === today.getDate()
      };
    });

    return { 
      daysInMonth: daysArray, 
      startDate: start,
      todayIndex: today.getDate() - 1 
    };
  }, []);

  // Filter out tasks that don't have dates in this month, and sort them
  const timelineTasks = useMemo(() => {
    const currentMonth = startDate.getMonth();
    const currentYear = startDate.getFullYear();

    return rawTasks.filter(t => {
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      // Include if due date is in this month
      if (due.getMonth() === currentMonth && due.getFullYear() === currentYear) return true;
      // Or if start date is in this month
      if (t.startDate) {
        const start = new Date(t.startDate);
        if (start.getMonth() === currentMonth && start.getFullYear() === currentYear) return true;
      }
      return false;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [rawTasks, startDate]);

  // Auto-scroll to today
  useEffect(() => {
    if (scrollRef.current && todayIndex > 0) {
      const scrollAmount = (todayIndex * DAY_WIDTH) - (window.innerWidth / 3);
      scrollRef.current.scrollLeft = Math.max(0, scrollAmount);
    }
  }, [todayIndex]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-rose-500';
      case 'High': return 'bg-amber-500';
      case 'Medium': return 'bg-blue-500';
      case 'Low': return 'bg-slate-400';
      default: return 'bg-indigo-500';
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-slate-50 pt-4">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-auto px-6 pb-6 relative"
      >
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm inline-block min-w-full">
          
          {/* Header Row (Days) */}
          <div className="flex sticky top-0 bg-white z-20 border-b border-slate-200">
            <div className="w-64 shrink-0 border-r border-slate-200 p-3 bg-slate-50 font-semibold text-sm text-slate-700">
              Task Name
            </div>
            <div className="flex">
              {daysInMonth.map((day, i) => (
                <div 
                  key={i} 
                  className={`w-[48px] shrink-0 border-r border-slate-100 flex items-center justify-center py-2 text-xs font-medium ${
                    day.isToday ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500'
                  }`}
                >
                  {day.dayStr}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Grid Background & Today Line */}
          <div className="relative">
            {/* Today Vertical Line */}
            <div 
              className="absolute top-0 bottom-0 w-px bg-indigo-400 z-10 pointer-events-none"
              style={{ left: `calc(16rem + ${(todayIndex * DAY_WIDTH) + (DAY_WIDTH / 2)}px)` }}
            />

            {/* Task Rows */}
            {timelineTasks.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No tasks scheduled for this month.
              </div>
            ) : (
              timelineTasks.map((task) => {
                const due = new Date(task.dueDate);
                const dueDay = due.getDate();
                
                let startDay = dueDay; // Default to single day if no start date
                if (task.startDate) {
                  const start = new Date(task.startDate);
                  if (start.getMonth() === startDate.getMonth()) {
                    startDay = start.getDate();
                  } else {
                    startDay = 1; // Started in a previous month
                  }
                }

                // If start date is accidentally after due date, fix it visually
                const actualStart = Math.min(startDay, dueDay);
                const actualEnd = Math.max(startDay, dueDay);
                
                const leftPos = (actualStart - 1) * DAY_WIDTH;
                // Add 1 to include the end day fully
                const width = ((actualEnd - actualStart) + 1) * DAY_WIDTH;

                return (
                  <div key={task.id} className="flex group border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    {/* Fixed Task Name Column */}
                    <div className="w-64 shrink-0 border-r border-slate-200 p-3 bg-white group-hover:bg-slate-50 sticky left-0 z-10 truncate text-sm text-slate-800">
                      {task.title}
                    </div>
                    
                    {/* Scrollable Timeline Area */}
                    <div className="relative flex-1" style={{ width: `${daysInMonth.length * DAY_WIDTH}px`, height: `${ROW_HEIGHT}px` }}>
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex pointer-events-none">
                        {daysInMonth.map((_, i) => (
                          <div key={i} className="w-[48px] shrink-0 border-r border-slate-100/50 h-full" />
                        ))}
                      </div>

                      {/* Task Bar */}
                      <div 
                        className={`absolute top-2 h-6 rounded-md shadow-sm ${getPriorityColor(task.priority)} flex items-center px-2 z-0 opacity-90`}
                        style={{ 
                          left: `${leftPos + 4}px`, 
                          width: `${width - 8}px` 
                        }}
                      >
                        <span className="text-[10px] text-white font-medium truncate pointer-events-none select-none">
                          {task.title}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </div>
  );
}