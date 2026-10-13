import { useMemo, useState } from 'react';
import { Route as RouteIcon } from 'lucide-react';
import Header from './Header';
import TransactionGraph from './TransactionGraph';
import AlgorithmPanel from './AlgorithmPanel';
import { useDataset } from '../data/DatasetContext';
import { addresses } from '../data/mockTransactions';
import { useAlgorithm } from '../data/useAlgorithm';
import { AnalysisOperation, PathResult } from '../types/analysis';
import { NodeState } from '../types/transaction';

export default function PathAnalysis({ operation, title, subtitle }: {
  operation: Extract<AnalysisOperation, 'shortest' | 'dijkstra'>;
  title: string;
  subtitle: string;
}) {
  const { txs } = useDataset();
  const nodes = useMemo(() => addresses(txs), [txs]);
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const source = nodes.includes(selectedSource) ? selectedSource : nodes[0] ?? '';
  const destination = nodes.includes(selectedDestination) ? selectedDestination : nodes[nodes.length - 1] ?? '';
  const { result, loading, error } = useAlgorithm<PathResult>(operation, txs, source, destination);
  const path = result?.found ? result.path : [];
  const states: Record<string, NodeState> = {};
  const edges: string[] = [];
  path.forEach((node, index) => {
    states[node] = 'path';
    if (index) edges.push(`${path[index - 1]}-${node}`);
  });
  const selectAddress = (value: string, onChange: (address: string) => void) => (
    <select className="input" value={value} disabled={!nodes.length} onChange={(event) => onChange(event.target.value)}>
      {nodes.map((node) => <option key={node}>{node}</option>)}
    </select>
  );
  const costLabel = operation === 'shortest' ? 'Transaction Hops' : 'Total Amount';

  return (
    <>
      <Header title={title} subtitle={subtitle}>
        <label className="flex items-center gap-2 text-sm text-slate-400">Source {selectAddress(source, setSelectedSource)}</label>
        <label className="flex items-center gap-2 text-sm text-slate-400">Destination {selectAddress(destination, setSelectedDestination)}</label>
      </Header>
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="glass p-3">
          <TransactionGraph txs={txs} states={states} highlightEdges={edges} edgeColor="#10b981" height="h-[440px]" />
        </div>
        <div className="space-y-4">
          <AlgorithmPanel title="Path Summary" rows={[
            { label: 'Source', value: source || '—' },
            { label: 'Destination', value: destination || '—' },
            { label: 'Path', value: path.length ? path.join(' → ') : '—' },
            { label: costLabel, value: result?.found ? result.cost : '—' },
          ]} />
          {loading && <p className="glass p-4 text-sm text-cyan-300">Running {operation === 'shortest' ? 'breadth-first search' : 'Dijkstra'} in the C++ analyzer…</p>}
          {error && <p role="alert" className="glass p-4 text-sm text-red-300">{error}</p>}
          {!loading && !error && nodes.length === 0 && <p className="glass p-4 text-sm text-slate-400">Add transactions to analyze a path.</p>}
          {!loading && !error && nodes.length > 0 && result && !result.found && (
            <p className="glass p-4 text-sm text-slate-400">No path exists between the selected addresses.</p>
          )}
          {operation === 'shortest' && <p className="glass p-4 text-sm text-slate-400">Fewest-hops paths minimize the number of transactions and ignore transaction amounts.</p>}
          {operation === 'dijkstra' && <p className="glass flex items-center gap-2 p-4 text-sm text-slate-400"><RouteIcon size={16} />Dijkstra minimizes the sum of transaction amounts.</p>}
        </div>
      </div>
    </>
  );
}
