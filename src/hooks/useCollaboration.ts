import { useState, useEffect } from "react";
import { USERS } from "../data/seed";
import { useTaskStore } from "../store/useTaskStore";
import type { User } from "../types";

export interface CollabPresence {
  user: User;
  activeTaskId?: string;
}

export function useCollaboration() {
  const [presences, setPresences] = useState<CollabPresence[]>([]);
  const tasks = useTaskStore(state => state.tasks);

  useEffect(() => {
    if (!tasks.length) return;

    // Simulate 2-4 users joining
    const numUsers = Math.floor(Math.random() * 3) + 2; 
    const initialUsers = USERS.slice(0, numUsers).map(u => ({
      user: u,
      // Randomly assign to one of the first 20 tasks so they are visible on screen
      activeTaskId: tasks[Math.floor(Math.random() * Math.min(20, tasks.length))].id 
    }));
    setPresences(initialUsers);

    // Every 3 seconds, simulated users have a chance to "move" to another task
    const interval = setInterval(() => {
      setPresences(prev => prev.map(p => {
        if (Math.random() > 0.6) {
           return { ...p, activeTaskId: tasks[Math.floor(Math.random() * Math.min(20, tasks.length))].id };
        }
        return p;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [tasks]);

  return { presences };
}