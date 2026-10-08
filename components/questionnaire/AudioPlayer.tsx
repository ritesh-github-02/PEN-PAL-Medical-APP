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
      ).catch(() => { });
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      logInteraction(
        'AUDIO_PLAY',
        { stepId, currentTime: audioRef.current.currentTime },
        '/intervention/flow'
      ).catch(() => { });
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
    logInteraction('AUDIO_COMPLETE', { stepId }, '/intervention/flow').catch(() => { });
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
      className={`relative inline-flex items-center gap-2 sm:gap-2.5 z-30 ${className}`}
      aria-label={
        locale === 'es'
          ? 'Controles de narración de audio y subtítulos'
          : 'Audio narration and caption controls'
      }
    >
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* 1. CC (Closed Caption / Transcript) Speech Bubble Button */}
      <div className="relative" ref={transcriptPopoverRef}>
        <button
          type="button"
          onClick={() => setShowTranscript(!showTranscript)}
          aria-expanded={showTranscript}
          aria-controls="audio-transcript-popover"
          title={
            locale === 'es'
              ? 'Ver transcripción y subtítulos'
              : 'View captions and transcript'
          }
          aria-label={
            locale === 'es'
              ? showTranscript
                ? 'Cerrar subtítulos'
                : 'Abrir subtítulos'
              : showTranscript
                ? 'Close captions'
                : 'Open captions'
          }
          className={`group relative inline-flex items-center justify-center p-0.5 sm:p-1 rounded-xl transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#13616d] active:scale-90 ${showTranscript ? 'text-[#0c4a54]' : 'text-[#13616d] hover:text-[#0c4a54]'
            }`}
        >
          {/* Custom CC Speech Bubble SVG matching exact UI */}
          <svg
            className="w-10 h-9 sm:w-11 sm:h-10 transition-transform duration-150 group-hover:scale-105"
            viewBox="0 0 42 38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Speech Bubble Outline with rounded corners and downward tail */}
            <path
              d="M 9 5.5 C 5.5 5.5 4 7.2 4 11 V 19.5 C 4 23.2 5.5 25 9 25 H 12.5 C 13.5 25 14.5 25.8 15.2 27 L 17 30 C 17.8 31.2 19.2 31.2 20 30 L 21.8 27 C 22.5 25.8 23.5 25 24.5 25 H 33 C 36.5 25 38 23.2 38 19.5 V 11 C 38 7.2 36.5 5.5 33 5.5 Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* CC Text inside */}
            <text
              x="21"
              y="15.2"
              textAnchor="middle"
              dominantBaseline="central"
              fill="currentColor"
              fontSize="13"
              fontWeight="500"
              fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              letterSpacing="0.4px"
            >
              CC
            </text>
          </svg>
        </button>

        {/* Captions / Transcript Dropdown Popover (Opens Upward) */}
        {showTranscript && (
          <div
            id="audio-transcript-popover"
            role="region"
            aria-label={locale === 'es' ? 'Transcripción de audio' : 'Audio transcript'}
            className="absolute right-0 bottom-full mb-3 w-72 sm:w-80 max-h-60 overflow-y-auto z-50 bg-white/95 backdrop-blur-md border border-slate-300 text-slate-800 p-3.5 rounded-2xl shadow-2xl space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-150"
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

      {/* 2. Play / Pause Button with Sound Waves matching exact UI */}
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
        className={`group relative inline-flex items-center justify-center p-0.5 sm:p-1 rounded-xl transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#13616d] active:scale-90 ${isPlaying ? 'text-[#0c4a54]' : 'text-[#13616d] hover:text-[#0c4a54]'
          }`}
      >
        <svg
          className="w-[3.15rem] h-9 sm:w-[3.4rem] sm:h-10 transition-transform duration-150 group-hover:scale-105"
          viewBox="0 0 50 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {isPlaying ? (
            <>
              {/* Rounded Play Triangle Outline when Playing */}
              <path
                d="M 5 8.5 C 5 5.5 7.2 4.2 10 5.8 L 28 16.2 C 29.8 17.2 29.8 18.8 28 19.8 L 10 30.2 C 7.2 31.8 5 30.5 5 27.5 Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
                fill="none"
              />
              {/* Vertical pause lines inside triangle */}
              <line x1="13.5" y1="11.5" x2="13.5" y2="24.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="19.5" y1="11.5" x2="19.5" y2="24.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Rounded Play Triangle - slightly enlarged with thin 1.8px border */}
              <path
                d="M 5 8.5 C 5 5.5 7.2 4.2 10 5.8 L 28 16.2 C 29.8 17.2 29.8 18.8 28 19.8 L 10 30.2 C 7.2 31.8 5 30.5 5 27.5 Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
                fill="none"
              />
              {/* "play" text inside the triangle */}
              <text
                x="14"
                y="18"
                textAnchor="middle"
                dominantBaseline="central"
                fill="currentColor"
                fontSize="8.5"
                fontWeight="500"
                fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                letterSpacing="0.2px"
              >
                play
              </text>
            </>
          )}

          {/* Concentric sound wave arcs on the right */}
          <path
            d="M 33 11 C 37 13.5 37 22.5 33 25"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className={isPlaying ? "animate-pulse" : ""}
          />
          <path
            d="M 38.5 6.5 C 44.5 10.5 44.5 25.5 38.5 29.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className={isPlaying ? "animate-pulse" : ""}
            style={{ animationDelay: isPlaying ? "150ms" : undefined }}
          />
        </svg>
      </button>

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
