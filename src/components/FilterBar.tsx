import { USERS } from "../data/seed";
import { useTaskStore } from "../store/useTaskStore";
import type { Status, Priority } from "../types";

const STATUSES: Status[] = ["Todo", "In Progress", "In Review", "Done"];
const PRIORITIES: Priority[] = ["Critical", "High", "Medium", "Low"];

export function FilterBar() {
  const { filters, setFilters, clearFilters } = useTaskStore();

  const toggleStatus = (status: Status) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    setFilters({ statuses: newStatuses });
  };

  const togglePriority = (priority: Priority) => {
    const newPriorities = filters.priorities.includes(priority)
      ? filters.priorities.filter((p) => p !== priority)
      : [...filters.priorities, priority];
    setFilters({ priorities: newPriorities });
  };

  const toggleAssignee = (id: string) => {
    const newAssignees = filters.assigneeIds.includes(id)
      ? filters.assigneeIds.filter((a) => a !== id)
      : [...filters.assigneeIds, id];
    setFilters({ assigneeIds: newAssignees });
  };

  const hasActiveFilters = 
    filters.statuses.length > 0 || 
    filters.priorities.length > 0 || 
    filters.assigneeIds.length > 0 || 
    filters.dueDateFrom !== "" || 
    filters.dueDateTo !== "";

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center gap-4 text-sm z-10 relative">
      <span className="font-semibold text-slate-500 text-xs tracking-wider">FILTER</span>
      
      <div className="flex items-center gap-1 border-r border-slate-200 pr-4">
        {STATUSES.map(status => (
          <button
            key={status}
            onClick={() => toggleStatus(status)}
            className={`px-3 py-1 rounded-full border transition-colors ${
              filters.statuses.includes(status) 
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-medium" 
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1 border-r border-slate-200 pr-4">
        {PRIORITIES.map(priority => (
          <button
            key={priority}
            onClick={() => togglePriority(priority)}
            className={`px-3 py-1 rounded-full border transition-colors ${
              filters.priorities.includes(priority) 
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-medium" 
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {priority}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1 border-r border-slate-200 pr-4">
        {USERS.map(u => (
          <button
            key={u.id}
            onClick={() => toggleAssignee(u.id)}
            title={u.name}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white transition-transform ${
              filters.assigneeIds.includes(u.id) ? "ring-2 ring-indigo-500 ring-offset-2 scale-110" : "opacity-70 hover:opacity-100"
            }`}
            style={{ backgroundColor: u.color }}
          >
            {u.name.split(" ").map((n: string) => n[0]).join("")}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input 
          type="date" 
          value={filters.dueDateFrom}
          onChange={(e) => setFilters({ dueDateFrom: e.target.value })}
          className="border border-slate-200 rounded px-2 py-1 text-slate-600 focus:outline-indigo-500"
        />
        <span className="text-slate-400">→</span>
        <input 
          type="date" 
          value={filters.dueDateTo}
          onChange={(e) => setFilters({ dueDateTo: e.target.value })}
          className="border border-slate-200 rounded px-2 py-1 text-slate-600 focus:outline-indigo-500"
        />
      </div>

      {hasActiveFilters && (
        <button 
          onClick={clearFilters}
          className="ml-auto text-indigo-600 hover:text-indigo-800 font-medium underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}