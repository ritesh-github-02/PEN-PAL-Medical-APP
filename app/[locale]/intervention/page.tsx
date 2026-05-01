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
          router.push('/intervention/flow?report=true');
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
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50 flex items-center justify-center p-4 font-sans text-gray-900">
        <div className="max-w-md w-full p-12 bg-white rounded-2xl shadow-lg text-center">
          <div className="w-16 h-16 bg-red-100 flex items-center justify-center mx-auto mb-8 rounded-lg text-2xl font-light text-red-600">!</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Alert</h2>
          <p className="text-gray-600 mb-10 leading-relaxed">{error}</p>
          <button 
            onClick={() => { setError(null); setRequestStatus(null); }}
            className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (requestStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50 flex items-center justify-center p-4 font-sans text-gray-900">
        <div className="max-w-md w-full p-12 bg-white rounded-2xl shadow-lg text-center">
          <div className="w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-8 text-2xl rounded-lg">✓</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Token Ready</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{requestStatus.message}</p>
          
          <div className="p-6 bg-yellow-50 border-2 border-yellow-200 mb-8 select-all cursor-pointer rounded-lg">
             <p className="text-2xl font-mono tracking-widest text-teal-700">{requestStatus.token}</p>
             <p className="text-xs uppercase tracking-tighter text-gray-500 mt-2">Click to select and copy</p>
          </div>

          <button 
            onClick={() => handleValidation(requestStatus.token)}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-lg mb-4 transition"
          >
            Use Token & Start
          </button>
          
          <button 
            onClick={() => setRequestStatus(null)}
            className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // If no token, show a manual entry input
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-900">
      <div className="max-w-md mx-auto w-full space-y-8">
        <div className="space-y-4 text-center">
          <h2 className="text-5xl font-bold text-teal-700">
            PEN-PAL
          </h2>
          <p className="text-gray-700 font-semibold">Parents Engaged in Penicillin Allergies</p>
          <p className="text-lg text-gray-600 leading-relaxed">
            Please enter your secure access token.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-10 sm:p-12">
            <form onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem('token') as HTMLInputElement).value;
              if(input) handleValidation(input);
            }}>
              <input 
                name="token" 
                type="text" 
                placeholder="ENTER TOKEN" 
                required
                className="w-full px-6 py-4 border-2 border-gray-300 focus:outline-none focus:border-teal-600 mb-6 font-mono text-center tracking-wider text-gray-900 bg-white placeholder-gray-400 rounded-lg transition"
              />
              <button 
                type="submit" 
                className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition flex justify-center items-center"
              >
                Enter Study
              </button>
            </form>
          </div>
        </div>

        {/* REQUEST TOKEN SECTION */}
        <div className="pt-8 border-t-2 border-teal-200">
          <div className="text-center mb-6">
             <h3 className="text-sm font-bold text-gray-900">Need a token?</h3>
             <p className="text-xs text-gray-600 mt-2">Generate one using your research ID.</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleRequestToken} className="space-y-4">
              <input 
                name="userId" 
                type="text" 
                placeholder="RESEARCH ID" 
                required
                className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-teal-600 bg-white text-sm font-semibold rounded-lg"
              />
              <button 
                type="submit" 
                className="w-full py-3 border-2 border-teal-600 text-teal-700 hover:bg-teal-50 font-bold text-sm rounded-lg transition"
              >
                Request Access Token
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-4 text-center leading-tight">
              Security: Only one token per ID. Your IP and ID will be logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
