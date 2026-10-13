import { useMemo, useState } from 'react';
import Header from '../components/Header';
import TransactionGraph from '../components/TransactionGraph';
import { useDataset } from '../data/DatasetContext';
import { addresses } from '../data/mockTransactions';
import { useAlgorithm } from '../data/useAlgorithm';
import { AllPathsResult } from '../types/analysis';
import { NodeState } from '../types/transaction';

export default function AllPaths() {
  const { txs } = useDataset();
  const nodes = useMemo(() => addresses(txs), [txs]);
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const source = nodes.includes(selectedSource) ? selectedSource : nodes[0] ?? '';
  const destination = nodes.includes(selectedDestination) ? selectedDestination : nodes[nodes.length - 1] ?? '';
  const { result, loading, error } = useAlgorithm<AllPathsResult>('allPaths', txs, source, destination);
  const paths = result?.paths ?? [];
  const states: Record<string, NodeState> = {};
  const edges: string[] = [];
  paths.forEach(({ path }) => path.forEach((node, index) => {
    states[node] = 'path';
    if (index) edges.push(`${path[index - 1]}-${node}`);
  }));
  const selectAddress = (value: string, onChange: (address: string) => void) => (
    <select className="input" value={value} disabled={!nodes.length} onChange={(event) => onChange(event.target.value)}>
      {nodes.map((node) => <option key={node}>{node}</option>)}
    </select>
  );

  return (
    <>
      <Header title="All Simple Paths" subtitle="Enumerate simple routes between two addresses, including each route's total amount.">
        <label className="flex items-center gap-2 text-sm text-slate-400">Source {selectAddress(source, setSelectedSource)}</label>
        <label className="flex items-center gap-2 text-sm text-slate-400">Destination {selectAddress(destination, setSelectedDestination)}</label>
      </Header>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="glass p-3">
          <TransactionGraph txs={txs} states={states} highlightEdges={edges} edgeColor="#a855f7" height="h-[460px]" />
        </div>
        <section className="glass max-h-[480px] overflow-y-auto p-4">
          <h2 className="mb-3 font-semibold text-cyan-300">Paths from {source || '—'} to {destination || '—'}</h2>
          {loading && <p className="text-sm text-cyan-300">Enumerating paths in the C++ analyzer…</p>}
          {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
          {!loading && !error && nodes.length === 0 && <p className="text-sm text-slate-400">Add transactions to enumerate paths.</p>}
          {!loading && !error && result && paths.length === 0 && <p className="text-sm text-slate-400">No simple path exists between these addresses.</p>}
          <div className="space-y-3">
            {paths.map(({ path, cost }, index) => (
              <article key={`${path.join('-')}-${index}`} className="rounded-lg border border-purple-400/20 bg-purple-500/5 p-3 text-sm">
                <div className="mb-1 flex justify-between text-xs text-slate-400"><span>Path {index + 1}</span><span>Total amount: {cost.toLocaleString()}</span></div>
                <p className="break-words font-mono">{path.join(' → ')}</p>
              </article>
            ))}
          </div>
          {result?.truncated && <p className="mt-3 text-xs text-amber-300">Showing the first {result.limit} paths. Narrow the dataset to inspect more.</p>}
        </section>
      </div>
    </>
  );
}
