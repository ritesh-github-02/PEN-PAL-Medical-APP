"use client";

export default function Loader({
  fullScreen = false,
}: {
  fullScreen?: boolean;
}) {
  return (
    <div
      className={`${fullScreen ? "fixed inset-0 z-[100] bg-gradient-to-b from-yellow-50 to-amber-50" : "w-full h-64 bg-gradient-to-b from-yellow-50 to-amber-50"} flex flex-col items-center justify-center`}
    >
      <div className="relative flex items-center justify-center">
        {/* Outer Ring */}
        <div className="w-16 h-16 border-[3px] border-teal-100 rounded-full"></div>
        {/* Animated Spin Ring */}
        <div className="absolute w-16 h-16 border-[3px] border-teal-500 rounded-full border-t-transparent animate-spin"></div>
        {/* Inner Pulse Circle */}
        <div className="absolute w-8 h-8 bg-teal-500 rounded-full animate-pulse opacity-30"></div>
      </div>
      <div className="mt-8 flex flex-col items-center gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-teal-600 animate-pulse">
          PEN-PAL
        </p>
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1 h-1 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1 h-1 bg-teal-500 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
