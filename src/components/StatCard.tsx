import { LucideIcon } from 'lucide-react';
const accents = { blue: 'text-blue-400 bg-blue-500/15', cyan: 'text-cyan-300 bg-cyan-500/15', purple: 'text-purple-400 bg-purple-500/15' };
export default function StatCard({ label, value, icon: Icon, accent = 'blue' }: { label: string; value: string | number; icon: LucideIcon; accent?: keyof typeof accents }) {
  return (
    <div className="glass flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:border-cyan-400/30">
      <div className={`grid h-11 w-11 place-items-center rounded-xl ${accents[accent]}`}><Icon size={20} /></div>
      <div><div className="text-xs text-slate-400">{label}</div><div className="text-xl font-semibold">{value}</div></div>
    </div>
  );
}
