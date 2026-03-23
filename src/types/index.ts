export type Status = "Todo" | "In Progress" | "In Review" | "Done";
export type Priority = "Low" | "Medium" | "High" | "Critical";
export type ViewType = "kanban" | "list" | "timeline";

export interface User {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  status: string;
  priority: Priority;
  assigneeId: string;
  startDate?: string;
  dueDate: string;
}

export interface FilterState {
  statuses: Status[];
  priorities: Priority[];
  assigneeIds: string[];
  dueDateFrom: string;
  dueDateTo: string;
}