"use client";

export default function Loader({
  fullScreen = false,
}: {
  fullScreen?: boolean;
}) {
  return (
    <div
      className={`${fullScreen ? "fixed inset-0 z-[100] bg-white/80 backdrop-blur-md" : "w-full h-64"} flex flex-col items-center justify-center`}
    >
      <div className="relative flex items-center justify-center">
        {/* Outer Ring */}
        <div className="w-16 h-16 border-[3px] border-zinc-100 rounded-full"></div>
        {/* Animated Spin Ring */}
        <div className="absolute w-16 h-16 border-[3px] border-zinc-900 rounded-full border-t-transparent animate-spin"></div>
        {/* Inner Pulse Circle */}
        <div className="absolute w-8 h-8 bg-zinc-900 rounded-full animate-pulse opacity-20"></div>
      </div>
      <div className="mt-8 flex flex-col items-center gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-900 animate-pulse">
          PEN-PAL
        </p>
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-zinc-900 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1 h-1 bg-zinc-900 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1 h-1 bg-zinc-900 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
