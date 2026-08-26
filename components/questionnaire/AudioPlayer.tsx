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
      <div 
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2.5 no-print" 
        role="region" 
        aria-label={locale === 'es' ? 'Controles de reproducción de audio' : 'Audio playback controls'}
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
                className="text-slate-400 hover:text-slate-700 text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer"
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
            className={`group relative w-11 h-11 flex items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 border cursor-pointer ${
              showTranscript 
                ? 'bg-[#236f7a] text-white border-[#236f7a]' 
                : 'bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700/50'
            }`}
            title={locale === 'es' ? 'Ver transcripción de texto' : 'Toggle audio transcript & captions'}
            aria-label={locale === 'es' ? (showTranscript ? 'Ocultar transcripción de texto' : 'Mostrar transcripción de texto') : (showTranscript ? 'Hide audio transcript' : 'Show audio transcript')}
          >
            <span className="text-sm font-bold">CC</span>
          </button>

          {/* Download Audio Button */}
          <a
            href={audioSrc}
            download={`${stepId}_${locale}.mp3`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-11 h-11 flex items-center justify-center bg-teal-800 hover:bg-teal-700 text-white rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 border border-teal-600/50 cursor-pointer"
            title={locale === 'es' ? 'Descargar Audio (.MP3)' : 'Download Audio (.MP3)'}
            aria-label={locale === 'es' ? 'Descargar archivo de audio MP3' : 'Download audio MP3'}
            onClick={() => {
              logInteraction('AUDIO_DOWNLOAD', { stepId, locale }, '/intervention/flow').catch(() => {});
            }}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>
          </a>

          {/* Main Play/Pause Button */}
          <button
            type="button"
            onClick={togglePlayPause}
            aria-pressed={isPlaying}
            className="relative w-14 h-14 flex items-center justify-center bg-zinc-900 text-white rounded-full shadow-lg hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
            aria-label={
              isPlaying 
                ? (locale === 'es' ? 'Pausar audio grabado' : 'Pause recorded audio') 
                : (locale === 'es' ? 'Reproducir audio grabado' : 'Play recorded audio')
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
            {isPlaying && (
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" aria-hidden="true">
                <circle
                  cx="28"
                  cy="28"
                  r="26"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="3"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="26"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${(progress / (duration || 1)) * 163.36} 163.36`}
                  className="text-white transition-all"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Time display when playing */}
        {isPlaying && (
          <div className="bg-zinc-800 text-white text-xs font-mono px-2 py-1 rounded-md shadow-md whitespace-nowrap" aria-live="off">
            {formatTime(progress)} / {formatTime(duration)}
          </div>
        )}

        {/* Dynamic Live Status Announcement for Screen Readers */}
        <div role="status" aria-live="polite" className="sr-only">
          {isPlaying
            ? (locale === 'es' ? 'Reproduciendo audio de la enfermera Anna' : 'Playing Nurse Anna audio narration')
            : (locale === 'es' ? 'Audio en pausa' : 'Audio narration paused')}
        </div>
      </div>
    </>
  );
}
