import { ReactNode } from 'react';
export default function AlgorithmPanel({ title, rows }: { title: string; rows: { label: string; value: ReactNode }[] }) {
  return (
    <div className="glass p-4">
      <h3 className="mb-3 text-sm font-semibold text-cyan-300">{title}</h3>
      <dl className="space-y-3 text-sm">
        {rows.map((r) => (
          <div key={r.label}><dt className="mb-1 text-xs uppercase tracking-wide text-slate-400">{r.label}</dt>
            <dd className="min-h-6 font-mono text-slate-100">{r.value}</dd></div>
        ))}
      </dl>
    </div>
  );
}
