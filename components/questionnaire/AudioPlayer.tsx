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

  const [showTranscript, setShowTranscript] = useState(false);

  const fullTranscriptText = buildFullText();

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

      {/* Floating Voiceover & Accessibility Controls */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2.5 no-print" role="region" aria-label={locale === 'es' ? 'Controles de audio y accesibilidad' : 'Audio and accessibility controls'}>
        {/* Tooltip label when not playing */}
        {!isPlaying && !isPaused && (
          <div className="bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md shadow-lg opacity-90 font-sans select-none">
            {locale === 'es' ? 'Voz Superpuesta y Transcripción' : 'Voiceover & Transcript'}
          </div>
        )}

        {/* Floating Captions / Transcript Drawer Modal */}
        {showTranscript && (
          <div 
            id="audio-transcript-dialog"
            role="dialog"
            aria-modal="false"
            aria-label={locale === 'es' ? 'Transcripción de texto' : 'Audio text transcript'}
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
              {fullTranscriptText || (locale === 'es' ? 'No hay texto disponible para esta diapositiva.' : 'No audio transcript available for this screen.')}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Transcript / Captions Toggle Button */}
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
            title={locale === 'es' ? 'Ver transcripción de texto (Accesibilidad)' : 'Toggle audio transcript & captions (Accessibility)'}
            aria-label={locale === 'es' ? (showTranscript ? 'Ocultar transcripción de texto' : 'Mostrar transcripción de texto') : (showTranscript ? 'Hide audio transcript' : 'Show audio transcript')}
          >
            <span className="text-sm font-bold">CC</span>
            {/* Hover Tooltip */}
            <span className="absolute right-13 whitespace-nowrap bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-sans">
              {locale === 'es' ? 'Transcripción de Texto' : 'Captions / Transcript'}
            </span>
          </button>

          {/* Export Audio / Download Button */}
          <a
            href={audioSrc || `/audio/exported/${stepId}_${locale}.mp3`}
            download={`${stepId}_${locale}.mp3`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-11 h-11 flex items-center justify-center bg-teal-800 hover:bg-teal-700 text-white rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 border border-teal-600/50 cursor-pointer"
            title={locale === 'es' ? 'Descargar Audio de Diapositiva (.MP3)' : 'Export Slide Audio (.MP3)'}
            aria-label={locale === 'es' ? 'Descargar archivo de audio MP3' : 'Export and download audio MP3'}
            onClick={() => {
              logInteraction('AUDIO_DOWNLOAD', { stepId, locale }, '/intervention/flow').catch(() => {});
            }}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>

            {/* Hover Tooltip Label */}
            <span className="absolute right-13 whitespace-nowrap bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-sans">
              {locale === 'es' ? 'Descargar Audio MP3' : 'Export MP3 Audio'}
            </span>
          </a>

          {/* Main floating play/pause button with progress ring */}
          <button
            type="button"
            onClick={togglePlayPause}
            className="relative w-14 h-14 flex items-center justify-center bg-zinc-900 text-white rounded-full shadow-lg hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            aria-label={
              isPlaying 
                ? (locale === 'es' ? 'Pausar locución de voz' : 'Pause audio narration') 
                : (locale === 'es' ? 'Reproducir locución de voz' : 'Play audio narration')
            }
          >
            {isPlaying ? (
              // Pause Icon
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              // Play Icon
              <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}

            {/* Progress indicator ring */}
            {(isTTS || isPlaying) && (
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
                  strokeDasharray={`${(progress / (isTTS ? ttsDuration : duration || 1)) * 163.36} 163.36`}
                  className="text-white transition-all"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Time tooltip when playing */}
        {(isPlaying || isPaused) && (
          <div className="bg-zinc-800 text-white text-xs font-mono px-2 py-1 rounded-md shadow-md whitespace-nowrap" aria-live="off">
            {formatTime(progress)} / {formatTime(isTTS ? ttsDuration : duration)}
          </div>
        )}

        {/* Restart button (small) */}
        {isPlaying || isPaused ? (
          <button
            type="button"
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
            className="w-8 h-8 flex items-center justify-center bg-zinc-700 text-white rounded-full shadow hover:bg-zinc-600 transition text-xs cursor-pointer"
            aria-label={locale === 'es' ? 'Reiniciar audio desde el principio' : 'Restart audio from beginning'}
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            </svg>
          </button>
        ) : null}
      </div>
    </>
  );
}
