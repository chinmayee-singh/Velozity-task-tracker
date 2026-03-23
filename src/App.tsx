import { Header } from "./components/Header";
import { FilterBar } from "./components/FilterBar";
import { KanbanView } from "./views/KanbanView";
import { ListView } from "./views/ListView";
import { TimelineView } from "./views/TimelineView";
import { useTaskStore } from "./store/useTaskStore";
import { useUrlFilters } from "./hooks/useUrlFilters";
import { useCollaboration } from "./hooks/useCollaboration";

export default function App() {
  const view = useTaskStore((state) => state.view);
  useUrlFilters();
  const { presences } = useCollaboration();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header presences={presences} />
      <FilterBar />
      <main className="flex-1 overflow-hidden flex flex-col">
        {view === "kanban" && <KanbanView presences={presences} />}
        {view === "list" && <ListView presences={presences} />}
        {view === "timeline" && <TimelineView presences={presences} />}
      </main>
    </div>
  );
}