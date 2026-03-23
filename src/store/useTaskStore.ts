import { create } from "zustand";
import type { Task, Status, FilterState, ViewType } from "../types";
import { generateTasks } from "../data/seed";

interface TaskState {
  tasks: Task[];
  view: ViewType;
  filters: FilterState;
  setTasks: (tasks: Task[]) => void;
  setView: (view: ViewType) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  updateTaskStatus: (taskId: string, status: Status) => void;
  getFilteredTasks: () => Task[];
}

const initialFilters: FilterState = {
  statuses: [],
  priorities: [],
  assigneeIds: [],
  dueDateFrom: "",
  dueDateTo: "",
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: generateTasks(),
  view: "kanban",
  filters: initialFilters,
  
  setTasks: (tasks) => set({ tasks }),
  setView: (view) => set({ view }),
  
  setFilters: (newFilters) => 
    set((state) => ({ 
      filters: { ...state.filters, ...newFilters } 
    })),
    
  clearFilters: () => set({ filters: initialFilters }),
  
  updateTaskStatus: (taskId, status) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
    })),
    
  getFilteredTasks: () => {
    const { tasks, filters } = get();
    return tasks.filter((t) => {
      if (filters.statuses.length > 0 && !filters.statuses.includes(t.status as Status)) return false;
      if (filters.priorities.length > 0 && !filters.priorities.includes(t.priority)) return false;
      if (filters.assigneeIds.length > 0 && !filters.assigneeIds.includes(t.assigneeId)) return false;
      if (filters.dueDateFrom && t.dueDate < filters.dueDateFrom) return false;
      if (filters.dueDateTo && t.dueDate > filters.dueDateTo) return false;
      return true;
    });
  },
}));