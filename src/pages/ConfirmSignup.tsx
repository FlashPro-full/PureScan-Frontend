import { useState } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { Check, Mail, ArrowLeft } from 'lucide-react';
import PureScanLogo from '../assets/PureScanLogo.png';

interface ConfirmSignupProps {
  email: string;
  password: string;
  onBack: () => void;
}

const ConfirmSignup = ({ email, password, onBack }: ConfirmSignupProps) => {
  const { confirmSignUp, resendSignUpCode, signInWithEmail, loading } = useAuth();
  const [formData, setFormData] = useState({
    code: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.replace(/\D/g, '').slice(0, 6)
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.code.trim() || formData.code.length < 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmSignUp(email, formData.code);
      await signInWithEmail(email, password);
      setSuccess(true);
    } catch (err: any) {
      if (err.name === 'CodeMismatchException') {
        setError('Invalid verification code. Please check and try again.');
      } else if (err.name === 'ExpiredCodeException') {
        setError('Verification code has expired. Please request a new code.');
      } else {
        setError(err.message || 'Verification failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setIsResending(true);
    try {
      await resendSignUpCode(email);
      setError(null);
      const temp = error;
      setError('New verification code sent to your email!');
      setTimeout(() => setError(temp), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-green-400 via-green-500 to-green-600" />
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to PureScan!</h2>
              <p className="text-gray-600 mb-6">
                Your account has been verified successfully. You're now signed in and ready to start scanning.
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Redirecting to your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-20 h-72 w-72 rounded-full bg-red-200/30 blur-3xl" />
        <div className="absolute top-24 -left-24 h-64 w-64 rounded-full bg-red-100/40 blur-3xl" />
        <div className="absolute -bottom-24 right-10 h-56 w-56 rounded-full bg-red-300/20 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-red-400 via-red-500 to-red-600" />
          <div className="p-8">
            <div className="flex items-center justify-center gap-3 mb-8">
              <img src={PureScanLogo} alt="PureScan logo" className="w-10 h-10 object-contain" />
              <h1 className="text-2xl font-bold text-gray-900">PureScan</h1>
            </div>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Check your email</h2>
              <p className="text-gray-600 mt-1">
                We sent a verification code to <strong>{email}</strong>
              </p>
            </div>

            {error && (
              <div className={`mb-6 p-4 rounded-lg border ${
                error.includes('sent to your email') 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <p className={`text-sm ${
                  error.includes('sent to your email') 
                    ? 'text-green-700' 
                    : 'text-red-700'
                }`}>
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification code
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-center text-2xl tracking-wider font-mono"
                  placeholder="000000"
                  maxLength={6}
                  disabled={isSubmitting}
                  required
                  autoComplete="one-time-code"
                />
                <p className="text-xs text-gray-500 mt-1">Enter the 6-digit code from your email</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || loading || formData.code.length < 6}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Verify & Complete Signup
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm mb-2">Didn't receive the code?</p>
              <button
                onClick={handleResendCode}
                disabled={isResending || isSubmitting}
                className="text-red-600 hover:text-red-500 font-medium text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {isResending ? 'Sending...' : 'Resend verification code'}
              </button>
            </div>

            <div className="mt-8 text-center">
              <button 
                onClick={onBack}
                className="inline-flex items-center gap-2 text-red-600 hover:text-red-500 font-medium"
                disabled={isSubmitting}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to signup
              </button>
            </div>
          </div>

          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              © {new Date().getFullYear()} PureScan. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSignup;