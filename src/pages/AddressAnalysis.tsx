import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import Header from '../components/Header';
import NodeDetails from '../components/NodeDetails';
import { useDataset } from '../data/DatasetContext';
import { useAlgorithm } from '../data/useAlgorithm';
import { AddrAnalysis, GraphStatisticsResponse } from '../types/analysis';

const sorts: [keyof AddrAnalysis, string][] = [['inDeg', 'In-Degree'], ['outDeg', 'Out-Degree'], ['incoming', 'Incoming Amount'], ['outgoing', 'Outgoing Amount']];

export default function AddressAnalysis() {
  const { txs } = useDataset();
  const { result } = useAlgorithm<GraphStatisticsResponse>('stats', txs);
  const [q, setQ] = useState(''), [by, setBy] = useState<keyof AddrAnalysis>('inDeg'), [sel, setSel] = useState<AddrAnalysis>();
  const rows = useMemo(() => (result?.addresses ?? []).filter((s) => s.address.toLowerCase().includes(q.toLowerCase())).sort((a, b) => (b[by] as number) - (a[by] as number)), [result, q, by]);
  return (
    <>
      <Header title="Address Analysis" subtitle="Inspect connectivity and flow for every address." />
      <div className="glass flex flex-wrap gap-3 p-4">
        <div className="relative"><Search size={14} className="absolute left-3 top-3 text-slate-400" /><input className="input pl-9" placeholder="Search Address" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <label className="flex items-center gap-2 text-sm text-slate-400">Sort by
          <select className="input" value={by} onChange={(e) => setBy(e.target.value as keyof AddrAnalysis)}>{sorts.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
      </div>
      <div className="flex flex-wrap items-start gap-6">
        <div className="glass min-w-0 flex-1 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-xs uppercase text-slate-400"><tr>
              {['Address', 'In-Degree', 'Out-Degree', 'Incoming Amount', 'Outgoing Amount', 'Total Connections'].map((h) => <th key={h} className="whitespace-nowrap px-4 py-3 text-left">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.address} onClick={() => setSel(s)} className={`cursor-pointer border-t border-white/5 hover:bg-white/5 ${sel?.address === s.address ? 'bg-cyan-500/10' : ''}`}>
                  <td className="px-4 py-2.5 font-mono text-cyan-300">{s.address}</td><td className="px-4 py-2.5">{s.inDeg}</td><td className="px-4 py-2.5">{s.outDeg}</td>
                  <td className="px-4 py-2.5">{s.incoming.toLocaleString()}</td><td className="px-4 py-2.5">{s.outgoing.toLocaleString()}</td><td className="px-4 py-2.5">{s.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sel && <NodeDetails stats={sel} onClose={() => setSel(undefined)} />}
      </div>
    </>
  );
}
