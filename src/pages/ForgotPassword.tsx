import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { ArrowLeft, Mail, Check } from 'lucide-react';
import PureScanLogo from '../assets/PureScanLogo.png';

const ForgotPassword = () => {
  const { resetPassword, confirmResetPassword, loading } = useAuth();
  const [step, setStep] = useState<'request' | 'confirm' | 'success'>('request');
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(formData.email);
      setStep('confirm');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.code.trim() || !formData.newPassword.trim() || !formData.confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmResetPassword(formData.email, formData.code, formData.newPassword);
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please check your code and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-20 h-72 w-72 rounded-full bg-red-200/30 blur-3xl" />
        <div className="absolute top-24 -left-24 h-64 w-64 rounded-full bg-red-100/40 blur-3xl" />
        <div className="absolute -bottom-24 right-10 h-56 w-56 rounded-full bg-red-300/20 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Gradient header */}
          <div className="h-2 bg-gradient-to-r from-red-400 via-red-500 to-red-600" />
          
          <div className="p-8">
            {/* Logo and title */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <img src={PureScanLogo} alt="PureScan logo" className="w-10 h-10 object-contain" />
              <h1 className="text-2xl font-bold text-gray-900">PureScan</h1>
            </div>

            {/* Step: Request Reset */}
            {step === 'request' && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-xl font-semibold text-gray-900">Forgot your password?</h2>
                  <p className="text-gray-600 mt-1">
                    Enter your email address and we'll send you a reset code
                  </p>
                </div>

                {/* Error message */}
                {error && (
                  <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleRequestReset} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors pl-12"
                        placeholder="Enter your email"
                        disabled={isSubmitting}
                        required
                      />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending reset code...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        Send reset code
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Step: Confirm Reset */}
            {step === 'confirm' && (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Check your email</h2>
                  <p className="text-gray-600 mt-1">
                    We sent a reset code to <strong>{formData.email}</strong>
                  </p>
                </div>

                {/* Error message */}
                {error && (
                  <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleConfirmReset} className="space-y-6">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                      Reset code
                    </label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-center text-2xl tracking-wider"
                      placeholder="000000"
                      maxLength={6}
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      New password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      placeholder="Enter new password"
                      disabled={isSubmitting}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long</p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm new password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      placeholder="Confirm new password"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Resetting password...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Reset password
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setStep('request')}
                    className="text-sm text-red-600 hover:text-red-500 font-medium"
                  >
                    Didn't receive the code? Try again
                  </button>
                </div>
              </>
            )}

            {/* Step: Success */}
            {step === 'success' && (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Password reset successful!</h2>
                  <p className="text-gray-600 mt-1">
                    Your password has been updated successfully
                  </p>
                </div>

                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to sign in
                </Link>
              </>
            )}

            {/* Back to sign in link */}
            {step !== 'success' && (
              <div className="mt-8 text-center">
                <Link 
                  to="/login" 
                  className="inline-flex items-center gap-2 text-red-600 hover:text-red-500 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to sign in
                </Link>
              </div>
            )}
          </div>

          {/* Footer */}
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

export default ForgotPassword;