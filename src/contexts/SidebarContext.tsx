import { createContext, useContext, type Dispatch, type SetStateAction } from 'react';

export type SidebarState = {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: Dispatch<SetStateAction<boolean>>;
};

export const SidebarContext = createContext<SidebarState | null>(null);
export const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarContext.Provider');
  return ctx;
};
