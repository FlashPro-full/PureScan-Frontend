import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { apiJson } from '../api/client';
import type { SessionInfo, SessionUser } from './SessionContext';

interface AuthContextType extends SessionInfo {
  signInWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUpWithEmail: (email: string, password: string, attributes?: any) => Promise<{ isSignUpComplete: boolean; nextStep: any }>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  resendSignUpCode: (email: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  role: 'user',
  user: null,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => ({ isSignUpComplete: false, nextStep: null }),
  confirmSignUp: async () => {},
  resendSignUpCode: async () => {},
  resetPassword: async () => {},
  confirmResetPassword: async () => {},
  signOut: async () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<SessionInfo>({
    isAuthenticated: false,
    role: 'user',
    user: null,
  });
  const [loading, setLoading] = useState(true);

  const setSessionFromUser = (user: { id: string; email: string; name: string; role: string }) => {
    const sessionUser: SessionUser = {
      name: user.name || user.email.split('@')[0],
      email: user.email,
      sub: user.id,
      image: null,
    };
    setSession({
      isAuthenticated: true,
      role: user.role === 'admin' ? 'admin' : 'user',
      user: sessionUser,
    });
  };

  const updateAuthState = async () => {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (token) {
        try {
          const data = await apiJson<{ result: boolean; user: { id: string; email: string; name: string; role: string } }>('/auth/me');
          if(data?.result) {
            setSessionFromUser(data?.user);
          }
        } catch (error) {
          localStorage.removeItem('auth_token');
          sessionStorage.removeItem('auth_token');
          setSession({
            isAuthenticated: false,
            role: 'user',
            user: null,
          });
        }
      } else {
        setSession({
          isAuthenticated: false,
          role: 'user',
          user: null,
        });
      }
    } catch (error) {
      console.log('No authenticated user:', error);
      setSession({
        isAuthenticated: false,
        role: 'user',
        user: null,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateAuthState();
  }, []);

  const handleSignInWithEmail = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const result = await apiJson<{ result: boolean; user: { id: string; email: string; name: string; role: string }; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, rememberMe }),
      });
      
      if(result?.result) {
        if (rememberMe) {
          localStorage.setItem('auth_token', result.token);
          sessionStorage.removeItem('auth_token');
        } else {
          sessionStorage.setItem('auth_token', result.token);
          localStorage.removeItem('auth_token');
        }
        setSessionFromUser(result.user);
      } else {
        throw new Error('Login failed');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const handleSignUpWithEmail = async (email: string, password: string, userAttributes: any = {}) => {
    try {
      const result = await apiJson<{ user: { id: string; email: string; name: string; role: string }; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name: userAttributes.name || email.split('@')[0] }),
      });
      
      localStorage.setItem('auth_token', result.token);
      setSessionFromUser(result.user);

      return {
        isSignUpComplete: true,
        nextStep: null
      };
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  };

  const handleConfirmSignUp = async (_email: string, _code: string) => {
    return;
  };

  const handleResendSignUpCode = async (_email: string) => {
    return;
  };

  const handleResetPassword = async (email: string) => {
    try {
      await apiJson('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(error.message || 'Failed to send reset code');
    }
  };

  const handleConfirmResetPassword = async (email: string, code: string, newPassword: string) => {
    try {
      await apiJson('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, code, newPassword }),
      });
    } catch (error: any) {
      console.error('Confirm reset password error:', error);
      throw new Error(error.message || 'Failed to reset password');
    }
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      setSession({
        isAuthenticated: false,
        role: 'user',
        user: null,
      });
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };


  const value: AuthContextType = {
    ...session,
    signInWithEmail: handleSignInWithEmail,
    signUpWithEmail: handleSignUpWithEmail,
    confirmSignUp: handleConfirmSignUp,
    resendSignUpCode: handleResendSignUpCode,
    resetPassword: handleResetPassword,
    confirmResetPassword: handleConfirmResetPassword,
    signOut: handleSignOut,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};