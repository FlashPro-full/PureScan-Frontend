import { createContext, useContext } from 'react';

export type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  sub?: string | null;
};

export type SessionInfo = {
  isAuthenticated: boolean;
  role: 'admin' | 'user';
  user: SessionUser | null;
};

export const SessionContext = createContext<SessionInfo>({
  isAuthenticated: false,
  role: 'user',
  user: null,
});

export const useSession = () => useContext(SessionContext);
