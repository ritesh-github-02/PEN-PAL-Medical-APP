'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams, useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from '@/routing';
import { validateToken } from './actions';

import { RotateCcw } from 'lucide-react';
import Loader from '@/components/common/Loader';

export default function InterventionEntryPage() {
  const t = useTranslations('Intervention');
  const common = useTranslations('Common');
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();

  const token = searchParams.get('token') || searchParams.get('TOKEN') || searchParams.get('Token') || searchParams.get('t');
  const cleanToken = token?.trim() || null; 
  const locale = (params.locale as string) || 'en';

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(cleanToken));
  const [inputVal, setInputVal] = useState('');
  const [inputPrompt, setInputPrompt] = useState<string | null>(null);

  const handleResume = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputVal.trim()) {
      handleValidation(inputVal.trim());
    } else {
      const inputEl = document.getElementById('token-input') as HTMLInputElement | null;
      if (inputEl) {
        inputEl.focus();
        setInputPrompt(
          locale === 'es'
            ? 'Por favor, ingrese su Token o ID para reanudar donde lo dejó'
            : 'Please enter your Token or Research ID to resume where you left off'
        );
      }
    }
  };

  const handleValidation = useCallback(async (tokenToValidate: string) => {
    setLoading(true);
    setError(null);
    try {
      let raw = tokenToValidate.trim();
      // If user pasted a full URL or query string, extract the token parameter
      if (raw.includes('token=') || raw.includes('TOKEN=') || raw.includes('Token=') || raw.includes('t=')) {
        try {
          const urlObj = new URL(raw.startsWith('http') ? raw : `http://localhost/${raw.replace(/^\//, '')}`);
          const extractedParam = urlObj.searchParams.get('token') || urlObj.searchParams.get('TOKEN') || urlObj.searchParams.get('Token') || urlObj.searchParams.get('t');
          if (extractedParam) raw = extractedParam.trim();
        } catch {
          const match = raw.match(/[?&](?:token|TOKEN|Token|t)=([^&]+)/i);
          if (match && match[1]) raw = decodeURIComponent(match[1]).trim();
        }
      }

      let result = await validateToken(raw, locale);

      if (result.success === false) {
        setError(result.error);
        setLoading(false);
      } else if (result.success === true) {
        if (result.isCompleted) {
          router.push('/intervention/flow?report=true');
        } else {
          router.push('/intervention/flow');
        }
      }
    } catch (e) {
      console.error(e);
      setError('An error occurred during verification.');
      setLoading(false);
    }
  }, [locale, router]);

  useEffect(() => {
    if (cleanToken) {
      handleValidation(cleanToken);
    }
  }, [cleanToken, handleValidation]);

  if (loading) {
    return <Loader fullScreen />;
  }

  // --- ERROR SCREEN WITH CLINICAL SUPPORT CONTACTS ---
  if (error) {
    return (
      <main className="h-screen w-screen flex flex-col items-center justify-between py-6 px-4 font-sans bg-slate-50" role="main">
        <div className="flex-1 flex flex-col justify-center max-w-md w-full">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-8 w-full text-center space-y-5" role="alert" aria-live="assertive">
            <div className="w-14 h-14 bg-amber-50 border border-amber-200/80 flex items-center justify-center mx-auto rounded-2xl text-xl font-bold text-amber-800 shadow-xs" aria-hidden="true">
              !
            </div>
            <div className="space-y-1.5">
              <h1 className="text-lg font-bold text-slate-900">{locale === 'es' ? 'Problema con el enlace de acceso' : 'Access Link Issue'}</h1>
              <p className="text-slate-700 text-xs font-medium leading-relaxed">{error}</p>
            </div>

            {/* Support Contacts Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                {locale === 'es' ? 'Contactos de soporte del estudio' : 'Study Support Contacts'}
              </span>
              <div className="space-y-1 text-xs text-slate-800 font-medium">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{locale === 'es' ? 'Correo de soporte:' : 'Support Email:'}</span>
                  <a href="mailto:support@pen-pal-study.org" className="text-[#1d5c64] font-bold hover:underline">
                    support@pen-pal-study.org
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{locale === 'es' ? 'Teléfono de soporte:' : 'Support Phone:'}</span>
                  <a href="tel:18005550199" className="text-[#1d5c64] font-bold hover:underline">
                    +1 (800) 555-0199
                  </a>
                </div>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => setError(null)}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-sm active:scale-[0.98] cursor-pointer"
            >
              {locale === 'es' ? 'Intentar con otro enlace' : 'Try with another link'}
            </button>
          </div>
        </div>
        
        <div className="w-full max-w-xs text-center">
          <p className="text-[9px] text-slate-600 leading-normal font-normal">
            {locale === 'es'
              ? 'Aviso de seguridad: Los tokens de acceso a la sesión son privados, están asegurados criptográficamente y tienen límite de intentos.'
              : 'Security Notice: Session access tokens are private, cryptographically secured, and rate-limited.'}
          </p>
        </div>
      </main>
    );
  }

  // --- MAIN COMPACT PORTAL ENTRY FORM ---
  return (
    <main className="h-screen w-screen flex flex-col items-center justify-between py-6 px-4 font-sans text-[#2d3748] bg-[#f4f8e8]" role="main">
      <div className="flex-1 flex flex-col justify-center max-w-sm w-full space-y-5">
        {/* App Branding Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-black tracking-tight text-[#1d5c64] font-display">
            PEN-PAL
          </h1>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#1d5c64] bg-white/80 border border-slate-200/60 px-3 py-0.5 rounded-full inline-block shadow-sm">
              {locale === 'es' ? 'Padres Involucrados en Alergias a la Penicilina' : 'Parents Engaged in Penicillin Allergies'}
            </span>
          </div>
          <p className="text-xs text-slate-700 max-w-xs mx-auto font-medium">
            {locale === 'es' ? 'Acceda a la suite de evaluación clínica de forma segura.' : 'Access the clinical assessment suite securely.'}
          </p>
        </div>

        {/* Single Form Card - Protected Gateway */}
        <div className="bg-white/90 border border-slate-200/80 rounded-3xl shadow-sm p-6 sm:p-7 w-full text-center space-y-5">
          <div className="space-y-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#1d5c64] bg-[#f4f8e8] border border-slate-200/60 px-3 py-1 rounded-full inline-block">
              {locale === 'es' ? 'Acceso Exclusivo con Enlace de Estudio' : 'Invitation-Only Study Access'}
            </span>
            <h2 className="text-base font-bold text-[#1f2937]">
              {locale === 'es' ? 'Se Requiere Enlace Único o Código QR' : 'Unique Study Link or QR Code Required'}
            </h2>
            <p className="text-xs text-slate-600 font-normal leading-relaxed">
              {locale === 'es'
                ? 'Para acceder a esta evaluación clínica, debe utilizar el enlace único o escanear el código QR proporcionado por el equipo del estudio. Sin un enlace o ID válido, no es posible ingresar a la evaluación.'
                : 'To access this clinical assessment, you must use the unique link or scan the QR code provided by the study team. Without a valid study link or ID, access cannot be granted.'}
            </p>
          </div>

          {/* Form to enter Research ID / Token if opening directly */}
          <div className="space-y-3 pt-1">
            <form onSubmit={handleResume} className="space-y-3">
              <label htmlFor="token-input" className="sr-only">
                {locale === 'es' ? 'Token o ID de investigación' : 'Token or Research ID'}
              </label>
              <div className="space-y-1.5">
                <input 
                  id="token-input"
                  name="token" 
                  type="text" 
                  value={inputVal}
                  onChange={(e) => {
                    setInputVal(e.target.value);
                    if (inputPrompt) setInputPrompt(null);
                  }}
                  placeholder={locale === 'es' ? "Ingrese su Token o ID (ej. PEN-4K9L2M)" : "Enter your Token or Research ID (e.g. PEN-4K9L2M)"} 
                  required
                  aria-required="true"
                  className={`h-11 w-full px-3.5 border font-mono text-center tracking-wider text-slate-900 bg-white placeholder-slate-400 rounded-xl text-xs font-semibold transition-all ${
                    inputPrompt 
                      ? 'border-[#1d5c64] ring-2 ring-[#1d5c64]/20' 
                      : 'border-slate-300 focus:outline-none focus:border-[#1d5c64] focus:ring-1 focus:ring-[#1d5c64]'
                  }`}
                />
                {inputPrompt && (
                  <p className="text-[11px] text-[#1d5c64] font-bold animate-in fade-in">
                    {inputPrompt}
                  </p>
                )}
              </div>

              <button 
                type="submit" 
                className="w-full h-11 bg-[#71ad9d] hover:bg-[#609c8d] text-[#132c27] font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-sm active:scale-[0.99] flex justify-center items-center cursor-pointer gap-2"
              >
                <span>{locale === 'es' ? 'Acceder a la Evaluación →' : 'Access Assessment →'}</span>
              </button>
            </form>

            {/* Resume Assessment Bottom Action Button */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleResume()}
                className="w-full py-2.5 px-4 bg-slate-50 hover:bg-[#f4f8e8] text-[#1d5c64] hover:text-[#16484e] border border-slate-200 hover:border-[#1d5c64]/40 font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-2xs active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 group"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#1d5c64] group-hover:-rotate-45 transition-transform duration-200" />
                <span>{locale === 'es' ? 'Reanudar Evaluación' : 'Resume Assessment'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-xs text-center">
        <p className="text-[9px] text-slate-600 leading-normal font-normal">
          {locale === 'es'
            ? 'Aviso de seguridad: Los enlaces y tokens de acceso son personales, están asegurados criptográficamente y protegen la integridad del estudio clínico.'
            : 'Security Notice: Participant links and access tokens are private, cryptographically verified, and protected for clinical study integrity.'}
        </p>
      </div>
    </main>
  );
}