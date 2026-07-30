// src/components/ui/MediaInfoComponents.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import { Star } from "lucide-react";
import koalaFallback from "@images/koala_win7.png";

// ─── Titre de section ─────────────────────────────────────────────────────────

export function SectionTitle({ children, color = "text-primary" }) {
    return (
        <h2 className={`font-unbounded font-semibold text-[12px] tracking-widest uppercase ${color} mb-5`}>
            {children}
        </h2>
    );
}

// ─── Note communauté (demi-étoiles SVG + compteur) ───────────────────────────

export function CommunityRating({ value, totalRatings }) {
    if (value == null) return null;
    return (
        <div className="flex flex-col gap-1">
            <p className="font-unbounded font-semibold text-[12px] tracking-widest uppercase text-primary">
                Note communauté
            </p>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => {
                        const full = i + 1 <= Math.floor(value);
                        const half = !full && i < value && (value % 1) >= 0.5;
                        return (
                            <Star
                                key={i}
                                className={`w-5 h-5 ${full || half ? "text-warning fill-warning" : "text-base-content/20 fill-none"}`}
                            />
                        );
                    })}
                </div>
                <span className="font-unbounded font-black text-xl text-warning">{value}</span>
                <span className="text-xs text-base-content/40 font-unbounded">({totalRatings})</span>
            </div>
        </div>
    );
}

// ─── StarRating compact ───────────────────────────────────────────────────────

