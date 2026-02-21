import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';

export type ThemeKey = 'emerald' | 'dark' | 'blue' | 'purple' | 'yellow';

export interface ThemeColors {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    primaryShadow: string;
    gradientFrom: string;
    gradientTo: string;
    surface: string;
    card: string;
    cardHover: string;
    cardBorder: string;
    heading: string;
    body: string;
    muted: string;
    inputBg: string;
    inputBorder: string;
    navBg: string;
    navBorder: string;
    // Auth pages
    authBgFrom: string;
    authBgVia: string;
    authBgTo: string;
    authBlob1: string;
    authBlob2: string;
    authBlob3: string;
    authCard: string;
    authCardBorder: string;
    // Toggle / Tabs
    toggleBg: string;
    toggleActive: string;
    // Progress bar background
    progressBg: string;
    // Danger
    dangerText: string;
}

export interface ThemeMeta {
    key: ThemeKey;
    name: string;
    icon: string;
    preview: string; // Preview swatch color
    colors: ThemeColors;
}

export const THEMES: Record<ThemeKey, ThemeMeta> = {
    emerald: {
        key: 'emerald',
        name: 'الأخضر',
        icon: '🌿',
        preview: '#059669',
        colors: {
            primary: '#059669',
            primaryLight: '#ecfdf5',
            primaryDark: '#047857',
            primaryShadow: 'rgba(16, 185, 129, 0.25)',
            gradientFrom: '#059669',
            gradientTo: '#0d9488',
            surface: '#f8fafc',
            card: '#ffffff',
            cardHover: '#f1f5f9',
            cardBorder: '#f1f5f9',
            heading: '#1e293b',
            body: '#64748b',
            muted: '#94a3b8',
            inputBg: 'rgba(255,255,255,0.5)',
            inputBorder: '#e2e8f0',
            navBg: '#ffffff',
            navBorder: '#f1f5f9',
            authBgFrom: '#ecfdf5',
            authBgVia: '#f0fdfa',
            authBgTo: '#ecfeff',
            authBlob1: '#a7f3d0',
            authBlob2: '#99f6e4',
            authBlob3: '#a5f3fc',
            authCard: 'rgba(255,255,255,0.8)',
            authCardBorder: 'rgba(255,255,255,0.5)',
            toggleBg: '#f1f5f9',
            toggleActive: '#ffffff',
            progressBg: '#e2e8f0',
            dangerText: '#ef4444',
        },
    },
    dark: {
        key: 'dark',
        name: 'الداكن',
        icon: '🌙',
        preview: '#1e293b',
        colors: {
            primary: '#10b981',
            primaryLight: '#064e3b',
            primaryDark: '#059669',
            primaryShadow: 'rgba(16, 185, 129, 0.35)',
            gradientFrom: '#10b981',
            gradientTo: '#14b8a6',
            surface: '#0f172a',
            card: '#1e293b',
            cardHover: '#334155',
            cardBorder: '#334155',
            heading: '#f1f5f9',
            body: '#94a3b8',
            muted: '#64748b',
            inputBg: 'rgba(30, 41, 59, 0.8)',
            inputBorder: '#475569',
            navBg: '#1e293b',
            navBorder: '#334155',
            authBgFrom: '#0f172a',
            authBgVia: '#1e293b',
            authBgTo: '#0f172a',
            authBlob1: 'rgba(16, 185, 129, 0.12)',
            authBlob2: 'rgba(20, 184, 166, 0.12)',
            authBlob3: 'rgba(6, 182, 212, 0.08)',
            authCard: 'rgba(30, 41, 59, 0.85)',
            authCardBorder: 'rgba(51, 65, 85, 0.5)',
            toggleBg: '#334155',
            toggleActive: '#475569',
            progressBg: '#334155',
            dangerText: '#f87171',
        },
    },
    blue: {
        key: 'blue',
        name: 'الأزرق',
        icon: '🌊',
        preview: '#2563eb',
        colors: {
            primary: '#2563eb',
            primaryLight: '#eff6ff',
            primaryDark: '#1d4ed8',
            primaryShadow: 'rgba(37, 99, 235, 0.25)',
            gradientFrom: '#2563eb',
            gradientTo: '#0284c7',
            surface: '#f0f9ff',
            card: '#ffffff',
            cardHover: '#e0f2fe',
            cardBorder: '#e0f2fe',
            heading: '#1e293b',
            body: '#64748b',
            muted: '#94a3b8',
            inputBg: 'rgba(255,255,255,0.5)',
            inputBorder: '#bfdbfe',
            navBg: '#ffffff',
            navBorder: '#e0f2fe',
            authBgFrom: '#eff6ff',
            authBgVia: '#f0f9ff',
            authBgTo: '#ecfeff',
            authBlob1: '#93c5fd',
            authBlob2: '#7dd3fc',
            authBlob3: '#a5f3fc',
            authCard: 'rgba(255,255,255,0.8)',
            authCardBorder: 'rgba(255,255,255,0.5)',
            toggleBg: '#e0f2fe',
            toggleActive: '#ffffff',
            progressBg: '#dbeafe',
            dangerText: '#ef4444',
        },
    },
    purple: {
        key: 'purple',
        name: 'البنفسجي',
        icon: '💜',
        preview: '#9333ea',
        colors: {
            primary: '#9333ea',
            primaryLight: '#faf5ff',
            primaryDark: '#7e22ce',
            primaryShadow: 'rgba(147, 51, 234, 0.25)',
            gradientFrom: '#9333ea',
            gradientTo: '#a855f7',
            surface: '#faf5ff',
            card: '#ffffff',
            cardHover: '#f3e8ff',
            cardBorder: '#f3e8ff',
            heading: '#1e293b',
            body: '#64748b',
            muted: '#94a3b8',
            inputBg: 'rgba(255,255,255,0.5)',
            inputBorder: '#e9d5ff',
            navBg: '#ffffff',
            navBorder: '#f3e8ff',
            authBgFrom: '#faf5ff',
            authBgVia: '#f5f3ff',
            authBgTo: '#fdf4ff',
            authBlob1: '#d8b4fe',
            authBlob2: '#c4b5fd',
            authBlob3: '#f0abfc',
            authCard: 'rgba(255,255,255,0.8)',
            authCardBorder: 'rgba(255,255,255,0.5)',
            toggleBg: '#f3e8ff',
            toggleActive: '#ffffff',
            progressBg: '#e9d5ff',
            dangerText: '#ef4444',
        },
    },
    yellow: {
        key: 'yellow',
        name: 'الأصفر',
        icon: '☀️',
        preview: '#d97706',
        colors: {
            primary: '#d97706',
            primaryLight: '#fffbeb',
            primaryDark: '#b45309',
            primaryShadow: 'rgba(217, 119, 6, 0.25)',
            gradientFrom: '#d97706',
            gradientTo: '#ea580c',
            surface: '#fffbeb',
            card: '#ffffff',
            cardHover: '#fef3c7',
            cardBorder: '#fef3c7',
            heading: '#1e293b',
            body: '#64748b',
            muted: '#94a3b8',
            inputBg: 'rgba(255,255,255,0.5)',
            inputBorder: '#fde68a',
            navBg: '#ffffff',
            navBorder: '#fef3c7',
            authBgFrom: '#fffbeb',
            authBgVia: '#fefce8',
            authBgTo: '#fff7ed',
            authBlob1: '#fde68a',
            authBlob2: '#fef08a',
            authBlob3: '#fed7aa',
            authCard: 'rgba(255,255,255,0.8)',
            authCardBorder: 'rgba(255,255,255,0.5)',
            toggleBg: '#fef3c7',
            toggleActive: '#ffffff',
            progressBg: '#fde68a',
            dangerText: '#ef4444',
        },
    },
};

