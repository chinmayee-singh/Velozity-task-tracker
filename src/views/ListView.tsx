import { useState, useMemo } from "react";
import { USERS } from "../data/seed";
import { Avatar } from "../components/Avatar";
import { useTaskStore } from "../store/useTaskStore";
import type { Status, Task } from "../types";
import type { CollabPresence } from "../hooks/useCollaboration";

const ROW_HEIGHT = 56;
const OVERSCAN = 5;

type SortKey = "title" | "priority" | "dueDate";
type SortDir = "asc" | "desc";

const PRIORITY_WEIGHT: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return <span className="text-amber-600 font-bold">Due Today</span>;
  if (diffDays < -7) return <span className="text-red-600 font-bold">{Math.abs(diffDays)} days overdue</span>;
  
  return dateStr;
}

export function ListView({ presences }: { presences: CollabPresence[] }) {
  const { getFilteredTasks, updateTaskStatus } = useTaskStore();
  const rawTasks = getFilteredTasks();

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [scrollTop, setScrollTop] = useState(0);

  const tasks = useMemo(() => {
    if (!sortKey) return rawTasks;
    return [...rawTasks].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "title") cmp = a.title.localeCompare(b.title);
      else if (sortKey === "dueDate") cmp = a.dueDate.localeCompare(b.dueDate);
      else if (sortKey === "priority") {
        cmp = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rawTasks, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const totalHeight = tasks.length * ROW_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const visibleCount = Math.ceil(600 / ROW_HEIGHT) + 2 * OVERSCAN;
  const endIndex = Math.min(tasks.length, startIndex + visibleCount);
  const visibleTasks = tasks.slice(startIndex, endIndex);

  const assignee = (id: string) => USERS.find((u) => u.id === id);

  return (
    <div className="px-6 py-4 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Table Header */}
        <div className="bg-slate-50 border-b border-slate-200 grid grid-cols-12 px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
          <div className="col-span-4 cursor-pointer hover:text-slate-800 flex items-center" onClick={() => handleSort("title")}>
            Title {sortKey === "title" && <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>}
          </div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 cursor-pointer hover:text-slate-800 flex items-center" onClick={() => handleSort("priority")}>
            Priority {sortKey === "priority" && <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>}
          </div>
          <div className="col-span-2">Assignee</div>
          <div className="col-span-2 cursor-pointer hover:text-slate-800 flex items-center" onClick={() => handleSort("dueDate")}>
            Due Date {sortKey === "dueDate" && <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>}
          </div>
        </div>

        {/* Scrollable Body */}
        <div 
          onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          className="overflow-y-auto relative"
          style={{ height: "600px" }}
        >
          <div style={{ height: `${totalHeight}px`, position: "relative" }}>
            {visibleTasks.map((task, index) => {
              const actualIndex = startIndex + index;
              return (
                <div 
                  key={task.id} 
                  className="grid grid-cols-12 px-4 border-b border-slate-100 hover:bg-slate-50 transition-colors items-center absolute w-full"
                  style={{ 
                    height: `${ROW_HEIGHT}px`,
                    top: `${actualIndex * ROW_HEIGHT}px`
                  }}
                >
                  <div className="col-span-4 text-sm font-medium text-slate-900 truncate pr-4">{task.title}</div>
                  <div className="col-span-2">
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value as Status)}
                      className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-700 focus:outline-none"
                    >
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="In Review">In Review</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
                      {task.priority}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    {assignee(task.assigneeId) && (
                      <>
                        <Avatar name={assignee(task.assigneeId)!.name} color={assignee(task.assigneeId)!.color} size="sm" />
                        <span className="text-sm text-slate-600 truncate">{assignee(task.assigneeId)!.name}</span>
                      </>
                    )}
                  </div>
                  <div className="col-span-2 text-sm text-slate-500 truncate">
                    {formatDate(task.dueDate)}
                  </div>
                </div>
              );
            })}
          </div>
          {tasks.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm absolute w-full top-0">
              No tasks found matching your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}