import AuthModal from "@components/ui/modales/AuthModal.jsx";
import CreateWatchlistModal from "@components/ui/modales/CreateWatchlistModal.jsx";
import SearchBar from "@components/ui/SearchBar.jsx";
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isConnected, logout, getUser } from "@/api/auth.js";
import { fetchAuth } from "@/api/fetchAuth.js";
import { useTheme } from "@/hooks/useTheme.js";
import {
    X, Menu, Search, Moon, ChevronDown, Check, LogOut,
    User, Heart, List, Plus, Star, Home, TrendingUp, LayoutGrid,
    PanelRightOpen,
} from "lucide-react";

// ─── Sidebar utilisateur ──────────────────────────────────────────────────
function UserSidebar({ isOpen, onClose, user, onLogout, onCreateWatchlist, onAddAvis }) {
    const sidebarRef = useRef(null);

    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") onClose(); };
        if (isOpen) document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const avatarUrl = user?.avatar
        ? user.avatar
        : `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user?.username ?? "U")}&backgroundColor=6366f1`;

    return (
        <>
            <div
                className={`fixed inset-0 z-60 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
                aria-hidden="true"
            />
            <aside
                ref={sidebarRef}
                role="dialog"
                aria-modal="true"
                aria-label="Menu utilisateur"
                className={`fixed top-0 right-0 z-70 h-full w-80 bg-base-100 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-base-300">
                    <span className="font-bold text-base-content uppercase tracking-widest text-xs">Mon compte</span>
                    <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose} aria-label="Fermer le menu">
                        <X size={16} />
                    </button>
                </div>

                <div className="flex flex-col items-center gap-3 px-6 py-6 border-b border-base-300">
                    <div className="avatar">
                        <div className="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                            <img src={avatarUrl} alt={`Avatar de ${user?.username ?? "utilisateur"}`} />
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-base-content text-lg leading-tight">{user?.username ?? "Utilisateur"}</p>
                        <p className="text-sm text-base-content/50 mt-0.5">{user?.email ?? ""}</p>
                    </div>
                </div>

                <nav className="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto">
                    <p className="text-xs uppercase font-semibold text-base-content/40 px-3 pb-1 pt-2">Mes contenus</p>

                    <button onClick={() => { onCreateWatchlist(); onClose(); }} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors group w-full text-left">
                        <span className="w-8 h-8 flex items-center justify-center rounded-md bg-primary/10 group-hover:bg-primary/20 text-primary transition-colors">
                            <Plus size={16} />
                        </span>
                        <span className="font-semibold text-sm">Créer une Watchlist</span>
                    </button>

                    <button onClick={() => { onAddAvis(); onClose(); }} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/10 hover:text-secondary transition-colors group w-full text-left">
                        <span className="w-8 h-8 flex items-center justify-center rounded-md bg-secondary/10 group-hover:bg-secondary/20 text-secondary transition-colors">
                            <Star size={16} />
                        </span>
                        <span className="font-semibold text-sm">Ajouter un avis</span>
                    </button>

                    <Link to="/mes-suivis" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/10 hover:text-accent transition-colors group">
                        <span className="w-8 h-8 flex items-center justify-center rounded-md bg-accent/10 group-hover:bg-accent/20 text-accent transition-colors">
                            <Heart size={16} />
                        </span>
                        <span className="font-semibold text-sm">Mes suivis</span>
                    </Link>

                    <Link to="/mes-watchlists" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors group">
                        <span className="w-8 h-8 flex items-center justify-center rounded-md bg-primary/10 group-hover:bg-primary/20 text-primary transition-colors">
                            <List size={16} />
                        </span>
                        <span className="font-semibold text-sm">Mes Watchlists</span>
                    </Link>

                    <div className="divider my-1" />
                    <p className="text-xs uppercase font-semibold text-base-content/40 px-3 pb-1">Compte</p>

                    <Link to="/profil" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-base-200 transition-colors group" onClick={onClose}>
                        <span className="w-8 h-8 flex items-center justify-center rounded-md bg-base-200 group-hover:bg-base-300 transition-colors">
                            <User size={16} />
                        </span>
                        <span className="font-semibold text-sm">Mon profil</span>
                    </Link>
                </nav>

                <div className="px-3 pb-5 pt-2 border-t border-base-300">
                    <button className="btn btn-error btn-outline w-full gap-2" onClick={() => { onLogout(); onClose(); }}>
                        <LogOut size={16} />
                        Déconnexion
                    </button>
                </div>
            </aside>
        </>
    );
}

