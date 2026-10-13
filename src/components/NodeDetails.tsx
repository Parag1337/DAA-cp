import { X } from 'lucide-react';
import { AddrAnalysis } from '../types/analysis';

export default function NodeDetails({ stats, onClose }: { stats?: AddrAnalysis; onClose: () => void }) {
  if (!stats) return null;
  const rows: [string, string | number][] = [['Address', stats.address], ['In-Degree', stats.inDeg], ['Out-Degree', stats.outDeg],
    ['Incoming Amount', stats.incoming.toLocaleString()], ['Outgoing Amount', stats.outgoing.toLocaleString()]];
  return (
    <div className="glass fade-in w-60 border-cyan-400/30 p-4 shadow-xl shadow-cyan-500/10">
      <div className="mb-2 flex items-center justify-between"><span className="text-sm font-semibold text-cyan-300">Node Details</span>
        <button onClick={onClose} aria-label="Close"><X size={16} className="text-slate-400 hover:text-white" /></button></div>
      <dl className="space-y-1.5 text-sm">
        {rows.map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-slate-400">{k}</dt><dd className="font-medium">{v}</dd></div>)}
      </dl>
    </div>
  );
}
