import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Lang = 'en' | 'es' | 'fr' | 'de' | 'pt';

type Dict = Record<string, string>;
type Dicts = Record<Lang, Dict>;

const dicts: Dicts = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.scanner': 'Scanner',
    'nav.inventory': 'Inventory',
    'nav.triggers': 'Triggers',
    'nav.analytics': 'Analytics',
    'nav.settings': 'Settings',
    'actions.startScanning': 'Start Scanning',
    'actions.viewAnalytics': 'View Analytics',
    'menu.settings': 'Settings',
    'menu.logout': 'Log out',
    'account.signedInAs': 'Signed in as',
  },
  es: {
    'nav.dashboard': 'Panel',
    'nav.scanner': 'Escáner',
    'nav.inventory': 'Inventario',
    'nav.triggers': 'Disparadores',
    'nav.analytics': 'Analíticas',
    'nav.settings': 'Ajustes',
    'actions.startScanning': 'Iniciar escaneo',
    'actions.viewAnalytics': 'Ver analíticas',
    'menu.settings': 'Ajustes',
    'menu.logout': 'Cerrar sesión',
    'account.signedInAs': 'Conectado como',
  },
  fr: {
    'nav.dashboard': 'Tableau de bord',
    'nav.scanner': 'Scanner',
    'nav.inventory': 'Inventaire',
    'nav.triggers': 'Déclencheurs',
    'nav.analytics': 'Analyses',
    'nav.settings': 'Paramètres',
    'actions.startScanning': 'Commencer le scan',
    'actions.viewAnalytics': 'Voir les analyses',
    'menu.settings': 'Paramètres',
    'menu.logout': 'Se déconnecter',
    'account.signedInAs': 'Connecté en tant que',
  },
  de: {
    'nav.dashboard': 'Übersicht',
    'nav.scanner': 'Scanner',
    'nav.inventory': 'Inventar',
    'nav.triggers': 'Auslöser',
    'nav.analytics': 'Analytik',
    'nav.settings': 'Einstellungen',
    'actions.startScanning': 'Scannen starten',
    'actions.viewAnalytics': 'Analytik ansehen',
    'menu.settings': 'Einstellungen',
    'menu.logout': 'Abmelden',
    'account.signedInAs': 'Angemeldet als',
  },
  pt: {
    'nav.dashboard': 'Painel',
    'nav.scanner': 'Leitor',
    'nav.inventory': 'Inventário',
    'nav.triggers': 'Gatilhos',
    'nav.analytics': 'Análises',
    'nav.settings': 'Configurações',
    'actions.startScanning': 'Iniciar leitura',
    'actions.viewAnalytics': 'Ver análises',
    'menu.settings': 'Configurações',
    'menu.logout': 'Sair',
    'account.signedInAs': 'Conectado como',
  },
};

type I18nCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const l = localStorage.getItem('lang') as Lang | null;
      return (l && ['en','es','fr','de','pt'].includes(l)) ? l : 'en';
    } catch {
      return 'en';
    }
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem('lang', l);
    } catch (error) {
      console.warn('[i18n] failed to persist language preference', error);
    }
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: l } }));
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'lang' && e.newValue) {
        const l = e.newValue as Lang;
        if (['en','es','fr','de','pt'].includes(l)) setLangState(l);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const t = useMemo(() => {
    return (key: string) => dicts[lang][key] ?? dicts.en[key] ?? key;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
