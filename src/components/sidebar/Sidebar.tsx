import {
  BarChart3,
  Scan,
  Package,
  Settings as SettingsIcon,
  Bell,
  Camera,
  User as UserIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { useSession } from '../../contexts/SessionContext';
import { useAuth } from '../../contexts/AuthProvider';
import { useSidebar } from '../../contexts/SidebarContext';
import PureScanLogo from '../../assets/PureScanLogo.png';

type BaseNavItem = {
  id: string;
  key: string;
  icon: LucideIcon;
  path: string;
};

type SidebarNavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
};

const baseNav: BaseNavItem[] = [
  { id: 'dashboard', key: 'nav.dashboard', icon: BarChart3, path: '/' },
  { id: 'scanner', key: 'nav.scanner', icon: Scan, path: '/scanner' },
  { id: 'inventory', key: 'nav.inventory', icon: Package, path: '/inventory' },
  { id: 'settings', key: 'nav.settings', icon: SettingsIcon, path: '/settings' },
];

const Sidebar = () => {
  const { t } = useI18n();
  const { user, role } = useSession();
  const { signOut } = useAuth();
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const navItems: SidebarNavItem[] = baseNav.map((n) => ({
    id: n.id,
    label: t(n.key),
    icon: n.icon,
    path: n.path,
  }));
  const navItemsById = navItems.reduce<Record<string, SidebarNavItem>>((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});
  // Order to match requested layout. "Start Scanning" is first under brand.
  const orderedItems: SidebarNavItem[] = [
    { id: 'scanner', label: t('actions.startScanning'), icon: Camera, path: '/scanner' },
    navItemsById['dashboard'],
    navItemsById['inventory'],
    navItemsById['settings'],
  ].filter((item): item is SidebarNavItem => Boolean(item));

  // iconBg no longer used with new style

  const email = (user?.email || undefined) || 'user@example.com';
  const displayName = (user?.name || undefined) || email?.split('@')[0];
  const avatar = (user?.image || undefined) || '';

  const widthClass = mobileOpen ? 'w-64' : (collapsed ? 'w-16' : 'w-64');
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav
      className={`${widthClass} bg-gray-100 p-4 h-full flex flex-col justify-between shadow-xl transition-all duration-300 ease-in-out overflow-visible relative z-40`}
    >
        <div className={`pb-4 mb-4 border-b border-gray-200 flex items-center ${collapsed ? 'justify-center' : 'justify-between'} `}>
          <button
            onClick={() => navigate((email || '').toLowerCase().startsWith('admin') ? '/' : '/scanner')}
            className={`inline-flex items-center gap-3 px-2 py-1 rounded-lg ${collapsed ? 'w-10' : 'w-auto'}`}
            aria-label="Home"
          >
            <span className="inline-flex items-center justify-center w-8 h-8">
              <img src={PureScanLogo} alt="PureScan logo" className="w-8 h-8 object-contain" />
            </span>
            {!collapsed && <span className="text-2xl font-semibold text-gray-800 tracking-tight">PureScan</span>}
          </button>
          {/* top-right spacer to balance layout */}
          <div className="w-6 h-6" />
        </div>
        {/* No quick actions here; links appear in the ordered list below */}
      
    {/* Nav items in requested order */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <nav className="space-y-2">
          {(role === 'user' ? orderedItems.filter(i => i.id === 'scanner') : orderedItems).map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => {
                const base = 'flex items-center gap-4 py-3 rounded-lg transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50';
                const active = 'bg-red-500 text-white shadow-lg hover:bg-red-600 active:bg-red-700';
                const inactiveCollapsed = 'text-gray-900 hover:bg-gray-200 active:bg-gray-300';
                const inactiveExpanded = 'text-gray-600 hover:bg-gray-200 active:bg-gray-300';
                const align = collapsed ? 'justify-center gap-0' : '';
                const pad = collapsed ? 'px-0' : 'px-4';
                const tone = collapsed ? inactiveCollapsed : inactiveExpanded;
                return `${base} ${pad} ${align} ${isActive ? active : tone}`;
              }}
              end={item.path === ""}
              onClick={() => { if (mobileOpen) setMobileOpen(false); }}
            >
              <item.icon className={`h-6 w-6 ${/* icon color based on active via parent text */''} ${collapsed ? '' : ''}`} />
              {!collapsed && <span className="font-medium truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
      
      

      

  {/* Bottom area: icons row + close/collapse */}
  <div className="pt-6 mt-auto border-t border-gray-200">
    {/* Mobile icons row - now unused since moved to header */}
    <div className="flex items-center gap-2 md:hidden">
      <button
        className="p-2 rounded-lg hover:bg-red-50 hover:shadow-md active:bg-red-100 active:shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        onClick={() => { navigate('/settings'); if (mobileOpen) setMobileOpen(false); }}
        aria-label="Settings"
        title="Settings"
      >
        <SettingsIcon className="w-5 h-5 text-gray-900" />
      </button>
      <button
        className="p-2 rounded-lg hover:bg-red-50 hover:shadow-md active:bg-red-100 active:shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        onClick={() => { navigate('/settings?tab=notifications'); if (mobileOpen) setMobileOpen(false); }}
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-red-600" />
      </button>
      <div className="flex-1" />
      {/* Profile menu trigger */}
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setMenuOpen(v => !v)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="p-1.5 rounded-full hover:bg-red-50 hover:shadow-md active:bg-red-100 active:shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          title="Account"
        >
          {avatar ? (
            <img src={avatar} alt={displayName || 'User'} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <UserIcon className="w-6 h-6 text-black" />
          )}
        </button>
        {menuOpen && (
          <div className="absolute left-2 right-2 bottom-16 w-auto max-w-[calc(100vw-1rem)] bg-white border rounded-xl shadow-lg p-3 z-50 md:left-auto md:right-2 md:bottom-12 md:max-w-none md:w-64">
            <div className="px-2 py-2">
              <div className="flex items-center gap-2">
                {avatar ? (
                  <img src={avatar} alt={displayName || 'User'} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-sm">
                    {(displayName || 'U').slice(0,1).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500">Signed in as</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{email}</p>
                </div>
              </div>
            </div>
            <div className="border-t my-2" />
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setMenuOpen(false); navigate('/settings'); if (mobileOpen) setMobileOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                Settings
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  if (mobileOpen) setMobileOpen(false);
                  handleSignOut();
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-[#ED1C24]"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    {/* Desktop icons and controls */}
    <div className="hidden md:block mt-3">
      {collapsed ? (
        <div className="flex flex-col items-center gap-2">
          <button
            className="p-2 rounded-lg hover:bg-red-50 hover:shadow-md active:bg-red-100 active:shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            onClick={() => { navigate('/settings'); }}
            aria-label="Settings"
            title="Settings"
          >
            <SettingsIcon className="w-5 h-5 text-gray-900" />
          </button>
          <button
            className="p-2 rounded-lg hover:bg-red-50 hover:shadow-md active:bg-red-100 active:shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            onClick={() => { navigate('/settings?tab=notifications'); }}
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-red-600" />
          </button>
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(v => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="p-1.5 hover:bg-red-50 hover:shadow-md active:bg-red-100 active:shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              title="Account"
            >
              {avatar ? (
                <img src={avatar} alt={displayName || 'User'} referrerPolicy="no-referrer" className="w-8 h-8 object-cover md:rounded-none" />
              ) : (
                <UserIcon className="w-6 h-6 text-black" />
              )}
            </button>
          {menuOpen && (
              <div className="absolute left-full ml-2 bottom-12 w-64 bg-white border rounded-xl shadow-lg p-3 z-50">
                <div className="px-2 py-2">
                  <div className="flex items-center gap-2">
                    {avatar ? (
                      <img src={avatar} alt={displayName || 'User'} referrerPolicy="no-referrer" className="w-8 h-8 object-cover md:rounded-none" />
                    ) : (
                      <div className="w-8 h-8 md:rounded-none bg-gray-100 flex items-center justify-center text-gray-600 text-sm">
                        {(displayName || 'U').slice(0,1).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                      <p className="text-xs text-gray-500 truncate">{email}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t my-2" />
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { setMenuOpen(false); navigate('/settings'); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 hover:shadow-sm active:bg-gray-100 active:shadow-none text-gray-700 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                  >
                    Settings
                  </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        handleSignOut();
                      }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 hover:shadow-sm active:bg-red-100 active:shadow-none text-[#ED1C24] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(false)}
            className="w-10 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-50 hover:shadow-md active:bg-red-100 active:shadow-sm text-gray-800 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            aria-label="Expand sidebar"
            title="Expand"
          >
            <span className="text-lg">&gt;</span>
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-lg hover:bg-red-50 hover:shadow-md active:bg-red-100 active:shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              onClick={() => { navigate('/settings'); }}
              aria-label="Settings"
              title="Settings"
            >
              <SettingsIcon className="w-5 h-5 text-gray-900" />
            </button>
            <button
              className="p-2 rounded-lg hover:bg-red-50 hover:shadow-md active:bg-red-100 active:shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              onClick={() => { navigate('/settings?tab=notifications'); }}
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-red-600" />
            </button>
            <div className="flex-1" />
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen(v => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="p-1.5 hover:bg-red-50 hover:shadow-md active:bg-red-100 active:shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                title="Account"
              >
                {avatar ? (
                  <img src={avatar} alt={displayName || 'User'} referrerPolicy="no-referrer" className="w-8 h-8 object-cover md:rounded-none" />
                ) : (
                  <UserIcon className="w-6 h-6 text-black" />
                )}
              </button>
              {menuOpen && (
                <div className="absolute left-0 bottom-12 w-64 bg-white border rounded-xl shadow-lg p-3 z-50">
                  <div className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      {avatar ? (
                        <img src={avatar} alt={displayName || 'User'} referrerPolicy="no-referrer" className="w-8 h-8 object-cover md:rounded-none" />
                      ) : (
                        <div className="w-8 h-8 md:rounded-none bg-gray-100 flex items-center justify-center text-gray-600 text-sm">
                          {(displayName || 'U').slice(0,1).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                        <p className="text-xs text-gray-500 truncate">{email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t my-2" />
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => { setMenuOpen(false); navigate('/settings'); }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 hover:shadow-sm active:bg-gray-100 active:shadow-none text-gray-700 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                    >
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        handleSignOut();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 hover:shadow-sm active:bg-red-100 active:shadow-none text-[#ED1C24] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-3">
            <button
              onClick={() => setCollapsed(true)}
              className="w-full flex items-center justify-center px-3 py-2 rounded-lg bg-gray-100 hover:bg-red-50 hover:shadow-md active:bg-red-100 active:shadow-sm text-gray-800 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              aria-label="Collapse sidebar"
              title="Collapse"
            >
              <span className="text-lg">&lt;</span>
            </button>
          </div>
        </>
      )}
    </div>
  </div>
</nav>

  );
};

export default Sidebar;
