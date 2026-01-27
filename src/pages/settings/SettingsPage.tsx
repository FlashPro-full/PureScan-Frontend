import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  CreditCard, 
  Database, 
  Globe, 
  Users, 
  Volume2, 
  LayoutDashboard,
  ChevronRight 
} from 'lucide-react';
import { useI18n } from '../../i18n';
import type { Lang } from '../../i18n';
import { useSession } from '../../contexts/SessionContext';
import SubscriptionSettings from './components/SubscriptionSettings';
import DataExport from './components/DataExport';
import TeamManagement from '../../components/admin/TeamManagement';
import AdminSettings from '../../components/admin/AdminSettings';

const baseTabs = [
  { id: 'team', label: 'Team', icon: Users },
  { id: 'subscription', label: 'Subscription', icon: CreditCard },
  { id: 'sounds', label: 'Sounds & Notifications', icon: Volume2 },
  { id: 'dashboard', label: 'Default Dashboard', icon: LayoutDashboard },
  { id: 'language', label: 'Language', icon: Globe },
  { id: 'data', label: 'Data Export', icon: Database },
] as const;

const userTabs = [
  { id: 'sounds', label: 'Sounds & Notifications', icon: Volume2 },
  { id: 'language', label: 'Language', icon: Globe },
  { id: 'data', label: 'Data Export', icon: Database },
] as const;

type TabId = (typeof baseTabs)[number]['id'];

