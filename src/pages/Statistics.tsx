import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Coins, Network, ArrowLeftRight, TrendingUp, Trophy, RefreshCcw } from 'lucide-react';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import { useDataset } from '../data/DatasetContext';
import { useAlgorithm } from '../data/useAlgorithm';
import { CycleResult, GraphStatisticsResponse } from '../types/analysis';

const tip = { contentStyle: { background: '#0f172a', border: '1px solid #334155', borderRadius: 8 } };
const axis = { stroke: '#64748b', fontSize: 12 };
const colors = ['#3b82f6', '#22d3ee', '#a855f7', '#6366f1', '#14b8a6', '#8b5cf6'];

export default function Statistics() {
  const { txs } = useDataset();
  const { result, loading, error } = useAlgorithm<GraphStatisticsResponse>('stats', txs);
  const { result: cycleResult } = useAlgorithm<CycleResult>('cycles', txs);
  const stats = useMemo(() => result?.addresses ?? [], [result]);
  const total = result?.statistics.totalVolume ?? 0;
  const ranges: [string, number, number][] = [['0-100', 0, 100], ['101-200', 101, 200], ['201-300', 201, 300], ['301+', 301, Infinity]];
  const dist = ranges.map(([range, lo, hi]) => ({ range, count: txs.filter((t) => t.amount >= lo && t.amount <= hi).length }));
  const connected = [...stats].sort((a, b) => b.total - a.total);
  return (
    <>
      <Header title="Statistics" subtitle="Visual analytics for the current transaction dataset." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Addresses" value={stats.length} icon={Network} />
        <StatCard label="Total Transactions" value={result?.statistics.transactions ?? txs.length} icon={ArrowLeftRight} accent="cyan" />
        <StatCard label="Total Amount" value={total.toLocaleString()} icon={Coins} accent="purple" />
        <StatCard label="Average Transaction" value={result?.statistics.averageTransaction ?? 0} icon={TrendingUp} />
        <StatCard label="Highest Transaction" value={result?.statistics.maxAmount ?? 0} icon={Trophy} accent="cyan" />
        <StatCard label="Cycles Detected" value={cycleResult?.cycles.length ?? 0} icon={RefreshCcw} accent="purple" />
      </div>
      {loading && <p className="glass p-4 text-sm text-cyan-300">Running C++ statistics analysis…</p>}
      {error && <p className="glass p-4 text-sm text-red-300">{error}</p>}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Transaction Amount Distribution">
          <ResponsiveContainer><BarChart data={dist}><CartesianGrid stroke="#1e293b" /><XAxis dataKey="range" {...axis} /><YAxis allowDecimals={false} {...axis} /><Tooltip {...tip} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>{dist.map((_, i) => <Cell key={i} fill={colors[i]} />)}</Bar></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="In-Degree vs Out-Degree">
          <ResponsiveContainer><BarChart data={stats}><CartesianGrid stroke="#1e293b" /><XAxis dataKey="address" {...axis} /><YAxis allowDecimals={false} {...axis} /><Tooltip {...tip} /><Legend />
            <Bar dataKey="inDeg" name="In" fill="#22d3ee" radius={[4, 4, 0, 0]} /><Bar dataKey="outDeg" name="Out" fill="#a855f7" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Most Connected Addresses">
          <ResponsiveContainer><BarChart data={connected} layout="vertical"><CartesianGrid stroke="#1e293b" /><XAxis type="number" allowDecimals={false} {...axis} /><YAxis type="category" dataKey="address" {...axis} /><Tooltip {...tip} />
            <Bar dataKey="total" name="Connections" fill="#3b82f6" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Transaction Count">
          <ResponsiveContainer><BarChart data={stats}><CartesianGrid stroke="#1e293b" /><XAxis dataKey="address" {...axis} /><YAxis allowDecimals={false} {...axis} /><Tooltip {...tip} />
            <Bar dataKey="total" name="Transactions" radius={[6, 6, 0, 0]}>{stats.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Bar></BarChart></ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );
}
