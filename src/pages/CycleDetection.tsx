import { useState } from 'react';
import { Info, ScanSearch } from 'lucide-react';
import Header from '../components/Header';
import TransactionGraph from '../components/TransactionGraph';
import { useDataset } from '../data/DatasetContext';
import { useAlgorithm } from '../data/useAlgorithm';
import { CycleResult } from '../types/analysis';
import { NodeState } from '../types/transaction';

export default function CycleDetection() {
  const { txs } = useDataset();
  const [found, setFound] = useState(false);
  const { result, loading, error } = useAlgorithm<CycleResult>('cycles', txs);
  const cycles = result?.cycles ?? [];
  const states: Record<string, NodeState> = {};
  const edges: string[] = [];
  cycles.forEach((cycle) => {
    cycle.forEach((node, index) => {
      states[node] = 'cycle';
      if (index) edges.push(`${cycle[index - 1]}-${node}`);
    });
    if (cycle.length) edges.push(`${cycle[cycle.length - 1]}-${cycle[0]}`);
  });
  return (
    <>
      <Header title="Cycle Detection" subtitle="Identify cyclic patterns in the transaction graph.">
        <button className="btn" onClick={() => setFound(true)}><ScanSearch size={16} />Detect Cycles</button>
      </Header>
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="glass p-3"><TransactionGraph txs={txs} states={states} highlightEdges={edges} edgeColor="#f43f5e" height="h-[440px]" /></div>
        <div className="space-y-4">
          <div className="glass p-4">
            <h3 className="mb-3 text-sm font-semibold text-cyan-300">Result</h3>
            {found ? (
              <div className="fade-in space-y-3">
                {cycles.length ? (
                  <>
                    <div className="text-rose-300">Cycle Detected</div>
                    <div className="text-sm">Cycles Found: <b>{cycles.length}</b></div>
                    {cycles.map((c, i) => <div key={i} className="rounded-lg border border-rose-400/30 bg-rose-500/10 p-3 text-sm">Cycle #{i + 1}<div className="mt-1 font-mono">{[...c, c[0]].join(' → ')}</div></div>)}
                  </>
                ) : <div className="text-sm text-slate-400">No cycles detected.</div>}
              </div>
            ) : <p className="text-sm text-slate-400">Click “Detect Cycles” to run the analysis.</p>}
            {loading && <p className="text-sm text-cyan-300">Running cycle detection…</p>}
            {error && <p className="text-sm text-red-300">{error}</p>}
          </div>
          <div className="glass flex gap-3 p-4 text-sm text-slate-300"><Info size={18} className="mt-0.5 shrink-0 text-cyan-300" />
            Detected cycles represent graph patterns and should not automatically be interpreted as fraudulent activity.</div>
        </div>
      </div>
    </>
  );
}
