'use client';

import { useState, useEffect, useRef } from 'react';
import { logInteraction } from '@/lib/tracking';

interface AudioPlayerProps {
  textToSpeak?: string;
  audioSrc?: string;
  stepId: string;
  locale: string;
  title?: string;
  description?: string;
  content?: string;
  options?: Array<{ labelEn: string; labelEs: string }>;
  selected?: any;
  isMultipleChoice?: boolean;
}

export default function AudioPlayer({
  textToSpeak,
  audioSrc,
  stepId,
  locale,
  title = '',
  description = '',
  content = '',
  options = [],
  selected,
  isMultipleChoice = false,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isTTS, setIsTTS] = useState(false);
  const [ttsDuration, setTtsDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Build comprehensive TTS text from all screen elements
  const buildFullText = () => {
    let fullText = '';
    
    if (title) fullText += title + '. ';
    if (description) fullText += description + '. ';
    if (content) fullText += content + '. ';
    
    if (options && options.length > 0) {
      fullText += 'Options: ';
      if (locale === 'es') {
        fullText += options.map((opt: any) => opt.labelEs).join('. ') + '. ';
      } else {
        fullText += options.map((opt: any) => opt.labelEn).join('. ') + '. ';
      }
      if (selected) {
        const selectedValues = Array.isArray(selected) ? selected : [selected];
        fullText += 'You selected: ';
        selectedValues.forEach((val: string) => {
          const opt = options.find((o: any) => o.value === val);
          fullText += (locale === 'es' ? opt?.labelEs || val : opt?.labelEn || val) + '. ';
        });
      }
    }
    
    return fullText.trim() || textToSpeak || '';
  };

  // Determine if we should use TTS or audio source
  useEffect(() => {
    const useTTS = !!textToSpeak && !audioSrc;
    setIsTTS(useTTS);
    if (useTTS && textToSpeak) {
      const fullText = buildFullText();
      const estimated = Math.max(3, Math.ceil(fullText.length / 14));
      setTtsDuration(estimated);
    }
  }, [textToSpeak, audioSrc, title, description, content, options, selected, locale]);

  // Reset state when source changes
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setIsPaused(false);
    
    if (audioRef.current && !isTTS) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      if (audioSrc) audioRef.current.load();
    } else if (isTTS) {
      window.speechSynthesis.cancel();
    }
  }, [audioSrc, textToSpeak, isTTS, title, description, content, options, selected]);

  // TTS progress timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTTS && isPlaying && !isPaused) {
      interval = setInterval(() => {
        setProgress((p) => {
          if (p >= ttsDuration) {
            return ttsDuration;
          }
          return p + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isTTS, isPlaying, isPaused, ttsDuration]);

  const togglePlayPause = () => {
    if (isTTS) {
      if (isPlaying) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
        setIsPaused(true);
        logInteraction('AUDIO_PAUSE', { stepId, type: 'tts' }, '/intervention/flow').catch(() => {});
      } else {
        if (isPaused && progress < ttsDuration) {
          window.speechSynthesis.resume();
          setIsPlaying(true);
          setIsPaused(false);
        } else {
          if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
          }
          setProgress(0);
          setIsPaused(false);
          const fullText = buildFullText();
          const utterance = new SpeechSynthesisUtterance(fullText);
          utterance.lang = locale === 'es' ? 'es-ES' : 'en-US';
          utterance.onend = () => {
            setIsPlaying(false);
            setIsPaused(false);
            setProgress(ttsDuration);
            logInteraction('AUDIO_COMPLETE', { stepId, type: 'tts' }, '/intervention/flow').catch(() => {});
          };
          utterance.onerror = (e) => {
            if (e.error === 'interrupted' || e.error === 'canceled') return;
            console.error('Speech synthesis error:', e.error);
            setIsPlaying(false);
            setIsPaused(false);
          };
          window.speechSynthesis.speak(utterance);
          setIsPlaying(true);
        }
        logInteraction('AUDIO_PLAY', { stepId, type: 'tts' }, '/intervention/flow').catch(() => {});
      }
      return;
    }

    // Standard audio file playback
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
    if (!audioRef.current || isTTS) return;
    setProgress(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current || isTTS) return;
    setDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    if (isTTS) return;
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

  if (!textToSpeak && !audioSrc) return null;

  return (
    <>
      {!isTTS && (
        <audio
          ref={audioRef}
          src={audioSrc}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
      )}

      {/* Floating Voiceover Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Tooltip label when not playing */}
        {!isPlaying && !isPaused && (
          <div className="bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-md shadow-lg mb-1 opacity-90">
            {locale === 'es' ? 'Voz Superpuesta' : 'Voiceover'}
          </div>
        )}

        {/* Main floating button with progress ring */}
        <button
          onClick={togglePlayPause}
          className="relative w-14 h-14 flex items-center justify-center bg-zinc-900 text-white rounded-full shadow-lg hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95"
          aria-label={isPlaying ? 'Pause voiceover' : 'Play voiceover'}
        >
          {isPlaying ? (
            // Pause Icon
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            // Play Icon
            <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}

          {/* Progress indicator ring */}
          {(isTTS || isPlaying) && (
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
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
                strokeDasharray={`${(progress / (isTTS ? ttsDuration : duration || 1)) * 163.36} 163.36`}
                className="text-white transition-all"
              />
            </svg>
          )}
        </button>

        {/* Time tooltip on hover when playing */}
        {(isPlaying || isPaused) && (
          <div className="bg-zinc-800 text-white text-xs font-mono px-2 py-1 rounded-md shadow-md whitespace-nowrap">
            {formatTime(progress)} / {formatTime(isTTS ? ttsDuration : duration)}
          </div>
        )}

        {/* Restart button (small) */}
        {isPlaying || isPaused ? (
          <button
            onClick={() => {
              if (isTTS) {
                if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
                  window.speechSynthesis.cancel();
                }
                setProgress(0);
                setIsPaused(false);
                const fullText = buildFullText();
                const utterance = new SpeechSynthesisUtterance(fullText);
                utterance.lang = locale === 'es' ? 'es-ES' : 'en-US';
                utterance.onend = () => {
                  setIsPlaying(false);
                  setIsPaused(false);
                  setProgress(ttsDuration);
                  logInteraction('AUDIO_RESTART', { stepId, type: 'tts' }, '/intervention/flow').catch(() => {});
                };
                window.speechSynthesis.speak(utterance);
                setIsPlaying(true);
                logInteraction('AUDIO_RESTART', { stepId, type: 'tts' }, '/intervention/flow').catch(() => {});
              } else if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
                setIsPlaying(true);
                setProgress(0);
                logInteraction('AUDIO_RESTART', { stepId }, '/intervention/flow').catch(() => {});
              }
            }}
            className="w-8 h-8 flex items-center justify-center bg-zinc-700 text-white rounded-full shadow hover:bg-zinc-600 transition text-xs"
            aria-label="Restart"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            </svg>
          </button>
        ) : null}
      </div>
    </>
  );
}
