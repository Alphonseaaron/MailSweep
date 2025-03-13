import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Mail } from 'lucide-react';

export function Login() {
  const { signInWithGoogle, signInWithYahoo, signInWithMicrosoft } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (provider: () => Promise<void>) => {
    try {
      setError(null);
      await provider();
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('auth/popup-blocked')) {
          setError('Please allow popups for this site to sign in');
        } else {
          setError('Failed to sign in. Please try again.');
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Mail className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to MailSweep</h2>
          <p className="mt-2 text-sm text-gray-600">
            Clean up your inbox and unsubscribe from unwanted emails
          </p>
          {error && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
        </div>
        <div className="mt-8 space-y-4">
          <Button
            onClick={() => handleSignIn(signInWithGoogle)}
            className="w-full bg-white text-gray-700 border border-gray-300"
          >
            Continue with Google
          </Button>
          <Button
            onClick={() => handleSignIn(signInWithYahoo)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            Continue with Yahoo
          </Button>
          <Button
            onClick={() => handleSignIn(signInWithMicrosoft)}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white"
          >
            Continue with Microsoft
          </Button>
        </div>
      </div>
    </div>
  );
}