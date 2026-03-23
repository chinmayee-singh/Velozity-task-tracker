import type { Task, User, Priority, Status } from "../types";

export const USERS: User[] = [
  { id: "u1", name: "Alice Johnson", color: "#818cf8" },
  { id: "u2", name: "Bob Smith", color: "#fbbf24" },
  { id: "u3", name: "Charlie Ward", color: "#34d399" },
  { id: "u4", name: "Diana Prince", color: "#f87171" },
  { id: "u5", name: "Evan Davis", color: "#a78bfa" },
  { id: "u6", name: "Fiona White", color: "#38bdf8" },
];

const PRIORITIES: Priority[] = ["Critical", "High", "Medium", "Low"];
const STATUSES: Status[] = ["Todo", "In Progress", "In Review", "Done"];

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export const generateTasks = (): Task[] => {
  const tasks: Task[] = [];
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 28);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  for (let i = 1; i <= 500; i++) {
    const startDate = randomDate(lastMonth, now);
    const dueDate = randomDate(startDate, nextMonth);
    
    tasks.push({
      id: `t-${i}`,
      title: `Task ${i}: ${["Fix", "Update", "Design", "Review", "Deploy", "Test"][Math.floor(Math.random() * 6)]} component ${i}`,
      status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
      priority: PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)],
      assigneeId: USERS[Math.floor(Math.random() * USERS.length)].id,
      startDate: Math.random() > 0.2 ? startDate.toISOString().split('T')[0] : undefined,
      dueDate: dueDate.toISOString().split('T')[0],
    });
  }
  return tasks;
};