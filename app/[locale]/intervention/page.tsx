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
      const result = await validateToken(tokenToValidate, locale);
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

  // --- ERROR SCREEN ---
  if (error) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-between py-6 px-4 font-sans bg-slate-50">
        <div className="flex-1 flex flex-col justify-center max-w-sm w-full">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6 w-full text-center space-y-4">
            <div className="w-12 h-12 bg-red-50 border border-red-100 flex items-center justify-center mx-auto rounded-xl text-lg font-bold text-red-600 shadow-sm animate-pulse">
              !
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-1">Alert</h2>
              <p className="text-slate-500 leading-normal text-xs font-light">{error}</p>
            </div>
            <button 
              onClick={() => { setError(null); setRequestStatus(null); }}
              className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              Go Back
            </button>
          </div>
        </div>
        
        <div className="w-full max-w-xs text-center">
          <p className="text-[9px] text-slate-400 leading-normal font-light">
            Security Notice: Session access tokens are private, cryptographically secured, and rate-limited.
          </p>
        </div>
      </div>
    );
  }

  // --- TOKEN GENERATED SUCCESS SCREEN ---
  if (requestStatus) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-between py-6 px-4 font-sans bg-slate-50">
        <div className="flex-1 flex flex-col justify-center max-w-sm w-full">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6 w-full text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-lg rounded-xl text-emerald-600 shadow-sm">
              ✓
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900">Token Ready</h2>
              <p className="text-slate-500 text-xs font-light leading-normal">{requestStatus.message}</p>
            </div>
            
            <div className="p-3 bg-slate-55 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors select-all cursor-pointer">
               <p className="text-xs font-mono tracking-wider text-slate-800 break-all font-semibold">{requestStatus.token}</p>
               <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1.5">Click to select and copy</p>
            </div>

            <div className="space-y-2 pt-1">
              <button 
                onClick={() => handleValidation(requestStatus.token)}
                className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all shadow-md active:scale-[0.98] cursor-pointer flex justify-center items-center"
              >
                Use Token & Start
              </button>
              
              <button 
                onClick={() => { setRequestStatus(null); setMode('login'); }}
                className="block w-full text-center text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        <div className="w-full max-w-xs text-center">
          <p className="text-[9px] text-slate-400 leading-normal font-light">
            Security Notice: Session access tokens are private, cryptographically secured, and rate-limited.
          </p>
        </div>
      </div>
    );
  }

  // --- MAIN COMPACT PORTAL ENTRY FORM ---
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-between py-6 px-4 font-sans text-slate-800 bg-slate-50">
      <div className="flex-1 flex flex-col justify-center max-w-sm w-full space-y-5">
        {/* App Branding Header */}
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display">
            PEN-PAL
          </h2>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full inline-block shadow-sm">
              Parents Engaged in Penicillin Allergies
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-xs mx-auto font-light">
            Access the clinical assessment suite securely.
          </p>
        </div>

        {/* Single Form Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6 w-full">
          {mode === 'login' ? (
            /* ACCESS FORM */
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded inline-block">
                  Secure Access
                </span>
                <h3 className="text-base font-bold text-slate-800 mt-2">Enter Study Token</h3>
                <p className="text-[11px] text-slate-500 mt-1 font-light leading-normal">
                  Provide your 10-character research token to continue.
                </p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const input = (e.currentTarget.elements.namedItem('token') as HTMLInputElement).value.trim();
                if(input) handleValidation(input);
              }} className="space-y-2.5">
                <input 
                  name="token" 
                  type="text" 
                  placeholder="PEN-ABCDEF" 
                  required
                  className="h-10 w-full px-3.5 border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 font-mono text-center tracking-wider text-slate-900 bg-white placeholder-slate-400 rounded-lg transition-all text-xs"
                />
                <button 
                  type="submit" 
                  className="h-10 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all shadow-md active:scale-[0.99] flex justify-center items-center cursor-pointer"
                >
                  Enter Study →
                </button>
              </form>

              <div className="text-center pt-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-all cursor-pointer uppercase tracking-wider hover:underline"
                >
                  Create token if you are new
                </button>
              </div>
            </div>
          ) : (
            /* REGISTRATION / GENERATE TOKEN FORM */
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded inline-block">
                  Registration
                </span>
                <h3 className="text-base font-bold text-slate-800 mt-2">Need a Token?</h3>
                <p className="text-[11px] text-slate-500 mt-1 font-light leading-normal">
                  Generate a secure access token instantly by entering your unique research identifier.
                </p>
              </div>

              <form onSubmit={handleRequestToken} className="space-y-2.5">
                <input 
                  name="userId" 
                  type="text" 
                  placeholder="RESEARCH ID" 
                  required
                  className="h-10 w-full px-3.5 border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 text-center text-xs font-semibold tracking-wider bg-white text-slate-900 placeholder-slate-400 uppercase rounded-lg transition-all"
                />
                <button 
                  type="submit" 
                  className="h-10 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all shadow-md active:scale-[0.99] flex justify-center items-center cursor-pointer"
                >
                  Request Access Token
                </button>
              </form>

              <div className="text-center pt-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-all cursor-pointer uppercase tracking-wider hover:underline"
                >
                  Already have a token? Log in
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-xs text-center">
        <p className="text-[9px] text-slate-400 leading-normal font-light">
          Security Notice: Session access tokens are private, cryptographically secured, and rate-limited.
        </p>
      </div>
    </div>
  );
}