import { useState } from "react";
import { Pencil, MapPin, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GridBackground from "@components/layout/GridBackground.jsx";
import { useTmdbPosters }  from "@hooks/useTmdbPosters.js";
import { useTmdbBackdrop } from "@hooks/useTmdbBackdrop.js";
import { useProfile }      from "@hooks/useProfile.js";
import DefaultBackdrop    from "@components/profil/DefaultBackdrop.jsx";

// ─── Constantes ───────────────────────────────────────────────────────────────

const FALLBACK = "https://placehold.co/400x600/252729/orange?text=SC&font=montserrat";
const FALLBACK_AVATAR = "https://placehold.co/120x120/252729/orange?text=?&font=montserrat";

// ─── Badges hexagonaux ────────────────────────────────────────────────────────

const HEX_BADGES = [
    {
        emoji: "💙",
        tooltip: "Pour avoir fait parti des 1 000 premiers inscrits",
        gradient: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #1d4ed8 100%)",
        glow: "rgba(37,99,235,0.5)",
    },
    {
        emoji: "👨‍💻",
        tooltip: "Développeur ScreenClub",
        gradient: "linear-gradient(135deg, #1a1a2e 0%, #7c3aed 50%, #4f46e5 100%)",
        glow: "rgba(124,58,237,0.5)",
    },
];

function HexBadge({ emoji, tooltip, gradient, glow }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div className="relative flex-shrink-0"
             onMouseEnter={() => setHovered(true)}
             onMouseLeave={() => setHovered(false)}>
            <div
                className="w-8 h-9 sm:w-9 sm:h-10 flex items-center justify-center text-base sm:text-lg cursor-default transition-transform duration-200"
                style={{
                    background: gradient,
                    clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                    boxShadow: hovered ? `0 0 14px ${glow}` : "none",
                    transform: hovered ? "scale(1.12)" : "scale(1)",
                    filter: hovered ? `drop-shadow(0 0 6px ${glow})` : "none",
                }}>
                {emoji}
            </div>
            {hovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
                     style={{ whiteSpace: "nowrap" }}>
                    <div className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-white max-w-[180px] text-center"
                         style={{
                             background: "oklch(from var(--color-base-300) l c h / 0.95)",
                             border: "1px solid oklch(from var(--color-primary) l c h / 0.3)",
                             boxShadow: "0 4px 16px oklch(0% 0 0 / 0.5)",
                             whiteSpace: "normal",
                         }}>
                        {tooltip}
                    </div>
                    <div className="w-2 h-2 mx-auto -mt-1 rotate-45"
                         style={{ background: "oklch(from var(--color-base-300) l c h / 0.95)" }} />
                </div>
            )}
        </div>
    );
}

// ─── Overlay avatar ───────────────────────────────────────────────────────────

function AvatarOverlay({ src, onClose }) {
    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center"
            style={{ background: "oklch(0% 0 0 / 0.75)", backdropFilter: "blur(8px)" }}
            onClick={onClose}>
            <div
                className="relative max-w-xs w-full mx-6"
                onClick={(e) => e.stopPropagation()}>
                <img
                    src={src}
                    alt="Avatar agrandi"
                    className="w-full rounded-2xl shadow-2xl"
                    style={{ border: "2px solid oklch(from var(--color-primary) l c h / 0.5)" }}
                />
                <button
                    onClick={onClose}
                    className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: "oklch(from var(--color-base-300) l c h)", border: "1px solid oklch(from var(--color-primary) l c h / 0.3)" }}>
                    <X size={14} className="text-base-content/70" />
                </button>
            </div>
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ rating }) {
    const full  = Math.floor(rating);
    const half  = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
        <span className="text-primary text-xs tracking-tight leading-none">
            {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(empty)}
        </span>
    );
}

function PosterCard({ poster, title, size = "md" }) {
    const sz = size === "sm" ? "w-16" : size === "lg" ? "w-36" : size === "full" ? "w-full" : "w-28";
    return (
        <div className={`${sz} aspect-2/3 rounded-xl overflow-hidden shrink-0 relative group cursor-pointer`}
             style={{ boxShadow: "0 4px 24px oklch(0% 0 0 / 0.5)" }}>
            <img src={poster || FALLBACK} alt={title}
                 onError={(e) => { if (e.target.src !== FALLBACK) e.target.src = FALLBACK; }}
                 className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                 style={{ boxShadow: "inset 0 0 0 1.5px oklch(from var(--color-primary) l c h / 0.6)" }} />
        </div>
    );
}

