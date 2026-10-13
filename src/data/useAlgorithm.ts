import { useEffect, useState } from 'react';
import { analyze } from './algorithmApi';
import { AnalysisOperation, AnalysisResult } from '../types/analysis';
import { Tx } from '../types/transaction';

export function useAlgorithm<T extends AnalysisResult>(operation: AnalysisOperation, transactions: Tx[], source?: string, destination?: string) {
  const [result, setResult] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    analyze({ operation, transactions, source, destination })
      .then((data) => { if (!cancelled) setResult(data as T); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Analysis failed'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [operation, source, destination, transactions]);

  return { result, loading, error };
}
