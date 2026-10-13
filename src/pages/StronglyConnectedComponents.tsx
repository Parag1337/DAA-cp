import { useMemo, useState } from 'react';
import Header from '../components/Header';
import TransactionGraph from '../components/TransactionGraph';
import { useDataset } from '../data/DatasetContext';
import { useAlgorithm } from '../data/useAlgorithm';
import { SccResult } from '../types/analysis';
import { NodeState } from '../types/transaction';

export default function StronglyConnectedComponents() {
  const { txs } = useDataset();
  const { result, loading, error } = useAlgorithm<SccResult>('scc', txs);
  const components = result?.components ?? [];
  const [selected, setSelected] = useState<number | null>(null);
  const selectedNodes = selected === null ? [] : components[selected] ?? [];
  const states = useMemo(() => Object.fromEntries(selectedNodes.map((node) => [node, 'highlighted' as NodeState])), [selectedNodes]);
  const cyclicComponents = components.filter((component) => component.length > 1).length;

  return (
    <>
      <Header title="Strongly Connected Components" subtitle="Explore groups where every address can reach every other address." />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass p-4"><p className="text-xs uppercase text-slate-400">Components</p><p className="mt-1 text-2xl font-semibold">{components.length}</p></div>
        <div className="glass p-4"><p className="text-xs uppercase text-slate-400">Multi-address groups</p><p className="mt-1 text-2xl font-semibold text-cyan-300">{cyclicComponents}</p></div>
        <div className="glass p-4"><p className="text-xs uppercase text-slate-400">Addresses</p><p className="mt-1 text-2xl font-semibold">{components.reduce((sum, component) => sum + component.length, 0)}</p></div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="glass p-3"><TransactionGraph txs={txs} states={states} height="h-[460px]" /></div>
        <section className="glass max-h-[480px] overflow-y-auto p-4">
          <h2 className="mb-3 font-semibold text-cyan-300">Kosaraju's Algorithm</h2>
          {loading && <p className="text-sm text-cyan-300">Finding components in the C++ analyzer…</p>}
          {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
          {!loading && !error && components.length === 0 && <p className="text-sm text-slate-400">No addresses in the current dataset.</p>}
          <div className="space-y-2">
            {components.map((component, index) => (
              <button key={`${component.join('-')}-${index}`} onClick={() => setSelected(selected === index ? null : index)}
                className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${selected === index ? 'border-cyan-400/50 bg-cyan-500/10' : 'border-white/10 bg-white/[.03] hover:bg-white/[.06]'}`}>
                <span className="text-xs text-slate-400">Component {index + 1}{component.length > 1 ? ` · ${component.length} mutually reachable addresses` : ' · single-address component'}</span>
                <span className="mt-1 block break-words font-mono">{component.join(' · ')}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
