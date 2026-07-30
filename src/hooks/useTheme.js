import { useState, useEffect } from "react";

const THEMES = [
    { value: "jaune",   label: "Doré",      color: "oklch(78% 0.18 75)" },
    { value: "jamaica", label: "Jungle",    color: "oklch(79% 0.26 145)" },
    { value: "red",     label: "Braise",    color: "oklch(67% 0.30 22)" },
    { value: "vite",    label: "Nébuleuse", color: "oklch(68% 0.33 290)" },
    { value: "frost",   label: "Frost",     color: "oklch(55% 0.26 274)" },
    { value: "cyber",   label: "Cyber",     color: "oklch(78% 0.28 195)" },
];

const DEFAULT = "jaune";
const LS_KEY  = "sc-theme";

export function useTheme() {
    const [theme, setThemeState] = useState(() => {
        const saved = localStorage.getItem(LS_KEY);
        // Garde uniquement les valeurs connues (évite des data-theme orphelins)
        return THEMES.some((t) => t.value === saved) ? saved : DEFAULT;
    });

    // Applique le thème sur <html> à chaque changement
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem(LS_KEY, theme);
    }, [theme]);

    return { theme, setTheme: setThemeState, themes: THEMES };
}