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
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans bg-slate-50">
        <div className="absolute -top-40 -left-40 w-[40rem] h-[40rem] bg-teal-500/5 rounded-full filter blur-[120px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-[40rem] h-[40rem] bg-indigo-500/5 rounded-full filter blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-md w-full p-8 sm:p-10 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-xl text-center relative z-10">
          <div className="w-16 h-16 bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-6 rounded-2xl text-2xl font-bold text-red-600 shadow-sm">
            !
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Alert</h2>
          <p className="text-slate-600 mb-8 leading-relaxed text-sm font-light">{error}</p>
          <button 
            onClick={() => { setError(null); setRequestStatus(null); }}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // --- TOKEN GENERATED SUCCESS SCREEN ---
  if (requestStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans bg-slate-50">
        <div className="absolute -top-40 -left-40 w-[40rem] h-[40rem] bg-teal-500/5 rounded-full filter blur-[120px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-[40rem] h-[40rem] bg-indigo-500/5 rounded-full filter blur-[120px] pointer-events-none"></div>

        <div className="max-w-md w-full p-8 sm:p-10 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-xl text-center relative z-10 space-y-6">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-2xl rounded-2xl text-emerald-600 shadow-sm">
            ✓
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">Token Ready</h2>
            <p className="text-slate-600 text-sm font-light leading-relaxed">{requestStatus.message}</p>
          </div>
          
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100/70 transition-colors select-all cursor-pointer">
             <p className="text-sm font-mono tracking-wider text-teal-800 break-all font-semibold">{requestStatus.token}</p>
             <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2">Click to select and copy</p>
          </div>

          <div className="space-y-3 pt-2">
            <button 
              onClick={() => handleValidation(requestStatus.token)}
              className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              Use Token & Start
            </button>
            
            <button 
              onClick={() => setRequestStatus(null)}
              className="block w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN COMPACT PORTAL ENTRY FORM ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-800 relative bg-slate-50 overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute -top-40 -left-40 w-[40rem] h-[40rem] bg-teal-500/5 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-[40rem] h-[40rem] bg-indigo-500/5 rounded-full filter blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto w-full space-y-8 relative z-10 flex flex-col items-center">
        {/* App Branding Header */}
        <div className="space-y-3 text-center">
          <h2 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-teal-700 via-teal-600 to-indigo-800 bg-clip-text text-transparent tracking-tight">
            PEN-PAL
          </h2>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full inline-block shadow-sm">
              Parents Engaged in Penicillin Allergies
            </span>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto pt-1 font-light">
            Access the clinical assessment suite securely. Enter your existing research token or generate a new one below.
          </p>
        </div>

        {/* Compact Two-Column Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch w-full">
          
          {/* ACCESS CARD */}
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-lg p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-xl">
            <div className="space-y-6">
              <div className="text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-md inline-block">
                  Secure Access
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-3">Enter Study Token</h3>
                <p className="text-xs text-slate-500 mt-1.5 font-light leading-relaxed">
                  Provide your 64-character research token to continue where you left off or start.
                </p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const input = (e.currentTarget.elements.namedItem('token') as HTMLInputElement).value.trim();
                if(input) handleValidation(input);
              }} className="space-y-3">
                <input 
                  name="token" 
                  type="text" 
                  placeholder="PEN-cmpebbxnt..." 
                  required
                  className="h-12 w-full px-4 border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 font-mono text-center tracking-wider text-slate-900 bg-white placeholder-slate-400 rounded-xl transition-all text-xs"
                />
                <button 
                  type="submit" 
                  className="h-12 w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-[0.99] flex justify-center items-center cursor-pointer"
                >
                  Enter Study →
                </button>
              </form>
            </div>
            
            <p className="text-[10px] text-slate-400 text-center leading-relaxed mt-6 pt-4 border-t border-slate-100 font-light">
              Security Notice: Session access tokens are private and cryptographically linked to your secure clinical assessment record.
            </p>
          </div>

          {/* REQUEST REGISTRATION CARD */}
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-lg p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-xl">
            <div className="space-y-6">
              <div className="text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md inline-block">
                  Registration
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-3">Need a Token?</h3>
                <p className="text-xs text-slate-500 mt-1.5 font-light leading-relaxed">
                  Generate a secure access token instantly by entering your unique research identifier.
                </p>
              </div>

              <form onSubmit={handleRequestToken} className="space-y-3">
                <input 
                  name="userId" 
                  type="text" 
                  placeholder="RESEARCH ID" 
                  required
                  className="h-12 w-full px-4 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-center text-xs font-semibold tracking-wider bg-white text-slate-900 placeholder-slate-400 uppercase rounded-xl transition-all"
                />
                <button 
                  type="submit" 
                  className="h-12 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-[0.99] flex justify-center items-center cursor-pointer"
                >
                  Request Access Token
                </button>
              </form>
            </div>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed mt-6 pt-4 border-t border-slate-100 font-light">
              Security Notice: Only one token is issued per unique Research ID. Your session, IP fingerprint, and access attempts are cryptographically secured.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}