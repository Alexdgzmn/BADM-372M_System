import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export const EmailVerificationCallback = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Check URL parameters for verification
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          setStatus('success');
          setMessage('Email verified successfully! You can now use all features.');
          
          // Redirect to main app after 3 seconds
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        } else if (user?.email_confirmed_at) {
          setStatus('success');
          setMessage('Email already verified!');
          
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Invalid verification link or email already verified.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Failed to verify email. Please try again.');
      }
    };

    handleEmailVerification();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-light to-primary/10 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-secondary/10 p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold text-secondary mb-2">Verifying Email</h2>
            <p className="text-secondary/70">Please wait while we verify your email address...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-secondary mb-2">Email Verified!</h2>
            <p className="text-secondary/70 mb-4">{message}</p>
            <div className="text-sm text-secondary/60">
              Redirecting to your dashboard...
            </div>
          </>
        )}
        
        {status === 'error' && (
          <>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-secondary mb-2">Verification Failed</h2>
            <p className="text-secondary/70 mb-4">{message}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-all duration-200"
            >
              Return to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};