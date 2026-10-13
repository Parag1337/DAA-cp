export interface Tx { id: string; sender: string; receiver: string; amount: number }
export type NodeState = 'normal' | 'selected' | 'highlighted' | 'cycle' | 'path' | 'visited' | 'current';
export interface AddrStats { address: string; inDeg: number; outDeg: number; incoming: number; outgoing: number; total: number }
export interface Step { current: string; visited: string[]; frontier: string[] }
