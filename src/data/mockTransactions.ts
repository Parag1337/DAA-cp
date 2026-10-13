import { AddrStats, Step, Tx } from '../types/transaction';

export const transactions: Tx[] = [
  { sender: 'A', receiver: 'B', amount: 500 },
  { sender: 'A', receiver: 'C', amount: 200 },
  { sender: 'B', receiver: 'C', amount: 100 },
  { sender: 'C', receiver: 'D', amount: 300 },
  { sender: 'D', receiver: 'E', amount: 150 },
  { sender: 'E', receiver: 'F', amount: 100 },
  { sender: 'F', receiver: 'D', amount: 50 },
].map((t, i) => ({ ...t, id: `t${i + 1}` }));

// Predefined mock results (swap for backend responses later)
export const MOCK_CYCLES = [['D', 'E', 'F', 'D']];
export const MOCK_PATH = { source: 'A', destination: 'F', path: ['A', 'C', 'D', 'E', 'F'], cost: 750 };
export const DASHBOARD_STATS = { addresses: 25, transactions: 83, amount: 1250000, cycles: 4, maxIn: 'B09', maxOut: 'A17' };

const POS: Record<string, [number, number]> = { A: [0, 130], B: [190, 10], C: [190, 250], D: [400, 130], E: [610, 10], F: [610, 250] };
export const positionFor = (id: string, i: number, n: number) => {
  if (POS[id]) return { x: POS[id][0], y: POS[id][1] };
  const a = (2 * Math.PI * i) / Math.max(n, 1);
  return { x: 300 + 260 * Math.cos(a), y: 130 + 180 * Math.sin(a) };
};

export const addresses = (txs: Tx[]) => [...new Set(txs.flatMap((t) => [t.sender, t.receiver]))].sort();

export function computeStats(txs: Tx[]): AddrStats[] {
  return addresses(txs).map((address) => {
    const out = txs.filter((t) => t.sender === address), inc = txs.filter((t) => t.receiver === address);
    return { address, inDeg: inc.length, outDeg: out.length,
      incoming: inc.reduce((s, t) => s + t.amount, 0), outgoing: out.reduce((s, t) => s + t.amount, 0), total: inc.length + out.length };
  });
}

// Frontend-only traversal simulation used to drive the animation (replace with backend steps later).
export function simulate(kind: 'bfs' | 'dfs', src: string, txs: Tx[]) {
  const adj = (n: string) => txs.filter((t) => t.sender === n).map((t) => t.receiver);
  const steps: Step[] = [], visited: string[] = [], depth: Record<string, number> = { [src]: 0 };
  const seen = new Set<string>();
  if (kind === 'bfs') {
    const q = [src]; seen.add(src);
    while (q.length) {
      const cur = q.shift()!; visited.push(cur);
      adj(cur).forEach((n) => { if (!seen.has(n)) { seen.add(n); depth[n] = depth[cur] + 1; q.push(n); } });
      steps.push({ current: cur, visited: [...visited], frontier: [...q] });
    }
  } else {
    const st = [src];
    while (st.length) {
      const cur = st.pop()!; if (seen.has(cur)) continue;
      seen.add(cur); visited.push(cur);
      [...adj(cur)].reverse().forEach((n) => { if (!seen.has(n)) st.push(n); });
      steps.push({ current: cur, visited: [...visited], frontier: [...st] });
    }
  }
  return { steps, depth };
}
