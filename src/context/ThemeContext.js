import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};

// Available themes
export const THEMES = {
    DARK: 'dark',
    LIGHT: 'light',
    SYSTEM: 'system',
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('app-theme') || THEMES.DARK;
    });

    // Resolve 'system' to actual dark/light
    const resolveTheme = useCallback((t) => {
        if (t === THEMES.SYSTEM) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches
                ? THEMES.DARK
                : THEMES.LIGHT;
        }
        return t;
    }, []);

    const applyTheme = useCallback(
        (t) => {
            const resolved = resolveTheme(t);
            document.documentElement.setAttribute('data-theme', resolved);
        },
        [resolveTheme]
    );

    // Apply theme on mount and whenever it changes
    useEffect(() => {
        applyTheme(theme);
        localStorage.setItem('app-theme', theme);
    }, [theme, applyTheme]);

    // Listen to OS preference changes when theme === 'system'
    useEffect(() => {
        if (theme !== THEMES.SYSTEM) return;
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => applyTheme(THEMES.SYSTEM);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [theme, applyTheme]);

    const changeTheme = (newTheme) => {
        setTheme(newTheme);
    };

    const toggleTheme = () => {
        // Cycle: dark → light → system → dark
        const cycle = [THEMES.DARK, THEMES.LIGHT, THEMES.SYSTEM];
        const idx = cycle.indexOf(theme);
        const next = cycle[(idx + 1) % cycle.length];
        setTheme(next);
    };

    const isDark = resolveTheme(theme) === THEMES.DARK;
    const isLight = resolveTheme(theme) === THEMES.LIGHT;

    return (
        <ThemeContext.Provider
            value={{ theme, isDark, isLight, changeTheme, toggleTheme, THEMES }}
        >
            {children}
        </ThemeContext.Provider>
    );
};
