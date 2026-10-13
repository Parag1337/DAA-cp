import { useMemo, useState } from 'react';
import { ArrowDownUp, Search, Trash2 } from 'lucide-react';
import { Tx } from '../types/transaction';

export default function TransactionTable({ txs, onDelete }: { txs: Tx[]; onDelete: (id: string) => void }) {
  const [q, setQ] = useState(''), [min, setMin] = useState(0);
  const [key, setKey] = useState<'sender' | 'receiver' | 'amount'>('amount'), [asc, setAsc] = useState(false);
  const rows = useMemo(() => txs.filter((t) => t.amount >= min && `${t.sender}${t.receiver}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (a[key] > b[key] ? 1 : -1) * (asc ? 1 : -1)), [txs, q, min, key, asc]);
  const th = (k: typeof key, label: string) => (
    <th className="cursor-pointer px-4 py-3 text-left" onClick={() => { setAsc(key === k ? !asc : true); setKey(k); }}>
      <span className="inline-flex items-center gap-1">{label}<ArrowDownUp size={12} className={key === k ? 'text-cyan-300' : 'opacity-40'} /></span></th>
  );
  return (
    <div className="glass overflow-hidden">
      <div className="flex flex-wrap gap-3 border-b border-white/10 p-4">
        <div className="relative"><Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input className="input pl-9" placeholder="Search address" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <label className="flex items-center gap-2 text-sm text-slate-400">Min amount
          <input type="number" className="input w-28" value={min} onChange={(e) => setMin(+e.target.value)} /></label>
        <span className="ml-auto self-center text-xs text-slate-400">{rows.length} transactions</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-xs uppercase text-slate-400"><tr>{th('sender', 'Sender')}{th('receiver', 'Receiver')}{th('amount', 'Amount')}<th className="px-4 py-3" /></tr></thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="border-t border-white/5 hover:bg-white/5">
                <td className="px-4 py-2.5 font-mono text-cyan-300">{t.sender}</td><td className="px-4 py-2.5 font-mono text-purple-300">{t.receiver}</td>
                <td className="px-4 py-2.5">{t.amount.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right"><button onClick={() => onDelete(t.id)} aria-label="Delete"><Trash2 size={15} className="text-slate-500 hover:text-rose-400" /></button></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={4} className="p-8 text-center text-slate-500">No transactions. Load the sample dataset or add one.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
