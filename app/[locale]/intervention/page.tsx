'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    // If we have a token in URL, try auto-validate
    if (token) {
      handleValidation(token);
    }
  }, [token]);

  const handleValidation = async (tokenToValidate: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await validateToken(tokenToValidate, locale);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else if (result?.success) {
        if (result.isCompleted) {
          router.push('/intervention/report');
        } else {
          router.push('/intervention/flow');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRequestToken = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const userId = (e.currentTarget.elements.namedItem('userId') as HTMLInputElement).value;
    
    try {
      const result = await requestToken(userId);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else if (result?.success) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-zinc-900">
        <div className="max-w-md w-full p-12 bg-white border border-zinc-200 text-center">
          <div className="w-16 h-16 border border-zinc-200 flex items-center justify-center mx-auto mb-8 text-2xl font-light text-zinc-900">!</div>
          <h2 className="text-3xl font-light text-zinc-900 mb-4 tracking-tight">System Message</h2>
          <p className="text-zinc-500 mb-10 leading-relaxed font-light">{error}</p>
          <button 
            onClick={() => { setError(null); setRequestStatus(null); }}
            className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest border-t border-zinc-100 pt-6 hover:text-zinc-500 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (requestStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-zinc-900">
        <div className="max-w-md w-full p-12 bg-white border border-zinc-200 text-center">
          <div className="w-16 h-16 bg-zinc-900 flex items-center justify-center mx-auto mb-8 text-2xl font-light text-white">✓</div>
          <h2 className="text-3xl font-light text-zinc-900 mb-2 tracking-tight">Token Ready</h2>
          <p className="text-zinc-500 mb-6 leading-relaxed font-light">{requestStatus.message}</p>
          
          <div className="p-6 bg-zinc-50 border border-zinc-100 mb-8 select-all cursor-pointer group">
             <p className="text-2xl font-mono tracking-widest text-zinc-900 group-hover:text-zinc-600 transition-colors">{requestStatus.token}</p>
             <p className="text-[9px] uppercase tracking-tighter text-zinc-400 mt-2 italic">Click to select and copy</p>
          </div>

          <button 
            onClick={() => handleValidation(requestStatus.token)}
            className="w-full py-5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest transition-colors flex justify-center items-center mb-4"
          >
            Use Token & Start →
          </button>
          
          <button 
            onClick={() => setRequestStatus(null)}
            className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // If no token, show a manual entry input
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans text-zinc-900">
      <div className="max-w-md mx-auto w-full space-y-12">
        <div className="space-y-4 text-center">
          <h2 className="text-5xl font-light text-zinc-900 tracking-tight">
            PEN-PAL <span className="font-medium">Study</span>
          </h2>
          <p className="text-lg text-zinc-500 font-light leading-relaxed">
            Please enter your secure access token.
          </p>
        </div>

        <div className="bg-white border border-zinc-200">
          <div className="p-10 sm:p-12">
            <form onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem('token') as HTMLInputElement).value;
              if(input) handleValidation(input);
            }}>
              <input 
                name="token" 
                type="text" 
                placeholder="TOKEN" 
                required
                className="w-full px-6 py-5 border border-zinc-200 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 mb-8 font-mono text-center tracking-widest text-zinc-900 bg-white placeholder-zinc-300 transition-colors"
              />
              <button 
                type="submit" 
                className="w-full py-5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest transition-colors flex justify-center items-center"
              >
                Enter Study →
              </button>
            </form>
          </div>
        </div>

        {/* REQUEST TOKEN SECTION */}
        <div className="pt-8 border-t border-zinc-200">
          <div className="text-center mb-8">
             <h3 className="text-sm font-medium text-zinc-900 uppercase tracking-widest">Need a token?</h3>
             <p className="text-xs text-zinc-500 mt-2 font-light">Generate one using your research ID.</p>
          </div>
          
          <div className="bg-white/50 border border-zinc-200 p-8">
            <form onSubmit={handleRequestToken} className="space-y-4">
              <input 
                name="userId" 
                type="text" 
                placeholder="YOUR RESEARCH ID" 
                required
                className="w-full px-4 py-3 border border-zinc-200 focus:outline-none focus:border-zinc-900 bg-white/80 text-xs tracking-wider"
              />
              <button 
                type="submit" 
                className="w-full py-3 border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all"
              >
                Request Access Token
              </button>
            </form>
            <p className="text-[9px] text-zinc-400 mt-4 text-center leading-tight">
              Security Notice: Only one token is permitted per ID. Your IP and ID will be logged for audit purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
