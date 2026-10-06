'use client';

import { useState, useEffect, useRef } from 'react';
import { logInteraction } from '@/lib/tracking';

interface AudioPlayerProps {
  audioSrc?: string;
  stepId: string;
  locale: string;
  transcriptText?: string;
  className?: string;
}

export default function AudioPlayer({
  audioSrc,
  stepId,
  locale,
  transcriptText = '',
  className = '',
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptPopoverRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);

  // Reset state when source changes
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setShowTranscript(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      if (audioSrc) audioRef.current.load();
    }
  }, [audioSrc]);

  // Close transcript when clicking outside
  useEffect(() => {
    if (!showTranscript) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        transcriptPopoverRef.current &&
        !transcriptPopoverRef.current.contains(e.target as Node)
      ) {
        setShowTranscript(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTranscript]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      logInteraction(
        'AUDIO_PAUSE',
        { stepId, currentTime: audioRef.current.currentTime },
        '/intervention/flow'
      ).catch(() => {});
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      logInteraction(
        'AUDIO_PLAY',
        { stepId, currentTime: audioRef.current.currentTime },
        '/intervention/flow'
      ).catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setProgress(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    logInteraction('AUDIO_COMPLETE', { stepId }, '/intervention/flow').catch(() => {});
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // If there is no pre-recorded audio file, do not render player
  if (!audioSrc) return null;

  return (
    <div
      className={`relative inline-flex items-center gap-1.5 sm:gap-2 ${className}`}
      aria-label={
        locale === 'es'
          ? 'Controles de narración de audio y transcripción'
          : 'Audio narration and transcript controls'
      }
    >
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* 1. On-Page Audio Play / Pause Icon Button */}
      <button
        type="button"
        onClick={togglePlayPause}
        aria-pressed={isPlaying}
        title={
          isPlaying
            ? locale === 'es'
              ? 'Pausar narración de audio'
              : 'Pause audio narration'
            : locale === 'es'
            ? 'Reproducir narración de audio'
            : 'Play audio narration'
        }
        aria-label={
          isPlaying
            ? locale === 'es'
              ? 'Pausar audio'
              : 'Pause audio'
            : locale === 'es'
            ? 'Reproducir audio'
            : 'Play audio'
        }
        className={`relative inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a] active:scale-95 ${
          isPlaying
            ? 'bg-[#236f7a] text-white border-[#1b5861] shadow-sm animate-pulse'
            : 'bg-white hover:bg-slate-50 text-[#1f5c66] border-slate-300 shadow-2xs'
        }`}
      >
        {isPlaying ? (
          // Speaker / Pause Waves Icon
          <svg
            className="w-4 h-4 fill-current"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M6 19h4l5 5V0L10 5H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2zm11.5-7c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM15 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        ) : (
          // Speaker with Play Triangle Icon
          <svg
            className="w-4 h-4 fill-current ml-0.5"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        )}
      </button>

      {/* 2. On-Page Audio Transcript Icon Button */}
      <div className="relative" ref={transcriptPopoverRef}>
        <button
          type="button"
          onClick={() => setShowTranscript(!showTranscript)}
          aria-expanded={showTranscript}
          aria-controls="audio-transcript-popover"
          title={
            locale === 'es'
              ? 'Ver transcripción del audio'
              : 'View audio transcript'
          }
          aria-label={
            locale === 'es'
              ? showTranscript
                ? 'Cerrar transcripción'
                : 'Transcripción de audio'
              : showTranscript
              ? 'Close transcript'
              : 'Audio transcript'
          }
          className={`inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a] active:scale-95 ${
            showTranscript
              ? 'bg-[#236f7a] text-white border-[#1b5861] shadow-sm'
              : 'bg-white hover:bg-slate-50 text-[#1f5c66] border-slate-300 shadow-2xs'
          }`}
        >
          {/* Transcript / Closed Caption Icon */}
          <svg
            className="w-4 h-4 fill-none stroke-current"
            viewBox="0 0 24 24"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <line x1="8" y1="9" x2="16" y2="9" />
            <line x1="8" y1="13" x2="14" y2="13" />
          </svg>
        </button>

        {/* Captions / Transcript Dropdown Popover */}
        {showTranscript && (
          <div
            id="audio-transcript-popover"
            role="region"
            aria-label={locale === 'es' ? 'Transcripción de audio' : 'Audio transcript'}
            className="absolute right-0 top-full mt-2 w-72 sm:w-80 max-h-60 overflow-y-auto z-50 bg-white/98 backdrop-blur-md border border-slate-300 text-slate-800 p-3.5 rounded-2xl shadow-xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#236f7a]" aria-hidden="true"></span>
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                  {locale === 'es' ? 'Transcripción de Audio' : 'Audio Transcript'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTranscript(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer focus:outline-none"
                aria-label={locale === 'es' ? 'Cerrar transcripción' : 'Close transcript'}
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium select-text whitespace-pre-line">
              {transcriptText ||
                (locale === 'es'
                  ? 'Transcripción de la grabación de audio.'
                  : 'Recorded audio transcript.')}
            </p>
            {duration > 0 && (
              <div className="text-[10px] text-slate-400 font-mono text-right pt-1 border-t border-slate-100">
                {formatTime(progress)} / {formatTime(duration)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Screen Reader status message */}
      <div role="status" aria-live="polite" className="sr-only">
        {isPlaying
          ? locale === 'es'
            ? 'Reproduciendo audio'
            : 'Playing audio'
          : ''}
      </div>
    </div>
  );
}
