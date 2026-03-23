import { useTaskStore } from '../store/useTaskStore';
import { Avatar } from './Avatar';
import type { ViewType } from '../types';
import type { CollabPresence } from '../hooks/useCollaboration';

const VIEWS: { id: ViewType; icon: string; label: string }[] = [
  { id: 'kanban',   icon: '⬛', label: 'Kanban' },
  { id: 'list',     icon: '≡',  label: 'List' },
  { id: 'timeline', icon: '──', label: 'Timeline' },
];

export function Header({ presences }: { presences: CollabPresence[] }) {
  const { view, setView } = useTaskStore();
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">PT</span>
          </div>
          <h1 className="text-base font-bold text-slate-900 hidden sm:block">ProjectTracker</h1>
        </div>
        <nav className="flex bg-slate-100 rounded-lg p-1 gap-0.5">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === v.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="mr-1">{v.icon}</span>{v.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {presences.length > 0 && (
          <>
            <span className="text-xs text-slate-500 hidden sm:block">
              {presences.length} {presences.length === 1 ? 'person' : 'people'} viewing
            </span>
            <div className="flex -space-x-2">
              {presences.slice(0, 3).map((p) => (
                <Avatar key={p.user.id} name={p.user.name} color={p.user.color} size="sm" />
              ))}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
