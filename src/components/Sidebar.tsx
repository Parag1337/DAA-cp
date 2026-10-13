import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Network, Waves, ArrowDownToLine, RefreshCcw, Route, UserSearch, BarChart3, Database, PanelLeftClose, PanelLeftOpen, GraduationCap, Share2, ListTree, ArrowLeftRight } from 'lucide-react';

const items = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/graph', label: 'Transaction Graph', icon: Network },
  { to: '/bfs', label: 'BFS Analysis', icon: Waves },
  { to: '/dfs', label: 'DFS Analysis', icon: ArrowDownToLine },
  { to: '/cycles', label: 'Cycle Detection', icon: RefreshCcw },
  { to: '/dijkstra', label: 'Dijkstra Path', icon: Route },
  { to: '/shortest', label: 'Fewest Hops', icon: ArrowLeftRight },
  { to: '/all-paths', label: 'All Simple Paths', icon: ListTree },
  { to: '/components', label: 'Strong Components', icon: Share2 },
  { to: '/addresses', label: 'Address Analysis', icon: UserSearch },
  { to: '/statistics', label: 'Statistics', icon: BarChart3 },
  { to: '/dataset', label: 'Dataset', icon: Database },
];

export default function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside className={`sticky top-0 h-screen shrink-0 glass rounded-none border-y-0 border-l-0 flex flex-col transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-64'}`}>
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 via-cyan-400 to-purple-500 text-xs font-bold text-slate-950">CTGA</div>
        {!collapsed && <div className="text-xs leading-tight text-slate-300">Cryptocurrency Transaction<br /><span className="text-cyan-300">Graph Analyzer</span></div>}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end title={label}
            className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${isActive ? 'bg-gradient-to-r from-blue-500/25 to-purple-500/20 text-cyan-300 border border-cyan-400/20' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}`}>
            <Icon size={18} className="shrink-0" />{!collapsed && label}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-3 border-t border-white/10 p-3">
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 text-xs text-slate-400"><GraduationCap size={16} className="text-purple-400" />
            <div><div className="font-medium text-slate-200">DSA Project</div>Graph Algorithms</div></div>
        )}
        <button onClick={onToggle} className="btn btn-ghost w-full justify-center" aria-label="Toggle sidebar">
          {collapsed ? <PanelLeftOpen size={16} /> : <><PanelLeftClose size={16} />Collapse</>}
        </button>
      </div>
    </aside>
  );
}
