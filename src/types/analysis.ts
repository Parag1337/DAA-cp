import { Tx } from './transaction';

export type AnalysisOperation = 'stats' | 'bfs' | 'dfs' | 'shortest' | 'dijkstra' | 'allPaths' | 'cycles' | 'scc';

export interface GraphStats {
  addresses: number;
  transactions: number;
  totalVolume: number;
  averageTransaction: number;
  maxAmount: number;
  maxFrom: string;
  maxTo: string;
  density: number;
  sourceAddresses: number;
  sinkAddresses: number;
}

export interface GraphStatisticsResponse {
  operation: 'stats';
  statistics: GraphStats;
  addresses: AddrAnalysis[];
}

export interface AddrAnalysis {
  address: string;
  inDeg: number;
  outDeg: number;
  incoming: number;
  outgoing: number;
  total: number;
}

export interface PathResult {
  operation?: 'shortest' | 'dijkstra';
  found: boolean;
  path: string[];
  cost: number;
}

export interface AllPathsResult {
  operation: 'allPaths';
  paths: Omit<PathResult, 'operation'>[];
  truncated: boolean;
  limit: number;
}

export interface TraversalResult {
  operation: string;
  start: string;
  order: string[];
}

export interface CycleResult {
  operation: string;
  cycles: string[][];
}

export interface SccResult {
  operation: string;
  components: string[][];
}

export type AnalysisResult = GraphStatisticsResponse | TraversalResult | PathResult | AllPathsResult | CycleResult | SccResult;

export interface AnalyzeRequest {
  operation: AnalysisOperation;
  transactions: Tx[];
  source?: string;
  destination?: string;
}
