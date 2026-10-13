import { ReactNode } from 'react';
export default function Header({ title, subtitle, children }: { title: string; subtitle: string; children?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </header>
  );
}
