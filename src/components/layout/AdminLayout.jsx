// src/components/layout/AdminLayout.jsx
// Composants partagés du dashboard admin + layout principal.
// Ce fichier n'exporte QUE des composants (règle react-refresh/only-export-components).
// Les constantes, hook et helpers sont dans @api/adminShared.jsx

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    PanelLeftClose, PanelLeftOpen, Menu, Star,
    Home, Users2, ChevronDown, Check,
} from "lucide-react";
import { getUser } from "@api/auth.js";
import { fetchAuth } from "@api/fetchAuth.js";
import { useTheme } from "@hooks/useTheme.js";
import {
    NAV_ITEMS, AVATAR_HUES, BADGE_STATUS, BADGE_STATUS_LABELS,
} from "@api/adminShared.jsx";

// ─── Atomes UI ────────────────────────────────────────────────────────────────

export function Avatar({ name, index, size = 32 }) {
    const initial = name?.[0]?.toUpperCase() ?? "?";
    const hue = AVATAR_HUES[index % AVATAR_HUES.length];
    return (
        <div
            className="rounded-full shrink-0 flex items-center justify-center font-black font-unbounded"
            style={{
                width: size, height: size,
                background: `oklch(42% 0.16 ${hue})`,
                border: "2px solid oklch(from var(--color-primary) l c h / 0.25)",
                fontSize: size * 0.38,
                color: "oklch(92% 0.03 80)",
            }}
        >
            {initial}
        </div>
    );
}

export function StatusBadge({ status }) {
    return (
        <span className={`${BADGE_STATUS[status] ?? "badge badge-ghost"} badge-sm font-unbounded text-[10px] whitespace-nowrap`}>
            {BADGE_STATUS_LABELS[status] ?? status}
        </span>
    );
}

export function TypeBadge({ type }) {
    const map = {
        avis:      ["badge badge-warning", <><Star size={10} className="inline -mt-0.5" /> Critique</>],
        watchlist: ["badge badge-info",    "◈ Watchlist"],
    };
    const [cls, label] = map[type] ?? map["avis"];
    return (
        <span className={`${cls} badge-sm font-unbounded text-[10px] whitespace-nowrap`}>{label}</span>
    );
}

export function ActionBtn({ title, hoverColorVar, children }) {
    const [hov, setHov] = useState(false);
    return (
        <button
            title={title}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            className="px-2 py-1 rounded text-sm leading-none transition-all duration-150 cursor-pointer border"
            style={{
                background:  hov ? `oklch(from var(${hoverColorVar}) l c h / 0.12)` : "transparent",
                borderColor: hov ? `oklch(from var(${hoverColorVar}) l c h / 0.4)`  : "transparent",
                color: hov
                    ? `oklch(from var(${hoverColorVar}) l c h)`
                    : "oklch(from var(--color-base-content) l c h / 0.35)",
            }}
        >
            {children}
        </button>
    );
}

export function Card({ children }) {
    return (
        <div className="bg-base-200 rounded-box overflow-hidden border border-primary/10">
            {children}
        </div>
    );
}

export function CardHeader({ title, action }) {
    return (
        <div className="flex items-center justify-between px-6 py-4 bg-base-200/80 border-b border-primary/10">
            <span className="text-sm font-black font-unbounded tracking-tight">{title}</span>
            {action && <div className="text-[11px] font-bold text-primary font-unbounded">{action}</div>}
        </div>
    );
}

export function Th({ children, colorVar = "--color-primary" }) {
    return (
        <th
            className="px-5 py-3 text-left text-[10px] font-black font-unbounded tracking-widest uppercase whitespace-nowrap bg-base-200/60 border-b border-primary/10"
            style={{ color: `oklch(from var(${colorVar}) l c h / 0.85)` }}
        >
            {children}
        </th>
    );
}

export function Td({ children }) {
    return <td className="px-5 py-3 text-sm">{children}</td>;
}

export function SkeletonRow({ cols }) {
    return (
        <tr>
            {Array.from({ length: cols }).map((_, i) => (
                <Td key={i}>
                    <div
                        className="h-3.5 rounded animate-pulse bg-base-content/8"
                        style={{ width: i === 0 ? "70%" : "50%" }}
                    />
                </Td>
            ))}
        </tr>
    );
}

export function ErrorRow({ cols, message }) {
    return (
        <tr>
            <td colSpan={cols} className="px-5 py-4">
                <div role="alert" className="alert alert-error text-xs py-2.5 px-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold">{message}</span>
                </div>
            </td>
        </tr>
    );
}

// ─── Layout principal ─────────────────────────────────────────────────────────

const SIDEBAR_FULL  = 260;
const SIDEBAR_ICONS = 64;