const SettingsPage = () => {
  const { lang, setLang } = useI18n();
  const { role } = useSession();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabs = role === 'admin' ? baseTabs : userTabs;
  const tabIds = useMemo(() => tabs.map((tab) => tab.id) as TabId[], [tabs]);

  const initialTab = useMemo<TabId>(() => {
    const raw = searchParams.get('tab');
    const defaultTab: TabId = role === 'admin' ? 'team' : 'sounds';
    const requested = (raw as TabId) || defaultTab;
    return tabIds.includes(requested) ? requested : defaultTab;
  }, [searchParams, tabIds, role]);

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (!tabIds.includes(activeTab)) {
      setActiveTab(tabIds[0] || 'language');
      return;
    }
    if (tabIds.includes(initialTab) && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, tabIds, activeTab]);

  const handleTabClick = (tabId: TabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  return (
    <div 
      className="min-h-screen" 
      style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f7f9fc' }}
    >
      <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <header className="mb-8 lg:mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-lg text-gray-500">
            Manage your account, preferences, and team configuration.
          </p>
        </header>

        {/* Main Settings Grid */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-4">
          
          {/* Settings Navigation Sidebar (Left Column) */}
          <nav className="lg:col-span-1 border-r border-gray-100 p-4 sm:p-6 bg-gray-50/50">
            <div className="space-y-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`w-full flex items-center p-3 text-sm rounded-lg transition-all duration-150 ease-in-out border-l-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 ${
                      isActive
                        ? 'bg-red-500 text-white border-red-500 font-semibold hover:bg-red-600 active:bg-red-700 shadow-md'
                        : 'text-red-700 border-transparent hover:bg-red-100 hover:text-red-800 hover:shadow-md active:bg-red-200 active:shadow-sm'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mr-3" />
                    <span className="flex-1 text-left">{tab.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Settings Content Area (Right Columns) */}
          <div className="lg:col-span-3 p-4 sm:p-8">
            
            {/* Team Settings */}
            {activeTab === 'team' && role === 'admin' && (
              <div className="settings-panel">
                <h2 className="text-2xl font-semibold text-gray-900 border-b pb-4 mb-6">Team Management</h2>
                <p className="text-gray-600 mb-6">Manage roles and permissions for all users in your workspace.</p>
                
                <div className="bg-red-50/20 p-6 rounded-xl border border-red-200/50 shadow-sm">
                  <TeamManagement />
                </div>
              </div>
            )}

            {/* Subscription Settings */}
            {activeTab === 'subscription' && role === 'admin' && (
              <div className="settings-panel">
                <h2 className="text-2xl font-semibold text-gray-900 border-b pb-4 mb-6">Subscription & Billing</h2>
                <p className="text-gray-600 mb-6">View your current plan, usage, and manage payment details.</p>
                
                <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                  <SubscriptionSettings />
                </div>
              </div>
            )}

            {/* Sounds & Notifications Settings */}
            {activeTab === 'sounds' && (
              <div className="settings-panel">
                <h2 className="text-2xl font-semibold text-gray-900 border-b pb-4 mb-6">Sounds & Notifications</h2>
                <p className="text-gray-600 mb-6">Customize audio alerts for key events in the app.</p>
                
                <div className="space-y-6">
                  {/* Successful Outcomes (Keep) */}
                  <div className="bg-red-50/20 p-6 rounded-xl border border-red-200/50 shadow-sm">
                    <h4 className="text-xl font-semibold text-red-500 mb-4 pb-2 border-b border-red-500/10">
                      Successful Outcomes (Keep)
                    </h4>
                    
                    <div className="space-y-4">
                      {/* Keep: FBA Sound */}
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div>
                          <p className="font-medium text-gray-900">Keep: FBA Sound</p>
                          <p className="text-sm text-gray-500">Audio for item routed to FBA (Buy Box price profitable).</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <select className="py-1.5 pl-3 pr-8 text-sm border-gray-300 focus:ring-red-500 focus:border-red-500 rounded-lg border">
                            <option>Chime (Default)</option>
                            <option>Ding</option>
                            <option>Success Harp</option>
                          </select>
                          <button className="text-red-600 hover:text-red-800 hover:bg-red-50 hover:shadow-md active:bg-red-100 active:shadow-sm transition-all duration-150 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Keep: MF Sound */}
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div>
                          <p className="font-medium text-gray-900">Keep: MF Sound</p>
                          <p className="text-sm text-gray-500">Audio for item routed to MF (Lowest MF price profitable).</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <select className="py-1.5 pl-3 pr-8 text-sm border-gray-300 focus:ring-red-500 focus:border-red-500 rounded-lg border">
                            <option>Ding</option>
                            <option>Chime (Default)</option>
                            <option>Success Harp</option>
                          </select>
                          <button className="text-red-600 hover:text-red-800 hover:bg-red-50 hover:shadow-md active:bg-red-100 active:shadow-sm transition-all duration-150 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Keep: SBYB Sound */}
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div>
                          <p className="font-medium text-gray-900">Keep: SBYB Sound</p>
                          <p className="text-sm text-gray-500">Audio for item routed to Sell Back (SBYB payout available).</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <select className="py-1.5 pl-3 pr-8 text-sm border-gray-300 focus:ring-red-500 focus:border-red-500 rounded-lg border">
                            <option>Short Beep</option>
                            <option>Chime (Default)</option>
                            <option>Ding</option>
                          </select>
                          <button className="text-red-600 hover:text-red-800 hover:bg-red-50 hover:shadow-md active:bg-red-100 active:shadow-sm transition-all duration-150 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Failure Outcome (Reject) */}
                  <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                      Failure Outcome (Reject)
                    </h4>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">Reject Sound</p>
                        <p className="text-sm text-gray-500">Audio for item that fails all profit/hit list checks.</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <select className="py-1.5 pl-3 pr-8 text-sm border-gray-300 focus:ring-red-500 focus:border-red-500 rounded-lg border bg-white">
                          <option>Error Buzz (Default)</option>
                          <option>Low Tone</option>
                          <option>Warning Beep</option>
                        </select>
                        <button className="text-red-600 hover:text-red-800 transition p-2 rounded-full hover:bg-red-50">
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Default Dashboard Settings */}
            {activeTab === 'dashboard' && role === 'admin' && (
              <div className="settings-panel">
                <h2 className="text-2xl font-semibold text-gray-900 border-b pb-4 mb-6">Default Dashboard</h2>
                <p className="text-gray-600 mb-6">Configure the default dashboard layout and widgets for new users.</p>
                
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                  <AdminSettings />
                </div>
              </div>
            )}

            {/* Language Settings */}
            {activeTab === 'language' && (
              <div className="settings-panel">
                <h2 className="text-2xl font-semibold text-gray-900 border-b pb-4 mb-6">Language</h2>
                <p className="text-gray-600 mb-6">Select the primary display language for the PureScan application.</p>
                
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="max-w-md">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Language
                    </label>
                    <div className="relative">
                      <select
                        value={lang}
                        onChange={(event) => setLang(event.target.value as Lang)}
                        className="block w-full py-3 pl-4 pr-10 text-base border-gray-300 rounded-lg transition duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm border bg-white"
                      >
                        <option value="en">🇺🇸 English (United States)</option>
                        <option value="es">🇪🇸 Español (España)</option>
                        <option value="fr">🇫🇷 Français (France)</option>
                        <option value="de">🇩🇪 Deutsch (Deutschland)</option>
                        <option value="pt">🇵🇹 Português (Portugal)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Export Settings */}
            {activeTab === 'data' && (
              <div className="settings-panel">
                <h2 className="text-2xl font-semibold text-gray-900 border-b pb-4 mb-6">Data Export</h2>
                <p className="text-gray-600 mb-6">Export your scan data, inventory, and analytics reports.</p>
                
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                  <DataExport />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;