function SideCard({ title, count, children, accent = "primary" }) {
    const accentColor = accent === "secondary"
        ? "oklch(from var(--color-secondary) l c h)"
        : "oklch(from var(--color-primary) l c h)";
    return (
        <div className="rounded-2xl overflow-hidden"
             style={{
                 background: "oklch(from var(--color-base-300) l c h / 0.85)",
                 backdropFilter: "blur(24px)",
                 WebkitBackdropFilter: "blur(24px)",
                 border: `1px solid ${accentColor.replace(")", " / 0.25)")}`,
                 boxShadow: `0 0 32px ${accentColor.replace(")", " / 0.06)")}, inset 0 1px 0 oklch(from var(--color-base-content) l c h / 0.08)`,
             }}>
            <div className="flex items-center justify-between px-5 py-3"
                 style={{ borderBottom: `1px solid ${accentColor.replace(")", " / 0.12)")}`, background: `${accentColor.replace(")", " / 0.05)")}` }}>
                <span className="text-[11px] font-black tracking-widest uppercase"
                      style={{ color: accentColor }}>{title}</span>
                {count != null && (
                    <span className="text-xs font-black px-2 py-0.5 rounded-full"
                          style={{ background: accentColor.replace(")", " / 0.15)"), color: accentColor }}>
                        {count}
                    </span>
                )}
            </div>
            <div className="p-4">{children}</div>
        </div>
    );
}

function Skeleton({ className = "" }) {
    return (
        <div className={`animate-pulse rounded-lg bg-base-content/10 ${className}`} />
    );
}

function ProfileHeaderSkeleton() {
    return (
        <div className="flex flex-col lg:flex-row lg:items-end gap-5 -mt-14 lg:-mt-16 mb-6">
            <Skeleton className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl" />
            <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-64" />
            </div>
        </div>
    );
}

// ─── Parser bio (gras / italique / souligné) ──────────────────────────────────

