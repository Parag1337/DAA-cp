import { useState } from 'react';
import { Database, ArrowLeftRight, Coins, RefreshCcw, ArrowDownToLine, ArrowUpFromLine, Network } from 'lucide-react';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import TransactionGraph from '../components/TransactionGraph';
import NodeDetails from '../components/NodeDetails';
import { useDataset } from '../data/DatasetContext';
import { useAlgorithm } from '../data/useAlgorithm';
import { CycleResult, GraphStatisticsResponse } from '../types/analysis';

export default function Dashboard() {
  const { txs, load } = useDataset();
  const { result } = useAlgorithm<GraphStatisticsResponse>('stats', txs);
  const { result: cycleResult } = useAlgorithm<CycleResult>('cycles', txs);
  const [sel, setSel] = useState<string | null>(null);
  const stats = result?.statistics;
  const address = result?.addresses.find((item) => item.address === sel);
  const highestInDegree = result?.addresses.reduce((highest, item) => Math.max(highest, item.inDeg), 0) ?? 0;
  const highestOutDegree = result?.addresses.reduce((highest, item) => Math.max(highest, item.outDeg), 0) ?? 0;
  return (
    <>
      <Header title="Cryptocurrency Transaction Graph Analyzer" subtitle="Analyze transaction networks using graph algorithms.">
        <button className="btn" onClick={() => { load(); setSel(null); }}><Database size={16} />Load Sample Dataset</button>
      </Header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Addresses" value={stats?.addresses ?? 0} icon={Network} accent="blue" />
        <StatCard label="Total Transactions" value={stats?.transactions ?? 0} icon={ArrowLeftRight} accent="cyan" />
        <StatCard label="Total Transaction Amount" value={(stats?.totalVolume ?? 0).toLocaleString()} icon={Coins} accent="purple" />
        <StatCard label="Cycles Detected" value={cycleResult?.cycles.length ?? 0} icon={RefreshCcw} accent="purple" />
        <StatCard label="Highest In-Degree" value={highestInDegree} icon={ArrowDownToLine} accent="blue" />
        <StatCard label="Highest Out-Degree" value={highestOutDegree} icon={ArrowUpFromLine} accent="cyan" />
      </div>
      <div className="glass relative p-4">
        <h2 className="mb-3 font-semibold">Transaction Network</h2>
        <TransactionGraph txs={txs} states={sel ? { [sel]: 'selected' } : {}} onNodeClick={setSel} height="h-[460px]" />
        {sel && <div className="absolute right-6 top-14 z-10"><NodeDetails stats={address} onClose={() => setSel(null)} /></div>}
      </div>
    </>
  );
}
