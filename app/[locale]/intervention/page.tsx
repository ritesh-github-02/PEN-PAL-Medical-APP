'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams, useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from '@/routing';
import { validateToken, requestToken } from './actions';

import Loader from '@/components/common/Loader';

export default function InterventionEntryPage() {
  const t = useTranslations('Intervention');
  const common = useTranslations('Common');
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();

  const token = searchParams.get('token');
  const locale = (params.locale as string) || 'en';

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<{ message: string; token: string } | null>(null);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const handleValidation = useCallback(async (tokenToValidate: string) => {
    setLoading(true);
    setError(null);
    try {
      let result = await validateToken(tokenToValidate, locale);

      // If direct validation fails, check if input is a Research ID and retrieve token
      if (result.success === false) {
        const reqResult = await requestToken(tokenToValidate, locale);
        if (reqResult.success === true && reqResult.token) {
          result = await validateToken(reqResult.token, locale);
        }
      }

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
    if (token) {
      handleValidation(token);
    }
  }, [token, handleValidation]);

  const handleRequestToken = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const userId = (e.currentTarget.elements.namedItem('userId') as HTMLInputElement).value;
    
    try {
      const result = await requestToken(userId, locale);
      if (result.success === false) {
        setError(result.error);
        setLoading(false);
      } else if (result.success === true) {
        setRequestStatus({ message: result.message || '', token: result.token || '' });
        setLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      setLoading(false);
    }
  };

  if (loading && !requestStatus) {
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
              <h1 className="text-lg font-bold text-slate-900">Access Link Issue</h1>
              <p className="text-slate-700 text-xs font-medium leading-relaxed">{error}</p>
            </div>

            {/* Support Contacts Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                Study Support Contacts
              </span>
              <div className="space-y-1 text-xs text-slate-800 font-medium">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Support Email:</span>
                  <a href="mailto:support@pen-pal-study.org" className="text-[#1d5c64] font-bold hover:underline">
                    support@pen-pal-study.org
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Support Phone:</span>
                  <a href="tel:18005550199" className="text-[#1d5c64] font-bold hover:underline">
                    +1 (800) 555-0199
                  </a>
                </div>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => { setError(null); setRequestStatus(null); }}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-sm active:scale-[0.98] cursor-pointer"
            >
              Try Scanning QR Code Again
            </button>
          </div>
        </div>
        
        <div className="w-full max-w-xs text-center">
          <p className="text-[9px] text-slate-600 leading-normal font-normal">
            Security Notice: Session access tokens are private, cryptographically secured, and rate-limited.
          </p>
        </div>
      </main>
    );
  }

  // --- TOKEN GENERATED SUCCESS SCREEN ---
  if (requestStatus) {
    return (
      <main className="h-screen w-screen flex flex-col items-center justify-between py-6 px-4 font-sans bg-slate-50" role="main">
        <div className="flex-1 flex flex-col justify-center max-w-sm w-full">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6 w-full text-center space-y-4" role="status" aria-live="polite">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-lg rounded-xl text-emerald-700 shadow-sm" aria-hidden="true">
              ✓
            </div>
            <div className="space-y-1">
              <h1 className="text-base font-bold text-slate-900">Token Ready</h1>
              <p className="text-slate-600 text-xs font-medium leading-normal">{requestStatus.message}</p>
            </div>
            
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors select-all cursor-pointer" tabIndex={0} aria-label={`Generated token: ${requestStatus.token}. Click or press to select and copy`}>
               <p className="text-xs font-mono tracking-wider text-slate-900 break-all font-bold">{requestStatus.token}</p>
               <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-1.5">Click to select and copy</p>
            </div>

            <div className="space-y-2 pt-1">
              <button 
                type="button"
                onClick={() => handleValidation(requestStatus.token)}
                className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all shadow-md active:scale-[0.98] cursor-pointer flex justify-center items-center"
              >
                Use Token & Start
              </button>
              
              <button 
                type="button"
                onClick={() => { setRequestStatus(null); setMode('login'); }}
                className="block w-full text-center text-[10px] font-bold text-slate-500 hover:text-slate-700 uppercase tracking-widest transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        <div className="w-full max-w-xs text-center">
          <p className="text-[9px] text-slate-600 leading-normal font-normal">
            Security Notice: Session access tokens are private, cryptographically secured, and rate-limited.
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
              Parents Engaged in Penicillin Allergies
            </span>
          </div>
          <p className="text-xs text-slate-700 max-w-xs mx-auto font-medium">
            Access the clinical assessment suite securely.
          </p>
        </div>

        {/* Single Form Card - Passwordless Gateway */}
        <div className="bg-white/90 border border-slate-200/80 rounded-3xl shadow-sm p-6 sm:p-7 w-full text-center space-y-5">
          <div className="space-y-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#1d5c64] bg-[#f4f8e8] border border-slate-200/60 px-3 py-1 rounded-full inline-block">
              100% Passwordless Access
            </span>
            <h2 className="text-base font-bold text-[#1f2937]">Scan Poster QR or Use Direct Link</h2>
            <p className="text-xs text-slate-600 font-normal leading-relaxed">
              Scanning your study poster QR code automatically logs you in. No password or manual ID typing required.
            </p>
          </div>

          {/* Instant Passwordless Access Button */}
          <a
            href={`/join?arm=intervention&locale=${locale}`}
            className="w-full h-11 bg-[#71ad9d] hover:bg-[#609c8d] text-[#132c27] font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-sm active:scale-[0.99] flex justify-center items-center cursor-pointer gap-2"
          >
            ⚡ Instant Study Access (One-Click)
          </a>

          {/* Optional Pre-assigned token toggle for research staff */}
          <div className="pt-3 border-t border-slate-100">
            {mode === 'login' ? (
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-[10px] font-bold text-slate-500 hover:text-[#1d5c64] transition-all cursor-pointer uppercase tracking-wider"
              >
                {locale === 'es' ? 'Reanudar Evaluación: Ingrese Token o ID ↓' : 'Resume Assessment'}
              </button>
            ) : (
              <div className="space-y-3">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const input = (e.currentTarget.elements.namedItem('token') as HTMLInputElement).value.trim();
                  if (input) handleValidation(input);
                }} className="space-y-2.5">
                  <label htmlFor="token-input" className="sr-only">
                    {locale === 'es' ? 'Token o ID de investigación' : 'Token or Research ID'}
                  </label>
                  <input 
                    id="token-input"
                    name="token" 
                    type="text" 
                    placeholder="Token or Research ID (e.g. PEN-PXOVE2)" 
                    required
                    aria-required="true"
                    className="h-10 w-full px-3.5 border border-slate-300 focus:outline-none focus:border-[#1d5c64] font-mono text-center tracking-wider text-slate-900 bg-white placeholder-slate-400 rounded-xl text-xs"
                  />
                  <button 
                    type="submit" 
                    className="h-10 w-full bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all cursor-pointer"
                  >
                    Resume Assessment →
                  </button>
                </form>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[10px] font-bold text-slate-500 hover:text-slate-700 transition-all cursor-pointer uppercase tracking-wider"
                >
                  Hide Token Input
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full max-w-xs text-center">
        <p className="text-[9px] text-slate-600 leading-normal font-normal">
          Security Notice: Session access tokens are private, cryptographically secured, and rate-limited.
        </p>
      </div>
    </main>
  );
}