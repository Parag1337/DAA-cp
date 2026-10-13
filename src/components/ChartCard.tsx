import { ReactNode } from 'react';
export default function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="glass p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-200">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  );
}
