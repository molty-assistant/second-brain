import Link from 'next/link';

export default function ConvexSetupNotice() {
  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <h2 className="mb-2 text-lg font-semibold text-[#e6edf3]">Convex not configured</h2>
      <p className="mb-5 text-sm text-[#8b949e]">
        Mission Control v2 pages require Convex. Set{' '}
        <code className="rounded bg-[#0d1117] px-1.5 py-0.5 text-xs text-[#e6edf3]">
          NEXT_PUBLIC_CONVEX_URL
        </code>{' '}
        in <code className="text-[#e6edf3]">.env.local</code> to enable these pages.
      </p>
      <Link
        href="/doc/documents/convex-setup"
        className="inline-flex items-center rounded-md border border-[#238636] bg-[#238636] px-3.5 py-2 text-sm font-medium text-white transition-colors hover:border-[#2ea043] hover:bg-[#2ea043]"
      >
        Open Convex setup guide
      </Link>
    </div>
  );
}
