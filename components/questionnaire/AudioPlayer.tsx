'use client';

import { useState, useEffect, useRef } from 'react';
import { logInteraction } from '@/lib/tracking';

interface AudioPlayerProps {
  textToSpeak?: string;
  audioSrc?: string;
  stepId: string;
  locale: string;
}

export default function AudioPlayer({ textToSpeak, audioSrc, stepId, locale }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isTTS, setIsTTS] = useState(false);
  const [ttsEstimatedDuration, setTtsEstimatedDuration] = useState(0);
  const [isTtsPaused, setIsTtsPaused] = useState(false);

  // Determine if we should use TTS or audio source
  useEffect(() => {
    const useTTS = !!textToSpeak && !audioSrc;
    setIsTTS(useTTS);
    if (useTTS && textToSpeak) {
       // Estimate duration: roughly 14 chars per second average reading speed
       setTtsEstimatedDuration(Math.max(2, Math.ceil(textToSpeak.length / 14)));
    }
  }, [textToSpeak, audioSrc]);

  // Reset state when source changes
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    setIsTtsPaused(false);
    
    if (audioRef.current && !isTTS) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      if (audioSrc) audioRef.current.load();
    } else if (isTTS) {
      window.speechSynthesis.cancel();
    }
  }, [audioSrc, textToSpeak, isTTS]);

  // TTS Timer hook
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTTS && isPlaying && !isTtsPaused) {
      interval = setInterval(() => {
         setProgress((p) => {
           if (p >= ttsEstimatedDuration) {
             // Snap to end, but let onend handler cleanly close playing state
             return ttsEstimatedDuration;
           }
           return p + 0.1;
         });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isTTS, isPlaying, isTtsPaused, ttsEstimatedDuration]);

  const togglePlayPause = () => {
    if (isTTS) {
      if (isPlaying) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
        setIsTtsPaused(true);
        logInteraction('AUDIO_PAUSE', { stepId, type: 'tts' }, `/intervention/flow`).catch(()=>{});
      } else {
        // If we were paused and haven't finished the progress bar, resume
        if (isTtsPaused && progress < ttsEstimatedDuration) {
          window.speechSynthesis.resume();
          setIsPlaying(true);
          setIsTtsPaused(false);
        } else {
          // It finished, or was cancelled cleanly, so start fully over
          if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
          }
          setProgress(0);
          setIsTtsPaused(false);
          const utterance = new SpeechSynthesisUtterance(textToSpeak || '');
          utterance.lang = locale === 'es' ? 'es-ES' : 'en-US';
          utterance.onend = () => {
             // End of stream event
             setIsPlaying(false);
             setIsTtsPaused(false);
             setProgress(ttsEstimatedDuration); // Snap to fully complete
             logInteraction('AUDIO_COMPLETE', { stepId, type: 'tts' }, `/intervention/flow`).catch(()=>{});
          };
          utterance.onerror = (e) => {
             if (e.error === 'interrupted' || e.error === 'canceled') return;
             console.error('Speech synthesis error:', e.error, e);
             setIsPlaying(false);
             setIsTtsPaused(false);
          };
          window.speechSynthesis.speak(utterance);
          setIsPlaying(true);
        }
        logInteraction('AUDIO_PLAY', { stepId, type: 'tts' }, `/intervention/flow`).catch(()=>{});
      }
      return;
    }

    // Standard Audio
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      logInteraction('AUDIO_PAUSE', { stepId, currentTime: audioRef.current.currentTime }, `/intervention/flow`).catch(()=>{});
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      logInteraction('AUDIO_PLAY', { stepId, currentTime: audioRef.current.currentTime }, `/intervention/flow`).catch(()=>{});
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
    logInteraction('AUDIO_COMPLETE', { stepId }, `/intervention/flow`).catch(()=>{});
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isTTS) return; // Cannot seek TTS easily
    if (!audioRef.current) return;
    const newTime = Number(e.target.value);
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };

  const restartPlayback = () => {
    if (isTTS) {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }
      setProgress(0);
      setIsTtsPaused(false);
      const utterance = new SpeechSynthesisUtterance(textToSpeak || '');
      utterance.lang = locale === 'es' ? 'es-ES' : 'en-US';
      utterance.onend = () => {
         setIsPlaying(false);
         setIsTtsPaused(false);
         setProgress(ttsEstimatedDuration);
         logInteraction('AUDIO_COMPLETE', { stepId, type: 'tts' }, `/intervention/flow`).catch(()=>{});
      };
      utterance.onerror = (e) => {
         if (e.error === 'interrupted' || e.error === 'canceled') return;
         console.error('Speech synthesis error:', e.error, e);
         setIsPlaying(false);
         setIsTtsPaused(false);
      };
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
      logInteraction('AUDIO_RESTART', { stepId, type: 'tts' }, `/intervention/flow`).catch(()=>{});
    } else {
      if (!audioRef.current) return;
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
      setProgress(0);
      logInteraction('AUDIO_RESTART', { stepId }, `/intervention/flow`).catch(()=>{});
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full flex items-center gap-4 bg-zinc-50 border border-zinc-200 p-4 mb-8">
      {!isTTS && (
        <audio
          ref={audioRef}
          src={audioSrc}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
      )}
      
      <div className="flex items-center gap-2">
        <button 
          onClick={togglePlayPause}
          className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-colors"
          aria-label={isPlaying ? "Pause audio playback" : "Play audio playback"}
        >
          {isPlaying ? (
            // Pause Icon
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            // Play Icon
            <svg className="w-4 h-4 fill-current ml-1" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button 
          onClick={restartPlayback}
          className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-zinc-200 text-zinc-600 rounded-full hover:bg-zinc-300 hover:text-zinc-900 transition-colors"
          aria-label="Play Again"
        >
          {/* Replay / Restart Icon */}
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
             <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
          </svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-1 opacity-70">
        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
           <span>{locale === 'es' ? 'Voz Superpuesta' : 'Voiceover'} {isTTS && '(Auto)'}</span>
           <span className="tabular-nums">
             {formatTime(progress)} / {formatTime(isTTS ? ttsEstimatedDuration : duration)}
           </span>
        </div>
        <div className={`relative w-full h-1 bg-zinc-200 flex items-center ${isTTS ? 'overflow-hidden' : 'cursor-pointer'}`}>
          <input 
            type="range" 
            min="0" 
            max={isTTS ? ttsEstimatedDuration : (duration || 0)} 
            value={progress} 
            onChange={handleSeek}
            disabled={isTTS}
            className={`absolute inset-0 w-full h-full opacity-0 ${isTTS ? 'cursor-default' : 'cursor-pointer'}`}
          />
          <div 
            className="h-full bg-zinc-900 pointer-events-none transition-all duration-75"
            style={{ width: `${(isTTS ? ttsEstimatedDuration : duration) > 0 ? (progress / (isTTS ? ttsEstimatedDuration : duration)) * 100 : 0}%` }}
          />
        </div>
      </div>
    </div>
  );
}
