import { useState, useRef, useEffect, useMemo } from "react";
import { USERS } from "../data/seed";
import { Avatar } from "../components/Avatar";
import { useTaskStore } from "../store/useTaskStore";
import type { Status, Task } from "../types";
import type { CollabPresence } from "../hooks/useCollaboration";

const STATUSES: Status[] = ["Todo", "In Progress", "In Review", "Done"];

interface DragState {
  task: Task;
  rect: DOMRect;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isSnappingBack: boolean;
}

export function KanbanView({ presences }: { presences: CollabPresence[] }) {
  const { getFilteredTasks, updateTaskStatus } = useTaskStore();
  const rawTasks = getFilteredTasks();

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [hoveredStatus, setHoveredStatus] = useState<Status | null>(null);
  const columnRefs = useRef<Record<string, HTMLElement | null>>({});

  const tasksByStatus = useMemo(() => {
    const grouped: Record<Status, Task[]> = {
      "Todo": [], "In Progress": [], "In Review": [], "Done": []
    };
    for (const t of rawTasks) {
      if (grouped[t.status as Status]) grouped[t.status as Status].push(t);
    }
    return grouped;
  }, [rawTasks]);

  useEffect(() => {
    if (!dragState || dragState.isSnappingBack) return;

    const handlePointerMove = (e: PointerEvent) => {
      e.preventDefault();
      setDragState(prev => prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null);

      let overStatus: Status | null = null;
      for (const status of STATUSES) {
        const col = columnRefs.current[status];
        if (col) {
          const rect = col.getBoundingClientRect();
          if (
            e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom
          ) {
            overStatus = status;
            break;
          }
        }
      }
      setHoveredStatus(overStatus);
    };

    const handlePointerUp = () => {
      if (hoveredStatus && hoveredStatus !== dragState.task.status) {
        updateTaskStatus(dragState.task.id, hoveredStatus);
        setDragState(null);
        setHoveredStatus(null);
      } else {
        setDragState(prev => prev ? { ...prev, isSnappingBack: true } : null);
        setHoveredStatus(null);
        setTimeout(() => setDragState(null), 300);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragState, hoveredStatus, updateTaskStatus]);

  const onPointerDown = (e: React.PointerEvent, task: Task) => {
    if (e.button !== 0) return;
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    target.setPointerCapture(e.pointerId);

    setDragState({
      task, rect, startX: e.clientX, startY: e.clientY,
      currentX: e.clientX, currentY: e.clientY, isSnappingBack: false
    });
    setHoveredStatus(task.status as Status);
  };

  const assignee = (id: string) => USERS.find((u) => u.id === id);

  const renderTaskCard = (task: Task, isGhost = false) => {
    const activeUsers = presences.filter(p => p.activeTaskId === task.id);
    const displayUsers = activeUsers.slice(0, 2);
    const extraUsers = activeUsers.length - 2;

    return (
      <article
        className={`bg-slate-50 border rounded-md p-3 select-none touch-none ${
          isGhost 
            ? "border-indigo-400 shadow-xl opacity-90 cursor-grabbing" 
            : "border-slate-200 shadow-sm cursor-grab hover:border-indigo-300 relative"
        }`}
      >
        <div className="text-sm font-semibold text-slate-900 mb-1">{task.title}</div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">
            {task.priority}
          </span>
          {task.dueDate && <span className="text-rose-500 font-semibold">{task.dueDate}</span>}
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {assignee(task.assigneeId) && (
              <Avatar name={assignee(task.assigneeId)!.name} color={assignee(task.assigneeId)!.color} size="sm" />
            )}
          </div>
          
          {activeUsers.length > 0 && (
            <div className="flex items-center -space-x-2 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100 transition-all duration-300">
              {displayUsers.map((p, i) => (
                <div key={i} className="ring-2 ring-white rounded-full">
                  <Avatar name={p.user.name} color={p.user.color} size="sm" />
                </div>
              ))}
              {extraUsers > 0 && (
                <div className="w-6 h-6 rounded-full bg-slate-200 ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                  +{extraUsers}
                </div>
              )}
            </div>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 px-6 py-4 relative">
      {STATUSES.map((status) => {
        const isHovered = hoveredStatus === status;
        const tasks = tasksByStatus[status];
        
        return (
          <section
            key={status}
            ref={(el) => { columnRefs.current[status] = el; }}
            className={`rounded-lg border shadow-sm flex flex-col min-h-[60vh] transition-colors duration-200 ${
              isHovered ? "bg-indigo-50/50 border-indigo-300" : "bg-white border-slate-200"
            }`}
          >
            <header className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-800">{status}</span>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{tasks.length}</span>
              </div>
            </header>

            <div className="p-3 flex flex-col gap-3 flex-1 overflow-y-auto">
              {tasks.length === 0 && (
                <div className="flex-1 flex border-2 border-dashed border-slate-200 rounded-lg items-center justify-center text-sm text-slate-400 p-4 text-center">
                  Drop tasks here
                </div>
              )}
              
              {tasks.map((task) => {
                const isDraggingThis = dragState?.task.id === task.id;
                
                if (isDraggingThis) {
                  return (
                    <div 
                      key={`placeholder-${task.id}`}
                      style={{ height: dragState?.rect.height }}
                      className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-md opacity-60"
                    />
                  );
                }

                return (
                  <div key={task.id} onPointerDown={(e) => onPointerDown(e, task)}>
                    {renderTaskCard(task)}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {dragState && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            width: dragState.rect.width, height: dragState.rect.height,
            left: dragState.rect.left, top: dragState.rect.top,
            transition: dragState.isSnappingBack ? "transform 300ms cubic-bezier(0.2, 0, 0, 1)" : "none",
            transform: dragState.isSnappingBack 
              ? "translate(0px, 0px)" 
              : `translate(${dragState.currentX - dragState.startX}px, ${dragState.currentY - dragState.startY}px)`,
          }}
        >
          {renderTaskCard(dragState.task, true)}
        </div>
      )}
    </div>
  );
}