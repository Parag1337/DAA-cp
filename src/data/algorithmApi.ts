import { AnalysisOperation, AnalyzeRequest, AnalysisResult } from '../types/analysis';

const API_BASE = '/api/analyze';

export async function analyze(request: AnalyzeRequest): Promise<AnalysisResult> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'The graph analyzer failed.');
  return body as AnalysisResult;
}

export function isOperation(operation: AnalysisOperation): operation is AnalysisOperation {
  return ['stats', 'bfs', 'dfs', 'shortest', 'dijkstra', 'allPaths', 'cycles', 'scc'].includes(operation);
}
