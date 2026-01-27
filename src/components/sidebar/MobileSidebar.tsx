import { NavLink } from 'react-router-dom';
import { X, BarChart3, Package, Settings as SettingsIcon, Camera, Zap } from 'lucide-react';
import { useI18n } from '../../i18n';
import { useSession } from '../../contexts/SessionContext';
import { useSidebar } from '../../contexts/SidebarContext';
import PureScanLogo from '../../assets/PureScanLogo.png';

const MobileSidebar = () => {
  const { t } = useI18n();
  const { role } = useSession();
  const { setMobileOpen } = useSidebar();

  const navItems = [
    { id: 'scanner', key: 'actions.startScanning', icon: Camera, path: '/scanner' },
    { id: 'dashboard', key: 'nav.dashboard', icon: BarChart3, path: '/' },
    { id: 'inventory', key: 'nav.inventory', icon: Package, path: '/inventory' },
    { id: 'triggers', key: 'nav.triggers', icon: Zap, path: '/triggers' },
    { id: 'settings', key: 'nav.settings', icon: SettingsIcon, path: '/settings' },
  ];

  const availableItems = role === 'user' ? navItems.filter(i => i.id === 'scanner') : navItems;

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img src={PureScanLogo} alt="PureScan logo" className="w-8 h-8 object-contain" />
          <span className="text-xl font-semibold text-gray-900">PureScan</span>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      
      <div className="p-4">
        <nav className="space-y-2">
          {availableItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => {
                const base = 'flex items-center gap-4 px-4 py-3 rounded-xl transition-colors font-medium';
                return isActive 
                  ? `${base} bg-red-500 text-white shadow-lg` 
                  : `${base} text-gray-700 hover:bg-gray-50 hover:text-gray-900`;
              }}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon className="h-6 w-6" />
              <span>{t(item.key)}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MobileSidebar;