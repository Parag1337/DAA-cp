import { useEffect, useMemo } from 'react';
import { ReactFlow, ReactFlowProvider, Background, Controls, Handle, Position, MarkerType, useReactFlow, type Node, type Edge, type NodeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { NodeState, Tx } from '../types/transaction';
import { addresses, positionFor } from '../data/mockTransactions';

const nodeStyle: Record<NodeState, string> = {
  normal: 'bg-slate-800 border-blue-400/60 text-blue-100',
  selected: 'bg-cyan-500 border-white text-slate-950 scale-110 shadow-[0_0_22px_#22d3ee]',
  highlighted: 'bg-purple-600/80 border-purple-300 text-white shadow-[0_0_16px_#a855f7]',
  cycle: 'bg-rose-600/80 border-rose-300 text-white shadow-[0_0_18px_#f43f5e]',
  path: 'bg-emerald-500 border-emerald-200 text-slate-950 shadow-[0_0_18px_#10b981]',
  visited: 'bg-blue-600 border-blue-300 text-white',
  current: 'bg-amber-400 border-white text-slate-950 scale-125 shadow-[0_0_24px_#fbbf24]',
};

function AddrNode({ data }: NodeProps) {
  const d = data as { label: string; state: NodeState };
  return (
    <div className={`grid h-12 w-12 cursor-pointer place-items-center rounded-full border-2 text-sm font-semibold transition-all duration-300 ${nodeStyle[d.state]}`}>
      <Handle type="target" position={Position.Left} className="!opacity-0" />{d.label}<Handle type="source" position={Position.Right} className="!opacity-0" />
    </div>
  );
}
const nodeTypes = { addr: AddrNode };

export interface GraphProps {
  txs: Tx[]; states?: Record<string, NodeState>; highlightEdges?: string[]; edgeColor?: string; showWeights?: boolean;
  minAmount?: number; search?: string; onNodeClick?: (id: string) => void; height?: string; fitTrigger?: number;
}

function Graph({ txs, states = {}, highlightEdges = [], edgeColor = '#22d3ee', showWeights = true, minAmount = 0, search = '', onNodeClick, fitTrigger = 0 }: GraphProps) {
  const { fitView } = useReactFlow();
  const ids = useMemo(() => addresses(txs), [txs]);
  const nodes: Node[] = useMemo(() => ids.map((id, i) => {
    const match = search && id.toLowerCase().includes(search.toLowerCase());
    return { id, type: 'addr', position: positionFor(id, i, ids.length), data: { label: id, state: states[id] ?? (match ? 'highlighted' : 'normal') } };
  }), [ids, states, search]);
  const edges: Edge[] = useMemo(() => txs.filter((t) => t.amount >= minAmount).map((t) => {
    const hl = highlightEdges.includes(`${t.sender}-${t.receiver}`), color = hl ? edgeColor : '#475d8a';
    return { id: t.id, source: t.sender, target: t.receiver, animated: hl, label: showWeights ? String(t.amount) : undefined,
      markerEnd: { type: MarkerType.ArrowClosed, color }, style: { stroke: color, strokeWidth: hl ? 3 : 1.5 },
      labelStyle: { fill: '#e2e8f0', fontSize: 12 }, labelBgStyle: { fill: '#0f172a' }, labelBgPadding: [4, 2] as [number, number] };
  }), [txs, highlightEdges, edgeColor, showWeights, minAmount]);

  useEffect(() => { fitView({ duration: 400, padding: 0.2 }); }, [fitTrigger, ids.length, fitView]);
  return (
    <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView proOptions={{ hideAttribution: true }}
      nodesConnectable={false} onNodeClick={(_, n) => onNodeClick?.(n.id)} minZoom={0.3}>
      <Background color="#1e2a4a" gap={22} /><Controls showInteractive={false} />
    </ReactFlow>
  );
}

export default function TransactionGraph({ height = 'h-[420px]', ...props }: GraphProps) {
  return <div className={`${height} w-full overflow-hidden rounded-xl`}><ReactFlowProvider><Graph {...props} /></ReactFlowProvider></div>;
}
