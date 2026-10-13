import { createContext, useContext, useState, ReactNode } from 'react';
import { Tx } from '../types/transaction';
import { transactions } from './mockTransactions';

interface Ctx { txs: Tx[]; load: () => void; clear: () => void; add: (s: string, r: string, a: number) => void; remove: (id: string) => void }
const C = createContext<Ctx>(null as unknown as Ctx);
export const useDataset = () => useContext(C);

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [txs, setTxs] = useState<Tx[]>(transactions);
  const value: Ctx = {
    txs,
    load: () => setTxs(transactions),
    clear: () => setTxs([]),
    add: (sender, receiver, amount) => setTxs((p) => [...p, { id: `t${Date.now()}`, sender: sender.toUpperCase(), receiver: receiver.toUpperCase(), amount }]),
    remove: (id) => setTxs((p) => p.filter((t) => t.id !== id)),
  };
  return <C.Provider value={value}>{children}</C.Provider>;
}
