'use client';

import { useState, useEffect, useRef } from 'react';
import { logInteraction } from '@/lib/tracking';

interface AudioPlayerProps {
  audioSrc?: string;
  stepId: string;
  locale: string;
  transcriptText?: string;
}

export default function AudioPlayer({
  audioSrc,
  stepId,
  locale,
  transcriptText = '',
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);

  // Reset state when source changes
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      if (audioSrc) audioRef.current.load();
    }
  }, [audioSrc]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      logInteraction('AUDIO_PAUSE', { stepId, currentTime: audioRef.current.currentTime }, '/intervention/flow').catch(() => {});
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      logInteraction('AUDIO_PLAY', { stepId, currentTime: audioRef.current.currentTime }, '/intervention/flow').catch(() => {});
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

  // If there is no pre-recorded audio file, do not render any player (screen readers read the page naturally)
  if (!audioSrc) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Floating Audio Player Controls for Recorded Narration */}
      <aside 
        className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2.5 no-print" 
        aria-label={locale === 'es' ? 'Controles de narración de audio y subtítulos' : 'Audio Narration and Caption Controls'}
      >
        {/* Captions / Transcript Modal */}
        {showTranscript && (
          <div 
            id="audio-transcript-dialog"
            role="dialog"
            aria-modal="false"
            aria-label={locale === 'es' ? 'Transcripción de audio' : 'Audio transcript'}
            className="w-72 sm:w-84 max-h-64 overflow-y-auto custom-scrollbar bg-white/95 backdrop-blur-md border border-slate-300 text-slate-800 p-4 rounded-2xl shadow-2xl space-y-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#236f7a]"></span>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {locale === 'es' ? 'Transcripción de Audio' : 'Audio Transcript / Captions'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowTranscript(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a]"
                aria-label={locale === 'es' ? 'Cerrar transcripción' : 'Close transcript'}
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium select-text whitespace-pre-line">
              {transcriptText || (locale === 'es' ? 'Transcripción de la grabación de audio.' : 'Recorded audio transcript.')}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Transcript Toggle Button */}
          <button
            type="button"
            onClick={() => setShowTranscript(!showTranscript)}
            aria-expanded={showTranscript}
            aria-controls="audio-transcript-dialog"
            className={`group relative w-11 h-11 flex items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 border cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
              showTranscript 
                ? 'bg-[#236f7a] text-white border-[#236f7a]' 
                : 'bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border-slate-700/50'
            }`}
            title={locale === 'es' ? 'Ver subtítulos y transcripción' : 'Toggle Closed Captions'}
            aria-label={locale === 'es' ? (showTranscript ? 'Ocultar subtítulos' : 'Mostrar subtítulos') : 'Toggle Closed Captions'}
          >
            <span className="text-xs font-bold">CC</span>
          </button>

          {/* Main Play/Pause Button */}
          <button
            type="button"
            onClick={togglePlayPause}
            aria-pressed={isPlaying}
            className="relative w-11 h-11 flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg transition active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
            aria-label={
              isPlaying 
                ? (locale === 'es' ? 'Pausar narración de audio' : 'Pause audio narration') 
                : (locale === 'es' ? 'Reproducir narración de audio' : 'Play audio narration')
            }
          >
            {isPlaying ? (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}

            {/* Progress indicator ring */}
            {(isPlaying || progress > 0) && (
              <svg
                className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                viewBox="0 0 44 44"
                aria-hidden="true"
              >
                <circle
                  cx="22"
                  cy="22"
                  r="20"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.25)"
                  strokeWidth="2.5"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={`${(duration > 0 ? Math.min(Math.max(progress / duration, 0), 1) : 0) * 125.66} 125.66`}
                  className="text-white transition-all duration-150"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Time display when playing or paused midway */}
        {(isPlaying || progress > 0) && (
          <div className="bg-slate-900/95 backdrop-blur-xs text-white text-xs font-mono px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap border border-slate-700/50" aria-live="off">
            {formatTime(progress)} / {formatTime(duration)}
          </div>
        )}

        {/* Dynamic Live Status Announcement for Screen Readers */}
        <div role="status" aria-live="polite" className="sr-only">
          {isPlaying
            ? (locale === 'es' ? 'Reproduciendo audio de la enfermera Anna' : 'Playing Nurse Anna audio narration')
            : (locale === 'es' ? 'Audio en pausa' : 'Audio narration paused')}
        </div>
      </aside>
    </>
  );
}
