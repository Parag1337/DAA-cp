import { useState } from 'react';
import { Maximize, RotateCcw } from 'lucide-react';
import Header from '../components/Header';
import TransactionGraph from '../components/TransactionGraph';
import NodeDetails from '../components/NodeDetails';
import { useDataset } from '../data/DatasetContext';
import { useAlgorithm } from '../data/useAlgorithm';
import { GraphStatisticsResponse } from '../types/analysis';
import { NodeState } from '../types/transaction';

const legend: [NodeState, string, string][] = [['normal', 'Normal', 'bg-slate-700'], ['selected', 'Selected', 'bg-cyan-400'], ['highlighted', 'Highlighted', 'bg-purple-500'], ['cycle', 'Cycle', 'bg-rose-500'], ['path', 'Path', 'bg-emerald-500']];

export default function TransactionGraphPage() {
  const { txs } = useDataset();
  const { result } = useAlgorithm<GraphStatisticsResponse>('stats', txs);
  const [search, setSearch] = useState(''), [min, setMin] = useState(0), [weights, setWeights] = useState(true);
  const [sel, setSel] = useState<string | null>(null), [fit, setFit] = useState(0);
  const reset = () => { setSearch(''); setMin(0); setWeights(true); setSel(null); setFit((f) => f + 1); };
  return (
    <>
      <Header title="Transaction Graph" subtitle="Interactive visualization of the transaction network." />
      <div className="glass flex flex-wrap items-center gap-3 p-4">
        <input className="input" placeholder="Search Address" value={search} onChange={(e) => setSearch(e.target.value)} />
        <label className="flex items-center gap-2 text-sm text-slate-400">Min Amount<input type="number" className="input w-24" value={min} onChange={(e) => setMin(+e.target.value)} /></label>
        <label className="flex items-center gap-2 text-sm text-slate-400"><input type="checkbox" checked={weights} onChange={(e) => setWeights(e.target.checked)} />Show Edge Weights</label>
        <button className="btn btn-ghost" onClick={reset}><RotateCcw size={16} />Reset Graph</button>
        <button className="btn btn-ghost" onClick={() => setFit((f) => f + 1)}><Maximize size={16} />Fit Graph</button>
      </div>
      <div className="glass relative p-3">
        <TransactionGraph txs={txs} search={search} minAmount={min} showWeights={weights} fitTrigger={fit} height="h-[60vh] min-h-[380px]"
          states={sel ? { [sel]: 'selected' } : {}} onNodeClick={setSel} />
        {sel && <div className="absolute right-5 top-5 z-10"><NodeDetails stats={result?.addresses.find((s) => s.address === sel)} onClose={() => setSel(null)} /></div>}
        <div className="absolute bottom-5 left-16 z-10 flex flex-wrap gap-3 rounded-lg bg-slate-950/70 px-3 py-2 text-xs">
          {legend.map(([k, l, c]) => <span key={k} className="flex items-center gap-1.5"><i className={`h-3 w-3 rounded-full ${c}`} />{l}</span>)}
        </div>
      </div>
    </>
  );
}