interface ThemeContextType {
    theme: ThemeKey;
    themeData: ThemeMeta;
    setTheme: (theme: ThemeKey) => void;
    c: ThemeColors; // Shorthand for colors
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'emerald',
    themeData: THEMES.emerald,
    setTheme: () => { },
    c: THEMES.emerald.colors,
});

export const useTheme = () => useContext(ThemeContext);

function applyThemeToDOM(colors: ThemeColors) {
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
        // Convert camelCase to kebab-case CSS variable
        const cssVar = `--th-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        root.style.setProperty(cssVar, value);
    });
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setThemeState] = useState<ThemeKey>(() => {
        try {
            const saved = localStorage.getItem('musabaqah-theme');
            if (saved && saved in THEMES) return saved as ThemeKey;
        } catch { }
        return 'emerald';
    });

    const themeData = THEMES[theme];

    const setTheme = useCallback((newTheme: ThemeKey) => {
        setThemeState(newTheme);
        try {
            localStorage.setItem('musabaqah-theme', newTheme);
        } catch { }
    }, []);

    useEffect(() => {
        applyThemeToDOM(themeData.colors);
    }, [themeData]);

    return (
        <ThemeContext.Provider value={{ theme, themeData, setTheme, c: themeData.colors }}>
            {children}
        </ThemeContext.Provider>
    );
};
