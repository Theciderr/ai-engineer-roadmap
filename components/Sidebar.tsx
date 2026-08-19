'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/', label: 'Overview', code: '01' },
  { href: '/tasks', label: 'Daily tasks', code: '02' },
  { href: '/plan', label: '16-week plan', code: '03' },
  { href: '/skills', label: 'Skills matrix', code: '04' },
  { href: '/jobs', label: 'Job pipeline', code: '05' },
  { href: '/market', label: 'Market evidence', code: '06' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-60 md:min-h-screen border-b md:border-b-0 md:border-r border-rail bg-panel/60 md:sticky md:top-0">
      <div className="px-5 py-6">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber">
          Mission Control
        </div>
        <div className="mt-1 text-sm text-slate-dim leading-snug">
          AI Engineer / 16-week sprint
        </div>
      </div>
      <nav className="px-3 pb-6 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors ${
                active
                  ? 'bg-rail text-slate-bright'
                  : 'text-slate-dim hover:text-slate-bright hover:bg-rail/50'
              }`}
            >
              <span className="font-mono text-[10px] text-amber-dim">{item.code}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
