import { useEffect, useMemo, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import Header from './Header';
import TransactionGraph from './TransactionGraph';
import AlgorithmPanel from './AlgorithmPanel';
import { useDataset } from '../data/DatasetContext';
import { addresses } from '../data/mockTransactions';
import { useAlgorithm } from '../data/useAlgorithm';
import { TraversalResult } from '../types/analysis';
import { NodeState } from '../types/transaction';

const chips = (a: string[]) => a.length ? a.map((x) => <span key={x} className="mr-1.5 inline-block rounded bg-white/10 px-2 py-0.5">{x}</span>) : '—';

export default function TraversalView({ kind, title, subtitle }: { kind: 'bfs' | 'dfs'; title: string; subtitle: string }) {
  const { txs } = useDataset();
  const nodes = useMemo(() => addresses(txs), [txs]);
  const [selectedSource, setSelectedSource] = useState('');
  const src = nodes.includes(selectedSource) ? selectedSource : nodes[0] ?? '';
  const [idx, setIdx] = useState(-1);
  const { result, loading, error } = useAlgorithm<TraversalResult>(kind, txs, src);
  const order = result?.order ?? [];
  useEffect(() => {
    if (idx < 0 || idx >= order.length - 1) return;
    const t = setTimeout(() => setIdx((i) => i + 1), 900);
    return () => clearTimeout(t);
  }, [idx, order]);

  const step = idx >= 0 ? order[idx] : null;
  const done = !!step && idx === order.length - 1;
  const states: Record<string, NodeState> = {};
  if (step) states[step] = 'current';
  const visited = order.slice(0, idx + 1);
  visited.forEach((v) => (states[v] = 'visited'));
  const edges = txs.filter((t) => visited.includes(t.sender) && visited.includes(t.receiver)).map((t) => `${t.sender}-${t.receiver}`);
  const frontier = order.slice(idx + 1);
  const Label = kind === 'bfs' ? 'Queue' : 'Stack';

  return (
    <>
      <Header title={title} subtitle={subtitle}>
        <label className="flex items-center gap-2 text-sm text-slate-400">Source Address
          <select className="input" value={src} disabled={!nodes.length} onChange={(e) => { setSelectedSource(e.target.value); setIdx(-1); }}>{nodes.map((n) => <option key={n}>{n}</option>)}</select></label>
        <button className="btn" disabled={!src} onClick={() => setIdx(0)}><Play size={16} />Run {kind.toUpperCase()}</button>
        <button className="btn btn-ghost" onClick={() => setIdx(-1)}><RotateCcw size={16} />Reset</button>
      </Header>
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="glass p-3"><TransactionGraph txs={txs} states={states} highlightEdges={edges} height="h-[460px]" /></div>
        <div className="space-y-4">
          <AlgorithmPanel title={`Algorithm Execution ${done ? '· Complete' : ''}`} rows={[
            { label: 'Current Node', value: step ?? '—' },
            { label: 'Visited Nodes', value: chips(visited) },
            { label: Label, value: chips(frontier) },
            { label: 'Traversal Order', value: order.join(' → ') },
          ]} />
          {loading && <p className="glass p-4 text-sm text-cyan-300">Running {kind.toUpperCase()} in the C++ analyzer…</p>}
          {error && <p className="glass p-4 text-sm text-red-300">{error}</p>}
        </div>
      </div>
    </>
  );
}