export function StarRatingSmall({ value }) {
    if (value == null) return <span className="text-xs text-base-content/30">Non noté</span>;
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => {
                const full = i + 1 <= Math.floor(value);
                const half = !full && i < value && (value % 1) >= 0.5;
                return (
                    <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${full || half ? "text-warning fill-warning" : "text-base-content/20 fill-none"}`}
                    />
                );
            })}
        </div>
    );
}

// ─── Badges ───────────────────────────────────────────────────────────────────

const GENRE_COLORS = [
    "border-secondary/40 text-secondary/90",
    "border-accent/40 text-accent/90",
    "border-info/40 text-info/90",
    "border-primary/40 text-primary/90",
];

export function GenreBadge({ label, index = 0 }) {
    const cls = GENRE_COLORS[index % GENRE_COLORS.length];
    return (
        <span className={`badge badge-outline ${cls} font-unbounded text-[10px] tracking-widest uppercase px-3 py-2`}>
            {label}
        </span>
    );
}

export function TypePill({ type }) {
    const map = {
        movie: { label: "Film",  cls: "badge-primary"   },
        tv:    { label: "Série", cls: "badge-secondary" },
        anime: { label: "Animé", cls: "badge-accent"    },
    };
    const { label, cls } = map[type] ?? { label: type, cls: "badge-ghost" };
    return (
        <span className={`badge ${cls} font-unbounded text-[10px] tracking-widest uppercase`}>
            {label}
        </span>
    );
}

// ─── CastCard ─────────────────────────────────────────────────────────────────

export function CastCard({ member }) {
    return (
        <div className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-base-300 group-hover:ring-secondary/60 transition-all duration-300">
                <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => { e.target.src = koalaFallback; }}
                />
            </div>
            <div className="text-center">
                <p className="text-xs font-semibold text-base-content leading-tight">{member.name}</p>
                <p className="text-[10px] text-base-content/50 font-unbounded tracking-wide truncate max-w-20">{member.role}</p>
            </div>
        </div>
    );
}

// ─── PlatformBadge ────────────────────────────────────────────────────────────

export function PlatformBadge({ platform }) {
    return (
        <div className="tooltip" data-tip={platform.name}>
            <div className="w-10 h-10 rounded-btn overflow-hidden bg-base-300 ring-1 ring-base-content/10">
                {platform.logo
                    ? <img src={platform.logo} alt={platform.name} className="w-full h-full rounded-lg hover:-translate-y-0.5 hover:shadow-sm hover:shadow-accent transition-all duration-75 ease-in-out object-cover" />
                    : <span className="flex items-center justify-center h-full text-[9px] font-unbounded text-base-content/50 text-center px-1 leading-tight">{platform.name}</span>
                }
            </div>
        </div>
    );
}

// ─── TrailerButton ────────────────────────────────────────────────────────────

export function TrailerButton({ trailer }) {
    const [open, setOpen] = useState(false);
    if (!trailer) return null;
    return (
        <>
            <button onClick={() => setOpen(true)} className="btn btn-sm btn-secondary gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                </svg>
                Bande-annonce
            </button>
            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="relative w-full max-w-3xl aspect-video rounded-box overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <iframe
                            src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                            title={trailer.name}
                            className="w-full h-full"
                            allow="autoplay; fullscreen"
                            allowFullScreen
                        />
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute top-3 right-3 btn btn-circle btn-sm btn-ghost bg-black/60 hover:bg-black/80"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

// ─── WatchlistsBlock (placeholder) ───────────────────────────────────────────

export function WatchlistsBlock() {
    return (
        <div className="mt-12">
            <SectionTitle color="text-accent">Watchlists populaires</SectionTitle>
            <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }, (_, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-4 bg-base-200 border border-base-300 rounded-box p-3 animate-pulse"
                        style={{ animationDelay: `${i * 120}ms` }}
                    >
                        <div className="flex -space-x-2 shrink-0">
                            {[0, 1, 2].map((j) => (
                                <div key={j} className="skeleton w-9 h-12 rounded border-2 border-base-200" />
                            ))}
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="skeleton h-3 w-2/5 rounded" />
                            <div className="skeleton h-2 w-1/3 rounded" />
                        </div>
                        <div className="skeleton w-7 h-7 rounded-full shrink-0" />
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-base-content/20 font-unbounded text-center mt-4 tracking-widest">
                Données bientôt disponibles
            </p>
        </div>
    );
}

// ─── PageSkeleton ─────────────────────────────────────────────────────────────

export function PageSkeleton() {
    return (
        <div className="min-h-screen bg-base-100 animate-pulse">
            <div className="w-full h-[40vh] bg-base-300" />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-24 pb-20 space-y-6">
                <div className="flex gap-8 items-end">
                    <div className="w-32 sm:w-44 aspect-2/3 rounded-box bg-base-300" />
                    <div className="flex-1 space-y-3 pb-2">
                        <div className="h-3 w-32 bg-base-300 rounded" />
                        <div className="h-8 w-3/4 bg-base-300 rounded" />
                        <div className="h-3 w-48 bg-base-300 rounded" />
                    </div>
                </div>
                <div className="h-px bg-base-300 mt-4" />
                <div className="space-y-2 mt-4">
                    {[1, 2, 3].map((i) => <div key={i} className="h-3 bg-base-300 rounded w-full" />)}
                </div>
            </div>
        </div>
    );
}

// ─── SimilarCarousel ─────────────────────────────────────────────────────────

export function SimilarCarousel({ films, onNavigate }) {
    const [idx,    setIdx]    = useState(0);
    const [paused, setPaused] = useState(false);
    const VISIBLE    = 4;
    const total      = films.length;
    const maxIdx     = Math.max(0, total - VISIBLE);
    const intervalRef = useRef(null);

    const next = useCallback(() => setIdx((i) => (i >= maxIdx ? 0 : i + 1)), [maxIdx]);
    const prev = useCallback(() => setIdx((i) => (i <= 0 ? maxIdx : i - 1)), [maxIdx]);

    useEffect(() => {
        if (paused || total <= VISIBLE) return;
        intervalRef.current = setInterval(next, 5000);
        return () => clearInterval(intervalRef.current);
    }, [paused, next, total]);

    return (
        <div
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div className="overflow-hidden">
                <div
                    className="flex gap-4 transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(calc(-${idx} * (9rem + 1rem)))` }}
                >
                    {films.map((f) => (
                        <div
                            key={f.id}
                            className="group cursor-pointer shrink-0 w-32 sm:w-36"
                            onClick={() => onNavigate?.(f.id, f.type)}
                        >
                            <div className="relative overflow-hidden rounded-box aspect-2/3 bg-base-300">
                                <img
                                    src={f.img}
                                    alt={f.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => { e.target.src = koalaFallback; }}
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-base-100/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                                    <div>
                                        <p className="text-xs font-bold text-base-content leading-tight">{f.title}</p>
                                        {f.rating > 0 && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="text-warning text-xs">★</span>
                                                <span className="text-[10px] text-base-content/70">{f.rating}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2 px-1">
                                <p className="text-xs font-semibold text-base-content truncate">{f.title}</p>
                                <p className="text-[10px] text-base-content/40 font-unbounded">{f.year}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {total > VISIBLE && (
                <>
                    <button
                        onClick={prev}
                        className="absolute -left-4 top-1/3 -translate-y-1/2 btn btn-circle btn-xs btn-ghost bg-base-200/80 border border-secondary/20 hover:border-secondary/60 hover:text-secondary"
                        aria-label="Précédent"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={next}
                        className="absolute -right-4 top-1/3 -translate-y-1/2 btn btn-circle btn-xs btn-ghost bg-base-200/80 border border-secondary/20 hover:border-secondary/60 hover:text-secondary"
                        aria-label="Suivant"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    <div className="flex justify-center gap-1.5 mt-4">
                        {Array.from({ length: maxIdx + 1 }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => setIdx(i)}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                                    i === idx ? "bg-secondary w-4" : "bg-base-content/20"
                                }`}
                                aria-label={`Aller à la position ${i + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}