import Link from 'next/link';

export default function NotFound() {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="h-screen w-screen flex flex-col items-center justify-between py-8 px-4 font-sans text-[#2d3748] bg-[#f4f8e8] select-none" suppressHydrationWarning>
        <div className="flex-1 flex flex-col justify-center max-w-md w-full space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-[#35727f] font-display">
              PEN-PAL
            </h1>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#35727f] bg-white/90 border border-slate-200/80 px-3.5 py-1 rounded-full inline-block shadow-2xs">
              Page Not Found
            </span>
          </div>

          <div className="bg-white/95 border border-slate-200/90 rounded-3xl shadow-sm p-7 space-y-4">
            <div className="w-12 h-12 bg-[#f4f8e8] text-[#35727f] rounded-2xl flex items-center justify-center mx-auto border border-slate-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-slate-800">404 — Invalid Study Page</h2>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              The study page or gateway link you requested does not exist or has moved.
            </p>
            <div className="pt-2">
              <Link
                href="/en/intervention"
                className="w-full h-10 bg-[#96b8b3] hover:bg-[#85a7a2] text-[#1e3a3a] font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-sm flex items-center justify-center"
              >
                Return to Study Access Gateway →
              </Link>
            </div>
          </div>
        </div>

        <p className="text-[9px] text-slate-400 font-normal">
          © {new Date().getFullYear()} PEN-PAL Study. Access restricted to authorized study participants.
        </p>
      </body>
    </html>
  );
}