// ─── Header ────────────────────────────────────────────────────────────────
function Header() {
    const [authOpen,          setAuthOpen]          = useState(false);
    const [sidebarOpen,       setSidebarOpen]       = useState(false);
    const [watchlistModalOpen,setWatchlistModalOpen] = useState(false);
    const [avisModalOpen,     setAvisModalOpen]     = useState(false);
    const [connected,         setConnected]         = useState(isConnected());
    const [user,              setUser]              = useState(null);
    const [mobileSearchOpen,  setMobileSearchOpen]  = useState(false);
    const { theme, setTheme, themes }               = useTheme();
    const navigate                                  = useNavigate();

    // Charge les données user fraîches depuis l'API (avatar réel en BDD)
    const loadUser = async () => {
        const base = getUser(); // données JWT (id, username, email…)
        if (!base) return;
        setUser(base); // affiche immédiatement le fallback JWT
        try {
            const fresh = await fetchAuth("/api/users/me");
            setUser((prev) => ({ ...prev, ...fresh })); // fusionne avec les données API
        } catch {
            // silencieux — on conserve les données JWT
        }
    };

    useEffect(() => {
        if (connected) loadUser();
    }, [connected]);

    useEffect(() => {
        const onStorageChange = () => {
            const nowConnected = isConnected();
            setConnected(nowConnected);
            if (nowConnected) loadUser();
            else setUser(null);
        };
        // "storage" = changements depuis un autre onglet
        // "profileUpdated" = changement depuis la même page (ex: page profil)
        window.addEventListener("storage", onStorageChange);
        window.addEventListener("profileUpdated", onStorageChange);
        return () => {
            window.removeEventListener("storage", onStorageChange);
            window.removeEventListener("profileUpdated", onStorageChange);
        };
    }, []);

    function handleAuthClose() {
        setAuthOpen(false);
        const nowConnected = isConnected();
        setConnected(nowConnected);
        if (nowConnected) loadUser();
    }

    function handleLogout() {
        logout();
        setConnected(false);
        setUser(null);
        navigate("/");
    }

    const avatarUrl = user?.avatar
        ? user.avatar
        : `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user?.username ?? "U")}&backgroundColor=6366f1`;

    return (
        <>
            {/* ── Navbar principale ── */}
            <div className="navbar sticky top-0 z-50 backdrop-blur-md bg-base-100/40! shadow-primary/50 px-6">

                {/* START : hamburger (mobile) + logo */}
                <div className="navbar-start">
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                            <Menu size={20} />
                        </div>
                        <ul tabIndex="-1" className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow uppercase font-semibold text-secondary">
                            <li><Link to="/" className="flex items-center gap-2"><Home size={14} />Accueil</Link></li>
                            <li><Link to="/tendances" className="flex items-center gap-2"><TrendingUp size={14} />Tendances</Link></li>
                            <li>
                                <a className="flex items-center gap-2"><LayoutGrid size={14} />Fonctionnalités</a>
                                <ul className="p-2">
                                    <li><Link to="/topavis" className="flex items-center gap-2"><Star size={13} />Avis</Link></li>
                                    <li><Link to="/topwatchlists" className="flex items-center gap-2"><List size={13} />Watchlists</Link></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                    <Link to="/" className="uppercase font-bold font-unbounded text-primary drop-shadow-lg drop-shadow-primary/30">
                        ScreenClub
                    </Link>
                </div>

                {/* CENTER : menu horizontal (desktop uniquement) */}
                <div className="navbar-center hidden lg:flex">
                    <ul className="menu menu-horizontal px-1 uppercase font-semibold text-secondary">
                        <li><Link to="/" className="flex items-center gap-1.5"><Home size={14} />Accueil</Link></li>
                        <li><Link to="/tendances" className="flex items-center gap-1.5"><TrendingUp size={14} />Tendances</Link></li>
                        <li>
                            <details>
                                <summary className="flex items-center gap-1.5"><LayoutGrid size={14} />Fonctionnalités</summary>
                                <ul className="p-2 bg-base-100 w-40 z-1">
                                    <li><Link to="/topavis" className="flex items-center gap-1.5"><Star size={13} />Avis</Link></li>
                                    <li><Link to="/topwatchlists" className="flex items-center gap-1.5"><List size={13} />Watchlists</Link></li>
                                </ul>
                            </details>
                        </li>
                    </ul>
                </div>

                {/* END : recherche desktop, loupe mobile, thème, auth */}
                <div className="navbar-end gap-1">

                    {/* ── Recherche desktop ── */}
                    <SearchBar
                        className="hidden lg:block mr-1"
                        inputClassName="input-sm w-48 xl:w-64 input-bordered border-primary/50 focus-within:border-primary focus-within:shadow-sm focus-within:shadow-primary/30 transition-all duration-200 text-primary [&_svg]:text-primary [&_svg]:opacity-80"
                    />

                    {/* ── Loupe mobile ── */}
                    <button
                        className="btn btn-ghost btn-circle lg:hidden"
                        aria-label={mobileSearchOpen ? "Fermer la recherche" : "Ouvrir la recherche"}
                        onClick={() => setMobileSearchOpen((v) => !v)}
                    >
                        {mobileSearchOpen ? (
                            <X size={20} />
                        ) : (
                            <Search size={20} />
                        )}
                    </button>

                    {/* ── Sélecteur de thème ── */}
                    <div className="dropdown dropdown-end">
                        {/* Bouton desktop */}
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-sm m-1 hidden sm:flex gap-1.5 items-center">
                            <span
                                className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ background: themes.find((t) => t.value === theme)?.color }}
                            />
                            Thème
                            <ChevronDown size={12} className="opacity-60" />
                        </div>
                        {/* Bouton mobile */}
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm m-1 sm:hidden" aria-label="Thème">
                            <Moon size={16} />
                        </div>
                        {/* Dropdown */}
                        <ul tabIndex="-1" className="dropdown-content bg-base-300 rounded-box z-50 w-48 p-2 shadow-2xl right-0">
                            {themes.map((t) => (
                                <li key={t.value}>
                                    <button
                                        className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 text-left
                                            ${theme === t.value
                                            ? "bg-primary/15 text-primary"
                                            : "hover:bg-base-200 text-base-content"
                                        }`}
                                        onClick={() => setTheme(t.value)}
                                    >
                                        <span
                                            className="inline-block w-3 h-3 rounded-full shrink-0 ring-1 ring-white/20"
                                            style={{ background: t.color }}
                                        />
                                        {t.label}
                                        {theme === t.value && (
                                            <Check size={14} className="ml-auto text-primary" />
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Auth ── */}
                    {connected ? (
                        <button
                            className="relative group shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Ouvrir le menu utilisateur"
                        >
                            {/* Avatar */}
                            <div className="avatar">
                                <div className="w-9 rounded-full ring-2 ring-primary/50 ring-offset-2 ring-offset-base-100 group-hover:ring-primary group-hover:ring-offset-1 transition-all duration-300">
                                    <img
                                        src={avatarUrl}
                                        alt="Avatar"
                                        className="transition-all duration-300 group-hover:brightness-75 group-hover:scale-105"
                                    />
                                </div>
                            </div>
                            {/* Overlay hover — icône menu latéral */}
                            <span className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <PanelRightOpen
                                    size={15}
                                    className="text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)] translate-x-0.5 group-hover:translate-x-0 transition-transform duration-300"
                                />
                            </span>
                            {/* Glow ring animé */}
                            <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                  style={{ boxShadow: "0 0 0 3px oklch(from var(--color-primary) l c h / 0.35), 0 0 12px oklch(from var(--color-primary) l c h / 0.25)" }} />
                        </button>
                    ) : (
                        <a className="btn btn-primary btn-sm hover:btn-accent duration-150 transition-colors ease-in-out" onClick={() => setAuthOpen(true)}>
                            Connexion
                        </a>
                    )}

                    <AuthModal isOpen={authOpen} onClose={handleAuthClose} />
                </div>
            </div>

            {/* ── Barre de recherche mobile (slide-down) ── */}
            <div
                className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-base-100/95 backdrop-blur-md border-b border-base-300 sticky top-16 z-40 ${mobileSearchOpen ? "max-h-24 py-3" : "max-h-0 py-0"}`}
                aria-hidden={!mobileSearchOpen}
            >
                <div className="px-4">
                    <SearchBar
                        inputClassName="input-bordered w-full"
                        onClose={() => setMobileSearchOpen(false)}
                    />
                </div>
            </div>

            {/* ── Sidebar utilisateur ── */}
            <UserSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                user={user}
                onLogout={handleLogout}
                onCreateWatchlist={() => setWatchlistModalOpen(true)}
                onAddAvis={() => setAvisModalOpen(true)}
            />

            {/* ── Modales ── */}
            <CreateWatchlistModal
                isOpen={watchlistModalOpen}
                onClose={() => setWatchlistModalOpen(false)}
            />
        </>
    );
}

export default Header;