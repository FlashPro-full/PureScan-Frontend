import { useMemo, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { I18nProvider } from './i18n';
import { SessionContext } from './contexts/SessionContext';
import { SidebarContext } from './contexts/SidebarContext';
import { AuthProvider, useAuth } from './contexts/AuthProvider';
import { ToastProvider } from './contexts/ToastContext';
import AppShell from './components/layout/AppShell';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import UserOnboarding from './components/onboarding/UserOnboarding';

const AppContent = () => {
  const { isAuthenticated, role, user, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarValue = useMemo(
    () => ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }),
    [collapsed, mobileOpen],
  );

  const sessionValue = {
    isAuthenticated,
    role,
    user,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <I18nProvider>
      <SessionContext.Provider value={sessionValue}>
        <SidebarContext.Provider value={sidebarValue}>
          <BrowserRouter>
            <Routes>
              <Route
                path="/*"
                element={<AppShell isAdmin={role === 'admin'} sessionEmail={user?.email || null} />}
              />
            </Routes>
          </BrowserRouter>
          <UserOnboarding />
        </SidebarContext.Provider>
      </SessionContext.Provider>
    </I18nProvider>
  );
};

const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
