'use client';

import { useState, useEffect, useRef } from 'react';
import { logInteraction } from '@/lib/tracking';

interface AudioPlayerProps {
  audioSrc?: string;
  stepId: string;
  locale: string;
  transcriptText?: string;
  className?: string;
  size?: 'small' | 'compact' | 'normal' | 'large' | 'xl';
}

export default function AudioPlayer({
  audioSrc,
  stepId,
  locale,
  transcriptText = '',
  className = '',
  size = 'large',
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptPopoverRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);

  // Reset state when source or step changes
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    setShowTranscript(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      if (audioSrc) audioRef.current.load();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [audioSrc, stepId]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale === 'es' ? 'es-US' : 'en-US';
    utterance.rate = 0.95;

    // Pick appropriate voice if loaded
    const voices = window.speechSynthesis.getVoices();
    const targetLangPrefix = locale === 'es' ? 'es' : 'en';
    const matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(targetLangPrefix));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      setIsPlaying(false);
      logInteraction('AUDIO_COMPLETE', { stepId, mode: 'tts' }, '/intervention/flow').catch(() => {});
    };
    utterance.onerror = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    logInteraction('AUDIO_PLAY', { stepId, mode: 'tts' }, '/intervention/flow').catch(() => {});
  };

  const togglePlayPause = () => {
    // 1. If audioSrc is present, prefer pre-recorded audio file
    if (audioSrc && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        logInteraction(
          'AUDIO_PAUSE',
          { stepId, currentTime: audioRef.current.currentTime },
          '/intervention/flow'
        ).catch(() => {});
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              logInteraction(
                'AUDIO_PLAY',
                { stepId, currentTime: audioRef.current?.currentTime ?? 0 },
                '/intervention/flow'
              ).catch(() => {});
            })
            .catch(() => {
              // If audio file playback fails (e.g. decode error or not loaded), fallback to TTS
              if (transcriptText) {
                speakText(transcriptText);
              }
            });
        }
      }
      return;
    }

    // 2. If no pre-recorded audio file, use SpeechSynthesis to read slide data
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        logInteraction('AUDIO_PAUSE', { stepId, mode: 'tts' }, '/intervention/flow').catch(() => {});
      } else if (transcriptText) {
        speakText(transcriptText);
      }
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

  // If there's neither audio file nor transcript text, hide player
  if (!audioSrc && !transcriptText) return null;

  // Size classes for CC and Play icons
  const isCompact = size === 'small' || size === 'compact';
  const ccSizeClass =
    isCompact
      ? 'w-[36px] h-[32px] sm:w-[39px] sm:h-[35px]'
      : size === 'normal'
      ? 'w-9 h-8 sm:w-11 sm:h-10'
      : size === 'xl'
      ? 'w-14 h-12.5 sm:w-[3.9rem] sm:h-[3.5rem]'
      : 'w-12 h-11 sm:w-[3.45rem] sm:h-[3.15rem]';

  const playSizeClass =
    isCompact
      ? 'w-[48px] h-[32px] sm:w-[52px] sm:h-[35px]'
      : size === 'normal'
      ? 'w-[3rem] h-8 sm:w-[3.6rem] sm:h-10'
      : size === 'xl'
      ? 'w-[4.4rem] h-12.5 sm:w-[5.2rem] sm:h-[3.5rem]'
      : 'w-[3.9rem] h-11 sm:w-[4.65rem] sm:h-[3.15rem]';

  return (
    <div
      className={`relative inline-flex items-center ${isCompact ? 'gap-1.5 sm:gap-2' : 'gap-2 sm:gap-2.5'} z-30 ${className}`}
      aria-label={
        locale === 'es'
          ? 'Controles de narración de audio y subtítulos'
          : 'Audio narration and caption controls'
      }
    >
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
      )}

      {/* 1. CC (Closed Caption / Transcript) Speech Bubble Button */}
      <div className="relative inline-flex items-center justify-center" ref={transcriptPopoverRef}>
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
          className={`audio-cc-btn group relative inline-flex items-center justify-center ${isCompact ? 'p-0.5' : 'p-0.5 sm:p-1'} rounded-xl transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#13616d] active:scale-90 ${showTranscript ? 'text-[#0c4a54]' : 'text-[#13616d] hover:text-[#0c4a54]'
            }`}
        >
          {/* Custom CC Speech Bubble SVG perfectly aligned with Play button */}
          <svg
            className={`${ccSizeClass} transition-transform duration-150 group-hover:scale-105`}
            viewBox="0 0 40 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Speech Bubble Outline with rounded corners and downward tail */}
            <path
              d="M 8.5 5.5 C 5.5 5.5 4 7.2 4 11 V 20 C 4 23.8 5.5 25.5 8.5 25.5 H 12 C 13 25.5 14 26.3 14.7 27.5 L 16.5 30.5 C 17.3 31.7 18.7 31.7 19.5 30.5 L 21.3 27.5 C 22 26.3 23 25.5 24 25.5 H 31.5 C 34.5 25.5 36 23.8 36 20 V 11 C 36 7.2 34.5 5.5 31.5 5.5 Z"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* CC Text inside - vertically and optically centered */}
            <text
              x="20"
              y="15.5"
              textAnchor="middle"
              dominantBaseline="central"
              fill="currentColor"
              fontSize="13"
              fontWeight="600"
              fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              letterSpacing="0.3px"
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
        className={`audio-play-btn group relative inline-flex items-center justify-center ${isCompact ? 'p-0.5' : 'p-0.5 sm:p-1'} rounded-xl transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#13616d] active:scale-90 ${isPlaying ? 'text-[#0c4a54]' : 'text-[#13616d] hover:text-[#0c4a54]'
          }`}
      >
        <svg
          className={`${playSizeClass} transition-transform duration-150 group-hover:scale-105`}
          viewBox="0 0 50 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {isPlaying ? (
            <>
              {/* Rounded Play Triangle Outline when Playing */}
              <path
                d="M 4.5 8.5 C 4.5 5.5 6.8 4.2 9.5 5.8 L 28 16.2 C 29.8 17.2 29.8 18.8 28 19.8 L 9.5 30.2 C 6.8 31.8 4.5 30.5 4.5 27.5 Z"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinejoin="round"
                fill="none"
              />
              {/* Perfectly centered vertical pause lines with clean clearance from slanted borders */}
              <line x1="11.5" y1="13" x2="11.5" y2="23" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="16.5" y1="13" x2="16.5" y2="23" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Rounded Play Triangle - bold 2.2px border */}
              <path
                d="M 4.5 8.5 C 4.5 5.5 6.8 4.2 9.5 5.8 L 28 16.2 C 29.8 17.2 29.8 18.8 28 19.8 L 9.5 30.2 C 6.8 31.8 4.5 30.5 4.5 27.5 Z"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinejoin="round"
                fill="none"
              />
              {/* "play" text inside the triangle - optically and evenly centered */}
              <text
                x="14.8"
                y="17.2"
                textAnchor="middle"
                dominantBaseline="central"
                fill="currentColor"
                fontSize="8"
                fontWeight="700"
                fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                letterSpacing="0.1px"
              >
                play
              </text>
            </>
          )}

          {/* Concentric sound wave arcs on the right */}
          <path
            d="M 33 11 C 37 13.5 37 22.5 33 25"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            className={isPlaying ? "animate-pulse" : ""}
          />
          <path
            d="M 38.5 6.5 C 44.5 10.5 44.5 25.5 38.5 29.5"
            stroke="currentColor"
            strokeWidth="2.2"
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
