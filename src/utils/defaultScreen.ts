type DefaultScreen = 'dashboard' | 'analytics' | 'scanner' | 'inventory' | 'team' | 'billing';

export const getDefaultScreen = (isAdmin: boolean): string => {
  if (!isAdmin) {
    return '/';
  }
  
  const savedScreen = localStorage.getItem('admin-default-screen') as DefaultScreen | null;
  
  if (!savedScreen) {
    return '/dashboard';
  }
  
  const screenRoutes: Record<DefaultScreen, string> = {
    dashboard: '/',
    analytics: '/analytics',
    scanner: '/scanner',
    inventory: '/inventory',
    team: '/settings?tab=team',
    billing: '/settings?tab=subscription',
  };
  
  return screenRoutes[savedScreen] || '/';
};

export const applyDefaultScreen = (isAdmin: boolean, navigate: (path: string) => void) => {
  const defaultPath = getDefaultScreen(isAdmin);
  navigate(defaultPath);
};