export default function AdminLayout({ activeId, pendingCount = 0, children }) {
    const navigate    = useNavigate();
    const currentUser = getUser();
    const { theme, setTheme, themes } = useTheme();

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [themeOpen,   setThemeOpen]   = useState(false);
    const [user,        setUser]        = useState(null);
    const [isDesktop,   setIsDesktop]   = useState(
        typeof window !== "undefined" ? window.innerWidth >= 768 : true
    );

    // Charge l'avatar réel depuis l'API — même logique que Header.jsx
    const loadUser = useCallback(async () => {
        const base = getUser();
        if (!base) return;
        setUser(base);
        try {
            const fresh = await fetchAuth("/api/users/me");
            setUser(prev => ({ ...prev, ...fresh }));
        } catch {
            // silencieux — on conserve les données JWT
        }
    }, []);

    useEffect(() => { void loadUser(); }, [loadUser]);

    const AVATAR_FALLBACK = "https://placehold.co/120x120/252729/orange?text=?&font=montserrat";
    const avatarUrl = user?.avatar ? user.avatar : AVATAR_FALLBACK;

    useEffect(() => {
        const onResize = () => {
            const desktop = window.innerWidth >= 768;
            setIsDesktop(desktop);
            setSidebarOpen(desktop);
        };
        window.addEventListener("resize", onResize);
        onResize();
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const expanded = sidebarOpen || !isDesktop;

    return (
        <div
            className="min-h-screen flex relative font-sans text-base-content"
            style={{ background: "oklch(from var(--color-base-100) calc(l + 0.12) c h)" }}
        >
            <style>{`
                @keyframes sc-fadein { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
                .sc-fadein { animation: sc-fadein 0.4s cubic-bezier(.22,1,.36,1) both; }
                @keyframes sc-pulse  { 0%,100% { opacity:.4 } 50% { opacity:.9 } }
                .sc-stat:hover { transform: translateY(-3px); box-shadow: 0 14px 40px oklch(0% 0 0 / 0.25); }
                .sc-navbtn:hover { background: oklch(from var(--color-primary) l c h / 0.07) !important; }
                tbody tr:hover td { background: oklch(from var(--color-primary) l c h / 0.05); }
                .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
                @media(max-width:1024px){ .stats-grid { grid-template-columns:repeat(2,1fr); } }
                @media(max-width:480px) { .stats-grid { grid-template-columns:1fr 1fr; gap:10px; } }
                .two-col { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
                @media(max-width:900px) { .two-col { grid-template-columns:1fr; } }
            `}</style>

            {!isDesktop && sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
            )}

            {/* ── Sidebar ──────────────────────────────────────────────────── */}
            <aside
                className={[
                    "shrink-0 flex flex-col bg-base-200 border-r border-primary/10",
                    "transition-[width,transform] duration-220 ease-[cubic-bezier(.22,1,.36,1)]",
                    isDesktop
                        ? "sticky top-0 h-screen"
                        : `fixed top-0 left-0 h-screen z-50 w-65 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`,
                ].join(" ")}
                style={isDesktop ? { width: sidebarOpen ? SIDEBAR_FULL : SIDEBAR_ICONS } : undefined}
            >
                {expanded ? (
                    <div className="flex flex-col gap-3 px-4.5 py-4 border-b border-primary/10">
                        <div className="flex items-center justify-between">
                            <span className="text-[13px] font-black font-unbounded tracking-tight">
                                SCREEN<span className="text-primary">CLUB</span>
                            </span>
                            {isDesktop && (
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="text-base-content/30 bg-transparent border-none cursor-pointer p-1 hover:text-base-content/60 transition-colors"
                                >
                                    <PanelLeftClose size={15} />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-full shrink-0 overflow-hidden"
                                 style={{ boxShadow: "0 0 0 2px oklch(from var(--color-primary) l c h / 0.5)" }}>
                                <img src={avatarUrl} alt="Avatar admin" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[13px] font-black font-unbounded truncate">
                                        {user?.username ?? currentUser?.username ?? "Admin"}
                                    </span>
                                    <span className="badge badge-primary badge-xs font-unbounded shrink-0">admin</span>
                                </div>
                                <p className="text-[10px] text-base-content/40 truncate">{user?.email ?? currentUser?.email ?? ""}</p>
                            </div>
                        </div>
                        {/* Liens accueil */}
                        <div className="flex flex-col gap-1.5">
                            <button
                                onClick={() => navigate("/timeline")}
                                className="btn btn-ghost btn-xs justify-start gap-2 font-unbounded text-primary border border-primary/20 hover:bg-primary/10 hover:border-primary/40 w-full"
                            >
                                <Users2 size={12} /> Accueil membre
                            </button>
                            <button
                                onClick={() => navigate("/")}
                                className="btn btn-ghost btn-xs justify-start gap-2 font-unbounded text-secondary border border-secondary/20 hover:bg-secondary/10 hover:border-secondary/40 w-full"
                            >
                                <Home size={12} /> Accueil guest
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3 py-4 border-b border-primary/10">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="text-base-content/30 bg-transparent border-none cursor-pointer p-1 hover:text-base-content/60 transition-colors"
                        >
                            <PanelLeftOpen size={15} />
                        </button>
                    </div>
                )}

                <nav className="flex-1 overflow-y-auto pt-2">
                    {NAV_ITEMS.map(item => {
                        const isActive = item.id === activeId;
                        return (
                            <button
                                key={item.id}
                                className={`sc-navbtn w-full flex items-center gap-3 border-none bg-transparent text-left text-[11px] font-black font-unbounded transition-[background,color] duration-100 cursor-pointer ${expanded ? "px-4.5 py-3.25 justify-start" : "px-0 py-3.25 justify-center"}`}
                                onClick={() => {
                                    navigate(item.path);
                                    if (!isDesktop) setSidebarOpen(false);
                                }}
                                style={{
                                    background: isActive ? "oklch(from var(--color-primary) l c h / 0.12)" : "none",
                                    borderLeft: `2.5px solid ${isActive ? "oklch(from var(--color-primary) l c h)" : "transparent"}`,
                                    color:      isActive ? "oklch(from var(--color-primary) l c h)" : "oklch(from var(--color-base-content) l c h / 0.6)",
                                }}
                            >
                                <span className={`shrink-0 text-center ${expanded ? "w-5" : "w-auto"}`}>
                                    <item.icon size={16} />
                                </span>
                                {expanded && (
                                    <>
                                        <span className="flex-1 whitespace-nowrap">{item.label}</span>
                                        {item.id === "moderation" && pendingCount > 0 && (
                                            <span className="badge badge-error badge-xs font-unbounded">{pendingCount}</span>
                                        )}
                                    </>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* ── Footer sidebar : sélecteur de thème ── */}
                <div className={`border-t border-primary/10 ${expanded ? "px-3 py-3" : "px-0 py-3 flex justify-center"}`}>
                    {expanded ? (
                        <div className="relative">
                            <button
                                onClick={() => setThemeOpen(o => !o)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-black font-unbounded text-base-content/50 hover:bg-primary/8 hover:text-base-content/80 transition-colors duration-150 cursor-pointer border border-transparent hover:border-primary/15"
                            >
                                <span
                                    className="w-3 h-3 rounded-full shrink-0"
                                    style={{ background: themes.find(t => t.value === theme)?.color }}
                                />
                                <span className="flex-1 text-left truncate">{themes.find(t => t.value === theme)?.label ?? "Thème"}</span>
                                <ChevronDown size={11} className={`transition-transform duration-150 ${themeOpen ? "rotate-180" : ""}`} />
                            </button>
                            {themeOpen && (
                                <>
                                    {/* Backdrop clic-dehors */}
                                    <div className="fixed inset-0 z-10" onClick={() => setThemeOpen(false)} />
                                    <div
                                        className="absolute bottom-full mb-1 left-0 right-0 z-20 rounded-xl overflow-hidden py-1"
                                        style={{
                                            background:    "oklch(from var(--color-base-200) l c h / 0.98)",
                                            border:        "1px solid oklch(from var(--color-primary) l c h / 0.15)",
                                            backdropFilter:"blur(12px)",
                                            boxShadow:     "0 -8px 32px oklch(0% 0 0 / 0.2)",
                                        }}
                                    >
                                        {themes.map(t => (
                                            <button
                                                key={t.value}
                                                onClick={() => { setTheme(t.value); setThemeOpen(false); }}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-unbounded transition-colors duration-100 cursor-pointer hover:bg-primary/8"
                                                style={{ color: theme === t.value ? "oklch(from var(--color-primary) l c h)" : "oklch(from var(--color-base-content) l c h / 0.65)" }}
                                            >
                                                <span className="w-3 h-3 rounded-full shrink-0 ring-1 ring-white/20" style={{ background: t.color }} />
                                                <span className="flex-1 text-left">{t.label}</span>
                                                {theme === t.value && <Check size={11} />}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        /* Mode icône — pastille couleur active cliquable */
                        <button
                            onClick={() => { setSidebarOpen(true); setThemeOpen(true); }}
                            title="Changer de thème"
                            className="w-8 h-8 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ background: themes.find(t => t.value === theme)?.color ?? "oklch(from var(--color-primary) l c h)" }}
                        />
                    )}
                </div>
            </aside>

            {/* ── Zone de contenu ───────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0">
                {!isDesktop && (
                    <div className="h-13 flex items-center gap-3 px-4 sticky top-0 z-10 border-b border-primary/10 bg-base-200/90 backdrop-blur-sm">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="btn btn-ghost btn-sm btn-circle"
                            aria-label="Ouvrir le menu"
                        >
                            <Menu size={18} />
                        </button>
                        <span className="text-[13px] font-black font-unbounded">
                            {NAV_ITEMS.find(n => n.id === activeId)?.label}
                        </span>
                    </div>
                )}
                <main className={`sc-fadein flex-1 overflow-y-auto flex flex-col gap-5 ${isDesktop ? "p-7" : "p-4"}`}>
                    {children}
                </main>
            </div>
        </div>
    );
}