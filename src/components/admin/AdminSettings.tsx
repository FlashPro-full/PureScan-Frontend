import { useState, useEffect } from 'react';
import { Select, SelectItem, Card } from '@tremor/react';
import { Settings, Home, BarChart3, ScanLine, Users, CreditCard } from 'lucide-react';
import { useSession } from '../../contexts/SessionContext';

interface AdminSettingsProps {}

type DefaultScreen = 'dashboard' | 'analytics' | 'scanner' | 'inventory' | 'team' | 'billing';

const screenOptions = [
  { value: 'dashboard', label: 'Dashboard', icon: Home, description: 'Customizable dashboard with widgets' },
  { value: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Sales performance and insights' },
  { value: 'scanner', label: 'Scanner', icon: ScanLine, description: 'Barcode scanning interface' },
  { value: 'inventory', label: 'Inventory', icon: Users, description: 'Product inventory management' },
  { value: 'team', label: 'Team Management', icon: Users, description: 'Manage team members and roles' },
  { value: 'billing', label: 'Billing & Subscription', icon: CreditCard, description: 'Subscription and billing settings' },
];

const AdminSettings = ({}: AdminSettingsProps) => {
  const { role } = useSession();
  const [defaultScreen, setDefaultScreen] = useState<DefaultScreen>('dashboard');

  useEffect(() => {
    // Load saved settings
    const saved = localStorage.getItem('admin-default-screen');
    if (saved && screenOptions.find(opt => opt.value === saved)) {
      setDefaultScreen(saved as DefaultScreen);
    }
  }, []);

  const handleDefaultScreenChange = (screen: DefaultScreen) => {
    setDefaultScreen(screen);
    // Auto-save the setting immediately
    localStorage.setItem('admin-default-screen', screen);
  };

  if (role !== 'admin') {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">Only administrators can access these settings.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Settings</h2>
        <p className="text-gray-600">Configure your account preferences and default behaviors.</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Home className="w-5 h-5" />
              Default Landing Screen
            </h3>
            <p className="text-gray-600 mb-4">
              Choose which screen you see first when you log into PureScan.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Screen
                </label>
                <Select value={defaultScreen} onValueChange={(value) => handleDefaultScreenChange(value as DefaultScreen)}>
                  {screenOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  {(() => {
                    const selectedOption = screenOptions.find(opt => opt.value === defaultScreen);
                    const IconComponent = selectedOption?.icon || Home;
                    return <IconComponent className="w-5 h-5 text-gray-600 mt-0.5" />;
                  })()}
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {screenOptions.find(opt => opt.value === defaultScreen)?.label}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {screenOptions.find(opt => opt.value === defaultScreen)?.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Additional Preferences
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive email alerts for important events</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900">Auto-refresh Dashboard</h4>
              <p className="text-sm text-gray-600">Automatically update data every 5 minutes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="font-medium text-gray-900">Sound Effects</h4>
              <p className="text-sm text-gray-600">Play sounds for scanner feedback and alerts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminSettings;