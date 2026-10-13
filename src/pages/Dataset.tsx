import { useState } from 'react';
import { Database, Plus, Trash } from 'lucide-react';
import Header from '../components/Header';
import TransactionTable from '../components/TransactionTable';
import { useDataset } from '../data/DatasetContext';

export default function Dataset() {
  const { txs, load, clear, add, remove } = useDataset();
  const [s, setS] = useState(''), [r, setR] = useState(''), [a, setA] = useState(''), [open, setOpen] = useState(false);
  const submit = () => { if (s && r && +a > 0) { add(s, r, +a); setS(''); setR(''); setA(''); setOpen(false); } };
  return (
    <>
      <Header title="Transaction Dataset" subtitle="Manage the in-browser transaction data (no upload, no backend).">
        <button className="btn" onClick={load}><Database size={16} />Load Sample Dataset</button>
        <button className="btn btn-ghost" onClick={() => setOpen((o) => !o)}><Plus size={16} />Add Transaction</button>
        <button className="btn btn-ghost" onClick={clear}><Trash size={16} />Clear Dataset</button>
      </Header>
      {open && (
        <div className="glass fade-in flex flex-wrap items-center gap-3 p-4">
          <input className="input w-28" placeholder="Sender" value={s} onChange={(e) => setS(e.target.value)} />
          <input className="input w-28" placeholder="Receiver" value={r} onChange={(e) => setR(e.target.value)} />
          <input className="input w-28" type="number" placeholder="Amount" value={a} onChange={(e) => setA(e.target.value)} />
          <button className="btn" onClick={submit}>Add</button>
        </div>
      )}
      <TransactionTable txs={txs} onDelete={remove} />
    </>
  );
}