function parseBio(text) {
    if (!text) return null;
    const parts = [];
    const regex = /(\*\*__(.+?)__\*\*|\*\*(.+?)\*\*|__(.+?)__|_(.+?)_)/gs;
    let last = 0, match;
    while ((match = regex.exec(text)) !== null) {
        if (match.index > last) parts.push(text.slice(last, match.index));
        if (match[1].startsWith("**__")) {
            parts.push(<strong key={match.index}><u>{match[2]}</u></strong>);
        } else if (match[1].startsWith("**")) {
            parts.push(<strong key={match.index}>{match[3]}</strong>);
        } else if (match[1].startsWith("__")) {
            parts.push(<u key={match.index}>{match[4]}</u>);
        } else {
            parts.push(<em key={match.index}>{match[5]}</em>);
        }
        last = match.index + match[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
}

function ProfilePage() {
    const navigate = useNavigate();
    const [avatarOpen, setAvatarOpen] = useState(false);

    const {
        profile,
        stats,
        favoriteFilms,
        recentActivity,
        watchlist,
        diary,
        loading,
        error,
        hasBaseData,
    } = useProfile();

    const backdropTmdbId = favoriteFilms[0]?.tmdbId ?? null;
    const backdrop       = useTmdbBackdrop(backdropTmdbId);

    const favPosters    = useTmdbPosters(favoriteFilms);
    const recentPosters = useTmdbPosters(recentActivity);

    if (!hasBaseData && !loading) {
        return (
            <div className="min-h-screen bg-base-100 flex items-center justify-center">
                <p className="text-base-content/60 text-sm">
                    {error ?? "Utilisateur non connecté."}
                </p>
            </div>
        );
    }

    const avatarSrc      = profile.avatar || FALLBACK_AVATAR;
    const bannerPosition = profile.bannerPosition ?? 50;

    return (
        <>
            <style>{`
                @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
                @keyframes glowP  { 0%,100%{opacity:.4;transform:scale(1);}50%{opacity:.8;transform:scale(1.06);} }
                .p-a  { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) both; }
                .p-b  { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) .12s both; }
                .p-c  { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) .24s both; }
                .p-blob { animation: glowP 6s ease-in-out infinite; }
                .avatar-glow:hover { box-shadow: 0 0 32px oklch(from var(--color-primary) l c h / 0.6), 0 0 8px oklch(from var(--color-primary) l c h / 0.4) !important; }
            `}</style>

            {avatarOpen && (
                <AvatarOverlay src={avatarSrc} onClose={() => setAvatarOpen(false)} />
            )}

            <div className="relative min-h-screen bg-base-100 overflow-hidden">
                <GridBackground />

                <div className="p-blob absolute top-0 right-0 w-125 h-125 rounded-full pointer-events-none"
                     style={{ background: "radial-gradient(circle, oklch(from var(--color-primary) l c h / 0.07) 0%, transparent 70%)" }} />

                {/* ── BANNER ── */}
                <div className="relative h-56 lg:h-72 w-full overflow-hidden">
                    {(profile.banner || backdrop) ? (
                        <img
                            src={profile.banner || backdrop}
                            alt="Bannière"
                            className="w-full h-full object-cover"
                            style={{ objectPosition: `center ${bannerPosition}%` }}
                        />
                    ) : (
                        <div className="w-full h-full">
                            <DefaultBackdrop />
                        </div>
                    )}
                    <div className="absolute inset-0"
                         style={{ background: "linear-gradient(to bottom, oklch(from var(--color-base-100) l c h / 0.15) 0%, oklch(from var(--color-base-100) l c h / 0.65) 65%, oklch(from var(--color-base-100) l c h) 100%)" }} />
                </div>

                <div className="relative z-10 max-w-6xl mx-auto px-5 lg:px-8">

                    {/* ── PROFILE HEADER ── */}
                    {loading && !hasBaseData ? (
                        <ProfileHeaderSkeleton />
                    ) : (
                        <div className="p-a -mt-14 lg:-mt-16 mb-6">
                            <div className="flex flex-col lg:flex-row lg:items-end gap-5">

                                {/* ── Bloc gauche : Avatar + Bio ── */}
                                <div className="flex items-start gap-4 flex-1 min-w-0">

                                    {/* Avatar cliquable */}
                                    <div className="relative shrink-0 cursor-pointer group"
                                         onClick={() => setAvatarOpen(true)}>
                                        <div
                                            className="avatar-glow w-24 h-24 lg:w-28 lg:h-28 rounded-2xl overflow-hidden transition-all duration-300"
                                            style={{
                                                border: "2px solid oklch(from var(--color-primary) l c h / 0.45)",
                                                boxShadow: "0 0 24px oklch(from var(--color-primary) l c h / 0.3)",
                                            }}>
                                            <img
                                                src={avatarSrc}
                                                alt={profile.username}
                                                onError={(e) => { e.target.src = FALLBACK_AVATAR; }}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                        <div className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                                             style={{ background: "oklch(0% 0 0 / 0.35)" }}>
                                            <span className="text-white text-[10px] font-bold tracking-wider">VOIR</span>
                                        </div>
                                    </div>

                                    {/* Infos */}
                                    <div className="flex-1 min-w-0 pt-14 lg:pt-16">

                                        {/* Ligne 1 : nom + niveau + titre */}
                                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                            <h1 className="text-2xl lg:text-3xl font-black text-base-content tracking-tight">
                                                {profile.username}
                                            </h1>
                                            {profile.level != null && (
                                                <span className={`badge badge-sm font-bold ${
                                                    profile.level >= 10 ? "badge-error" :
                                                        profile.level >= 5  ? "badge-warning" :
                                                            "badge-primary"
                                                }`}>
                                                    ★ Niv. {profile.level}
                                                </span>
                                            )}
                                            {profile.title && (
                                                <span className="badge badge-secondary badge-soft badge-sm font-semibold">
                                                    {profile.title}
                                                </span>
                                            )}
                                        </div>

                                        {/* Ligne 2 : @handle */}
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="text-primary/80 font-semibold text-xs">{profile.handle}</span>
                                        </div>

                                        {/* Ligne 3 : localisation */}
                                        <div className="flex items-center gap-1.5 text-xs mb-2">
                                            <MapPin size={11} className="text-base-content/40 shrink-0" />
                                            {profile.location ? (
                                                <span className="flex items-center gap-1.5 text-base-content/50">
                                                    {profile.countryCode && (
                                                        <img
                                                            src={`https://flagcdn.com/w20/${profile.countryCode}.png`}
                                                            srcSet={`https://flagcdn.com/w40/${profile.countryCode}.png 2x`}
                                                            width="16"
                                                            alt={profile.location}
                                                            className="rounded-sm"
                                                            onError={(e) => { e.target.style.display = "none"; }}
                                                        />
                                                    )}
                                                    {profile.location}
                                                </span>
                                            ) : (
                                                <span className="text-base-content/30 italic">non renseigné</span>
                                            )}
                                        </div>

                                        {/* Bio */}
                                        {profile.bio ? (
                                            <p className="text-sm text-base-content/70 leading-relaxed max-w-md">
                                                {parseBio(profile.bio)}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-base-content/30 italic">Aucune bio renseignée.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Bouton modifier mobile */}
                                <div className="flex lg:hidden justify-between items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        {HEX_BADGES.map((b, i) => <HexBadge key={i} {...b} />)}
                                    </div>
                                    <button onClick={() => navigate("/profil/modifier")}
                                            className="btn btn-secondary btn-sm font-bold tracking-wide flex items-center gap-1.5"
                                            style={{ boxShadow: "0 0 16px oklch(from var(--color-secondary) l c h / 0.3)" }}>
                                        <Pencil size={13} strokeWidth={2.5} />
                                        Modifier
                                    </button>
                                </div>

                                {/* Stats + bouton modifier desktop */}
                                <div className="flex flex-col items-end gap-3 shrink-0 lg:pb-1">

                                    <div className="hidden lg:flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            {HEX_BADGES.map((b, i) => <HexBadge key={i} {...b} />)}
                                        </div>
                                        <button onClick={() => navigate("/profil/modifier")}
                                                className="flex btn btn-secondary btn-sm font-bold tracking-wide items-center gap-1.5"
                                                style={{ boxShadow: "0 0 16px oklch(from var(--color-secondary) l c h / 0.3)" }}>
                                            <Pencil size={13} strokeWidth={2.5} />
                                            Modifier le profil
                                        </button>
                                    </div>

                                    {/* Stats gradient */}
                                    <div className="flex items-center justify-center lg:justify-end gap-4 lg:gap-7 flex-wrap lg:flex-nowrap w-full">
                                        {[
                                            // Ici changer films par oeuvres et proposer plus tard de mettre en avant soit les films
                                            // soit les séries, soit les animés.
                                            { value: stats.films,     label: "Films" },
                                            { value: stats.thisYear,  label: "Cette année" },
                                            { value: stats.lists,     label: "Listes" },
                                            { value: stats.following, label: "Abonnements" },
                                            { value: stats.followers, label: "Abonnés" },
                                        ].map(({ value, label }) => (
                                            <div key={label} className="text-center cursor-pointer group">
                                                {loading ? (
                                                    <Skeleton className="h-7 w-10 mx-auto mb-1" />
                                                ) : (
                                                    <p className="text-xl lg:text-2xl font-black transition-all duration-200 group-hover:scale-110"
                                                       style={{
                                                           background: "linear-gradient(90deg, oklch(from var(--color-primary) l c h), oklch(from var(--color-secondary) l c h))",
                                                           WebkitBackgroundClip: "text",
                                                           WebkitTextFillColor: "transparent",
                                                           backgroundClip: "text",
                                                           filter: "drop-shadow(0 0 6px oklch(from var(--color-primary) l c h / 0.3))",
                                                       }}>
                                                        {value.toLocaleString()}
                                                    </p>
                                                )}
                                                <p className="text-[10px] text-base-content/40 uppercase tracking-widest mt-0.5 whitespace-nowrap group-hover:text-base-content/60 transition-colors duration-200">
                                                    {label}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── MAIN CONTENT ── */}
                    <div className="p-c flex flex-col lg:flex-row gap-5 pb-20">

                        {/* Colonne principale */}
                        <div className="flex-1 min-w-0 flex flex-col gap-10">

                            {/* Œuvres favorites */}
                            <div>
                                <h2 className="text-lg lg:text-xl text-secondary font-bold tracking-wide uppercase mb-4">
                                    Œuvres favorites
                                </h2>
                                {loading ? (
                                    <div className="flex gap-2 lg:gap-3">
                                        {[...Array(4)].map((_, i) => (
                                            <Skeleton key={i} className="w-[calc(25%-6px)] lg:w-36 aspect-2/3 rounded-xl" />
                                        ))}
                                    </div>
                                ) : favoriteFilms.length === 0 ? (
                                    <p className="text-sm text-base-content/40 italic">Aucune œuvre favorite pour le moment.</p>
                                ) : (
                                    <div className="flex gap-2 lg:gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                        {favoriteFilms.map((f) => (
                                            <div key={f.id ?? f.tmdbId}
                                                 className="shrink-0 w-[calc(25%-6px)] lg:w-36"
                                                 onClick={() => f.tmdbId && navigate(`/media/${f.tmdbType ?? "movie"}/${f.tmdbId}`)}
                                                 style={{ cursor: f.tmdbId ? "pointer" : "default" }}>
                                                <PosterCard
                                                    poster={favPosters[f.tmdbId]}
                                                    title={f.title}
                                                    size="full"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Activité récente */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg lg:text-xl text-secondary font-bold tracking-wide uppercase">
                                        Activité récente
                                    </h2>
                                    {recentActivity.length > 0 && (
                                        <a className="link link-primary text-xs font-semibold">Tout voir →</a>
                                    )}
                                </div>
                                {loading ? (
                                    <div className="flex gap-2 lg:gap-3">
                                        {[...Array(4)].map((_, i) => (
                                            <Skeleton key={i} className="w-[calc(25%-6px)] lg:w-36 aspect-2/3 rounded-xl" />
                                        ))}
                                    </div>
                                ) : recentActivity.length === 0 ? (
                                    <p className="text-sm text-base-content/40 italic">Aucune activité récente.</p>
                                ) : (
                                    <div className="flex gap-2 lg:gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                        {recentActivity.map((a) => (
                                            <div key={a.id ?? a.tmdbId}
                                                 className="shrink-0 w-[calc(25%-6px)] lg:w-36 flex flex-col items-center gap-2"
                                                 onClick={() => a.tmdbId && a.type !== "watchlist" && navigate(`/media/${a.tmdbType ?? "movie"}/${a.tmdbId}`)}
                                                 style={{ cursor: a.tmdbId && a.type !== "watchlist" ? "pointer" : "default" }}>
                                                <PosterCard
                                                    poster={recentPosters[a.tmdbId] || a.coverUrl}
                                                    title={a.title}
                                                    size="full"
                                                />
                                                {a.type !== "watchlist" && a.rating != null && (
                                                    <StarRating rating={a.rating} />
                                                )}
                                                {a.type === "watchlist" && (
                                                    <span className="text-[10px] text-base-content/40 uppercase tracking-widest truncate w-full text-center">
                                                        {a.title}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── SIDEBAR ── */}
                        <div className="w-full lg:w-64 xl:w-72 shrink-0 flex flex-col gap-4">

                            {/* Stats année */}
                            <SideCard title={`Stats ${new Date().getFullYear()}`} accent="primary">
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { value: stats.thisYear, label: "Films vus",  color: "primary" },
                                        { value: stats.lists,    label: "Listes",     color: "secondary" },
                                    ].map(({ value, label, color }) => (
                                        <div key={label} className="rounded-xl p-3 text-center"
                                             style={{
                                                 background: `oklch(from var(--color-${color}) l c h / 0.1)`,
                                                 border: `1px solid oklch(from var(--color-${color}) l c h / 0.2)`,
                                             }}>
                                            {loading ? (
                                                <Skeleton className="h-8 w-10 mx-auto mb-1" />
                                            ) : (
                                                <p className={`text-2xl font-black text-${color}`}
                                                   style={{ filter: `drop-shadow(0 0 10px oklch(from var(--color-${color}) l c h / 0.6))` }}>
                                                    {value}
                                                </p>
                                            )}
                                            <p className="text-[10px] text-base-content/60 uppercase tracking-widest mt-0.5">{label}</p>
                                        </div>
                                    ))}
                                </div>
                            </SideCard>

                            {/* Watchlist */}
                            <SideCard title="Watchlist" count={watchlist.count || undefined} accent="secondary">
                                {loading ? (
                                    <div className="flex gap-2">
                                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="w-16 aspect-2/3 rounded-xl" />)}
                                    </div>
                                ) : watchlist.posters.length === 0 ? (
                                    <p className="text-sm text-base-content/40 italic">Watchlist vide.</p>
                                ) : (
                                    <div className="flex gap-2">
                                        {watchlist.posters.map((p, i) => (
                                            <PosterCard key={i} poster={p} title="" size="sm" />
                                        ))}
                                    </div>
                                )}
                            </SideCard>

                            {/* Journal */}
                            <SideCard title="Journal" accent="primary">
                                {loading ? (
                                    <div className="flex flex-col gap-2">
                                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                                    </div>
                                ) : diary.length === 0 ? (
                                    <p className="text-sm text-base-content/40 italic">Aucune entrée dans le journal.</p>
                                ) : (
                                    <div className="flex flex-col">
                                        {diary.map((entry, i) => {
                                            const showMonth = i === 0 || diary[i - 1].month !== entry.month;
                                            return (
                                                <div key={i}>
                                                    {showMonth && (
                                                        <p className="text-[10px] font-black tracking-widest uppercase text-primary mt-3 mb-1 first:mt-0"
                                                           style={{ filter: "drop-shadow(0 0 4px oklch(from var(--color-primary) l c h / 0.5))" }}>
                                                            {entry.month}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2.5 py-1.5 cursor-pointer group border-b border-base-content/5 last:border-0">
                                                        <span className="text-xs text-base-content/40 w-4 text-right shrink-0 tabular-nums font-mono">{entry.day}</span>
                                                        <span className="flex-1 text-sm text-base-content/80 group-hover:text-primary transition-colors truncate font-medium">{entry.title}</span>
                                                        <StarRating rating={entry.rating} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </SideCard>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProfilePage;