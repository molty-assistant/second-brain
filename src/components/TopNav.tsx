'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links: Array<{ href: string; label: string }> = [
  { href: '/', label: 'Dashboard' },
  { href: '/tasks', label: 'Tasks' },
  { href: '/content', label: 'Content' },
  { href: '/projects', label: 'Projects' },
  { href: '/documents', label: 'Documents' },
  { href: '/journal', label: 'Journal' },
  { href: '/decisions', label: 'Decisions' },
  // New pages
  { href: '/activity', label: 'Activity Feed' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/work-orders', label: 'Work Orders' },
  { href: '/search', label: 'Search' },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="h-14 sticky top-0 z-40 border-b border-slate-800/80 bg-[#0d1117]/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center gap-2 overflow-x-auto">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={
                'whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors ' +
                (active
                  ? 'bg-slate-800/60 text-slate-100 border border-slate-700/60'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/30')
              }
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
