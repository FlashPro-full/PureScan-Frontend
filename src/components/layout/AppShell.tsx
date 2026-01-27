import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar';
import MobileSidebar from '../sidebar/MobileSidebar';
import CustomizableDashboard from '../../pages/CustomizableDashboard';
import Scanner from '../../pages/Scanner';
import Inventory from '../../pages/Inventory';
import SettingsPage from '../../pages/settings/SettingsPage';
import Triggers from '../../pages/Triggers';
import { useSidebar } from '../../contexts/SidebarContext';
import { useTrialReminder } from '../../hooks/useTrialReminder';
import { AdminRoute, UserRoute } from '../../router/RouteGuards';
import { useSession } from '../../contexts/SessionContext';
import { useAuth } from '../../contexts/AuthProvider';
import { Bell, Settings as SettingsIcon, User as UserIcon, Menu, Globe, Volume2, Download, Camera } from 'lucide-react';
import { useI18n } from '../../i18n';
import { useState, useRef, useEffect } from 'react';

interface AppShellProps {
  isAdmin: boolean;
  sessionEmail?: string | null;
}

const AppShell = ({ isAdmin, sessionEmail }: AppShellProps) => {
  const { mobileOpen, setMobileOpen } = useSidebar();
  const { showToast, daysLeft, dismiss } = useTrialReminder(sessionEmail);
  const { user, role } = useSession();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { lang, setLang } = useI18n();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const userMenuRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const avatar = user?.image;

  return (
    <div className="h-screen flex flex-col bg-gray-100 text-gray-900">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white md:hidden">
        <button
          aria-label="Open menu"
          className="inline-flex items-center justify-center p-2 rounded-md border hover:bg-gray-50"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="w-5 h-5 text-gray-800" />
        </button>
        <div className="text-lg font-semibold">PureScan</div>
        <div className="flex items-center gap-2">
          {role === 'admin' && (
            <button
              onClick={() => navigate('/settings?tab=notifications')}
              className="p-2 rounded-lg hover:bg-gray-50"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-red-500" />
            </button>
          )}
          <button
            onClick={() => navigate('/settings')}
            className="p-2 rounded-lg hover:bg-gray-50"
            aria-label="Settings"
          >
            <SettingsIcon className="w-5 h-5 text-gray-600" />
          </button>
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="p-1 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="User menu"
            >
              {avatar ? (
                <img src={avatar} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <UserIcon className="w-6 h-6 text-gray-600" />
              )}
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border rounded-xl shadow-xl z-50 p-4">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  {avatar ? (
                    <img src={avatar} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-red-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="py-3 space-y-1">
                  <button
                    onClick={() => {
                      navigate('/scanner');
                      setUserMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <Camera className="w-4 h-4" />
                    Start Scanning
                  </button>
                  <button
                    onClick={() => {
                      navigate('/settings?tab=data');
                      setUserMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" />
                    Export Data
                  </button>
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Language</span>
                    </div>
                    <select
                      value={lang}
                      onChange={(e) => setLang(e.target.value as any)}
                      className="text-sm border border-gray-200 rounded-md px-2 py-1 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="pt">Português</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Scanner Sounds</span>
                    </div>
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                        soundEnabled ? 'bg-red-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          soundEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <UserIcon className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden h-full">
        <div className="hidden md:block h-full">
          <Sidebar />
        </div>
        <main className="relative flex-1 overflow-y-auto p-6 bg-gray-100">
          {showToast && daysLeft !== null && (
            <TrialToast daysLeft={daysLeft} onDismiss={dismiss} />
          )}

          <Routes>
            <Route path="/" element={<AdminRoute><CustomizableDashboard /></AdminRoute>} />
            <Route path="/inventory" element={<AdminRoute><Inventory /></AdminRoute>} />
            <Route path="/triggers" element={<AdminRoute><Triggers /></AdminRoute>} />
            <Route path="/scanner" element={<UserRoute><Scanner /></UserRoute>} />
            <Route path="/settings" element={<UserRoute><SettingsPage /></UserRoute>} />
            <Route path="*" element={<Navigate to={isAdmin ? '/' : '/scanner'} replace />} />
          </Routes>
        </main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-16 left-4 right-4 bg-white rounded-2xl shadow-2xl max-h-[calc(100vh-6rem)] overflow-hidden">
            <MobileSidebar />
          </div>
        </div>
      )}
    </div>
  );
};

const TrialToast = ({ daysLeft, onDismiss }: { daysLeft: number; onDismiss: () => void }) => (
  <div className="pointer-events-auto fixed bottom-6 right-6 z-50 max-w-sm">
    <div className="rounded-xl border border-red-200 bg-red-50 shadow-md p-4">
      <p className="text-sm text-red-800 font-medium">Trial in progress</p>
      <p className="text-sm text-red-700 mt-1">
        Your trial ends in <span className="font-semibold">{daysLeft}</span> {daysLeft === 1 ? 'day' : 'days'}. Manage billing in Settings.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <a
          href="/settings?tab=subscription"
          className="text-sm px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600"
        >
          Open Settings
        </a>
        <button
          onClick={onDismiss}
          className="text-sm px-3 py-1.5 rounded-lg border border-red-300 text-red-800 hover:bg-red-100"
        >
          Dismiss
        </button>
      </div>
    </div>
  </div>
);

export default AppShell;
