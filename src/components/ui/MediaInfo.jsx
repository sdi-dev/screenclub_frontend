import { useState, useEffect, useRef, useCallback } from "react";
import { Heart } from "lucide-react";
import { getMediaFull, normalizeMedia } from "@services/tmdb.js";
import NoteModal from "@components/ui/modales/NoteModal.jsx";
import CreateWatchlistModal from "@components/ui/modales/CreateWatchlistModal.jsx";
import AuthModal from "@components/ui/modales/AuthModal.jsx";
import { isConnected } from "@/api/auth.js";
import koalaFallback from "@images/koala_win7.png";
import { getAvisByTmdbId, toggleLikeAvis } from "@/api/avis.js";
import { toggleFavori, getFavoriStatus }   from "@api/Favoris.js";

// ─── Titre de section ──────────────────────────────────────────────────────
function SectionTitle({ children }) {
    return (
        <h2 className="font-unbounded font-semibold text-[12px] tracking-widest uppercase text-primary mb-5">
            {children}
        </h2>
    );
}

// ─── Note communauté (demi-étoiles SVG + compteur) ────────────────────────
function CommunityRating({ value, totalRatings }) {
    if (value == null) return null;
    return (
        <div className="flex flex-col gap-1">
            <p className="font-unbounded font-semibold text-[12px] tracking-widest uppercase text-primary">
                Note communauté
            </p>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => {
                        const full  = i + 1 <= Math.floor(value);
                        const half  = !full && i < value && (value % 1) >= 0.5;
                        return (
                            <svg key={i} className="w-5 h-5" viewBox="0 0 24 24">
                                <defs>
                                    <linearGradient id={`sg-${i}`} x1="0" x2="1" y1="0" y2="0">
                                        <stop offset="50%" stopColor="oklch(var(--color-warning))" />
                                        <stop offset="50%" stopColor="transparent" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-3.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                                    fill={full ? "oklch(var(--color-warning))" : half ? `url(#sg-${i})` : "oklch(var(--color-base-content) / 0.15)"}
                                    stroke={full || half ? "oklch(var(--color-warning))" : "oklch(var(--color-base-content) / 0.15)"}
                                    strokeWidth={0.5}
                                />
                            </svg>
                        );
                    })}
                </div>
                <span className="font-unbounded font-black text-xl text-warning">{value}</span>
                <span className="text-xs text-base-content/40 font-unbounded">({totalRatings})</span>
            </div>
        </div>
    );
}

// ─── StarRating compact (avis TMDB) ──────────────────────────────────────
function StarRatingSmall({ value }) {
    if (value == null) return <span className="text-xs text-base-content/30">Non noté</span>;
    return (
        <div className="flex items-center gap-0.5 text-sm">
            {Array.from({ length: 5 }, (_, i) => {
                const full = i + 1 <= Math.floor(value);
                const half = !full && i < value && (value % 1) >= 0.5;
                return (
                    <span key={i} className={full || half ? "text-warning" : "text-base-content/20"}>
                        {full ? "★" : half ? "⯨" : "☆"}
                    </span>
                );
            })}
        </div>
    );
}

function GenreBadge({ label }) {
    return (
        <span className="badge badge-outline border-primary/40 text-primary/90 font-unbounded text-[10px] tracking-widest uppercase px-3 py-2">
            {label}
        </span>
    );
}

function TypePill({ type }) {
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

function CastCard({ member }) {
    return (
        <div className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-base-300 group-hover:ring-primary/60 transition-all duration-300">
                <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => { e.target.src = koalaFallback; }}
                />
            </div>
            <div className="text-center">
                <p className="text-xs font-semibold text-base-content leading-tight">{member.name}</p>
                <p className="text-[10px] text-base-content/50 font-unbounded tracking-wide truncate max-w-[80px]">{member.role}</p>
            </div>
        </div>
    );
}

function ReviewCard({ review }) {
    const [expanded, setExpanded]   = useState(false);
    const [liked,    setLiked]      = useState(false);
    const [likeCount, setLikeCount] = useState(review.likeCount ?? 0);
    const isLong = review.text?.length > 300;

    const handleLike = async () => {
        // Optimistic update
        const wasLiked = liked;
        setLiked(!wasLiked);
        setLikeCount((c) => wasLiked ? c - 1 : c + 1);
        try {
            await toggleLikeAvis(review.id);
        } catch {
            // Rollback si erreur
            setLiked(wasLiked);
            setLikeCount((c) => wasLiked ? c + 1 : c - 1);
        }
    };

    return (
        <div className="card bg-base-200 border border-base-300 hover:border-primary/30 transition-colors duration-300">
            <div className="card-body p-5 gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="avatar">
                            <div className="w-9 rounded-full ring ring-base-300">
                                <img src={review.avatar} alt={review.user}
                                     onError={(e) => { e.target.src = koalaFallback; }} />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-base-content">{review.user}</p>
                            <p className="text-[10px] text-base-content/40 font-unbounded">{review.date}</p>
                        </div>
                    </div>
                    <StarRatingSmall value={review.rating} />
                </div>
                <p className="text-sm text-base-content/70 leading-relaxed">
                    {isLong && !expanded ? `${review.text.slice(0, 300)}…` : review.text}
                </p>
                <div className="flex items-center justify-between mt-1">
                    {isLong ? (
                        <button onClick={() => setExpanded((e) => !e)}
                                className="text-xs text-primary/70 hover:text-primary transition-colors">
                            {expanded ? "Voir moins" : "Lire la suite"}
                        </button>
                    ) : <span />}
                    <button
                        onClick={handleLike}
                        className="flex items-center gap-1.5 text-xs text-base-content/40 hover:text-error transition-colors group"
                        title={liked ? "Retirer le like" : "Liker cet avis"}
                    >
                        <Heart
                            className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${
                                liked ? "fill-error text-error" : "fill-none"
                            }`}
                        />
                        {likeCount > 0 && (
                            <span className={liked ? "text-error" : ""}>{likeCount}</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Carrousel "Dans le même genre" ──────────────────────────────────────
function SimilarCarousel({ films, onNavigate }) {
    const [idx, setIdx]         = useState(0);
    const [paused, setPaused]   = useState(false);
    const VISIBLE               = 4; // cartes visibles à la fois
    const total                 = films.length;
    const maxIdx                = Math.max(0, total - VISIBLE);
    const intervalRef           = useRef(null);

    const next = useCallback(() => setIdx((i) => (i >= maxIdx ? 0 : i + 1)), [maxIdx]);
    const prev = useCallback(() => setIdx((i) => (i <= 0 ? maxIdx : i - 1)), [maxIdx]);

    // Auto-défilement 5s
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
            {/* Piste */}
            <div className="overflow-hidden">
                <div
                    className="flex gap-4 transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(calc(-${idx} * (9rem + 1rem)))` }}
                >
                    {films.map((f) => (
                        <div
                            key={f.id}
                            className="group cursor-pointer flex-shrink-0 w-32 sm:w-36"
                            onClick={() => onNavigate?.(f.id, f.type)}
                        >
                            <div className="relative overflow-hidden rounded-box aspect-[2/3] bg-base-300">
                                <img
                                    src={f.img}
                                    alt={f.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => { e.target.src = koalaFallback; }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-base-100/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
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

            {/* Boutons nav (seulement si plus de VISIBLE films) */}
            {total > VISIBLE && (
                <>
                    <button
                        onClick={prev}
                        className="absolute -left-4 top-1/3 -translate-y-1/2 btn btn-circle btn-xs btn-ghost bg-base-200/80 border border-base-300 hover:bg-base-300"
                        aria-label="Précédent"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
                        </svg>
                    </button>
                    <button
                        onClick={next}
                        className="absolute -right-4 top-1/3 -translate-y-1/2 btn btn-circle btn-xs btn-ghost bg-base-200/80 border border-base-300 hover:bg-base-300"
                        aria-label="Suivant"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                        </svg>
                    </button>

                    {/* Points indicateurs */}
                    <div className="flex justify-center gap-1.5 mt-4">
                        {Array.from({ length: maxIdx + 1 }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => setIdx(i)}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                                    i === idx ? "bg-primary w-4" : "bg-base-content/20"
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

function PlatformBadge({ platform }) {
    return (
        <div className="tooltip" data-tip={platform.name}>
            <div className="w-10 h-10 rounded-btn overflow-hidden bg-base-300 ring-1 ring-base-content/10">
                {platform.logo
                    ? <img src={platform.logo} alt={platform.name} className="w-full h-full rounded-lg hover:-translate-y-0.5 hover:shadow-sm hover:shadow-primary transition-all duration-75 ease-in-out object-cover" />
                    : <span className="flex items-center justify-center h-full text-[9px] font-unbounded text-base-content/50 text-center px-1 leading-tight">{platform.name}</span>
                }
            </div>
        </div>
    );
}

function TrailerButton({ trailer }) {
    const [open, setOpen] = useState(false);
    if (!trailer) return null;
    return (
        <>
            <button onClick={() => setOpen(true)} className="btn btn-sm btn-ghost gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                </svg>
                Bande-annonce
            </button>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                     onClick={() => setOpen(false)}>
                    <div className="relative w-full max-w-3xl aspect-video rounded-box overflow-hidden shadow-2xl"
                         onClick={(e) => e.stopPropagation()}>
                        <iframe
                            src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                            title={trailer.name}
                            className="w-full h-full"
                            allow="autoplay; fullscreen"
                            allowFullScreen
                        />
                        <button onClick={() => setOpen(false)}
                                className="absolute top-3 right-3 btn btn-circle btn-sm btn-ghost bg-black/60 hover:bg-black/80">
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

// ─── Watchlists skeleton ───────────────────────────────────────────────────
function WatchlistsBlock() {
    return (
        <div className="mt-12">
            <SectionTitle>Watchlists populaires</SectionTitle>
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

// ─── Skeleton chargement ───────────────────────────────────────────────────
function PageSkeleton() {
    return (
        <div className="min-h-screen bg-base-100 animate-pulse">
            <div className="w-full h-[40vh] bg-base-300" />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-24 pb-20 space-y-6">
                <div className="flex gap-8 items-end">
                    <div className="w-32 sm:w-44 aspect-[2/3] rounded-box bg-base-300" />
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

// ─── Page principale ───────────────────────────────────────────────────────
export default function MediaInfo({ id, type = "movie", onNavigate }) {
    const [media,      setMedia]      = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState(null);
    const [activeTab,  setActiveTab]  = useState("cast");
    const [noteOpen,      setNoteOpen]      = useState(false);
    const [watchlistOpen, setWatchlistOpen] = useState(false);
    const [authOpen,      setAuthOpen]      = useState(false);

    const [isFavori,      setIsFavori]      = useState(false);
    const [favoriLoading, setFavoriLoading] = useState(false);

    const [screenclubAvis, setScreenclubAvis] = useState([]);
    const [avisLoading,    setAvisLoading]    = useState(false);

    const fetchAvis = useCallback(async () => {
        if (!id) return;
        setAvisLoading(true);
        try {
            const data = await getAvisByTmdbId(id);
            setScreenclubAvis(data ?? []);
        } catch {
            setScreenclubAvis([]);
        } finally {
            setAvisLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchAvis();
    }, [fetchAvis]);

    // ── Statut favori ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!id || !isConnected()) return;
        getFavoriStatus(id, type)
            .then((data) => setIsFavori(data?.favori ?? false))
            .catch(() => setIsFavori(false));
    }, [id, type]);

    const handleToggleFavori = async () => {
        if (!isConnected()) { setAuthOpen(true); return; }
        setFavoriLoading(true);
        // Optimistic update
        const prev = isFavori;
        setIsFavori(!prev);
        try {
            const data = await toggleFavori({ tmdbId: id, tmdbType: type });
            setIsFavori(data?.favori ?? !prev);
        } catch {
            setIsFavori(prev); // rollback
        } finally {
            setFavoriLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(null);
        setMedia(null);
        setActiveTab("cast");
        getMediaFull(id, type)
            .then((raw) => setMedia(normalizeMedia(raw, type)))
            .catch((e)  => setError(e.message))
            .finally(()  => setLoading(false));
    }, [id, type]);

    if (loading) return <PageSkeleton />;
    if (error) return (
        <div className="min-h-screen bg-base-100 flex items-center justify-center">
            <div className="card bg-base-200 border border-error/30 p-8 text-center max-w-sm">
                <p className="text-error font-unbounded text-sm mb-2">Erreur de chargement</p>
                <p className="text-base-content/50 text-xs">{error}</p>
            </div>
        </div>
    );
    if (!media) return null;

    const mediaForModal = { tmdbId: media.tmdbId, tmdbType: type, title: media.title, posterUrl: media.poster };

    const metaItems = [
        { label: "Pays",   value: media.country  },
        { label: "Langue", value: media.language },
        ...(media.type === "tv"
                ? [
                    { label: "Saisons",  value: `${media.seasons} saison${media.seasons > 1 ? "s" : ""}` },
                    { label: "Épisodes", value: media.episodes },
                ]
                : [
                    { label: "Durée",  value: media.duration },
                    { label: "Sortie", value: media.year     },
                ]
        ),
    ];

    return (
        <div className="min-h-screen bg-base-100 text-base-content">

            {/* ── BACKDROP ── */}
            <div className="relative w-full h-[40vh] overflow-hidden">
                {media.backdrop ? (
                    <img src={media.backdrop} alt={`${media.title} backdrop`}
                         className="w-full h-full object-cover object-top" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-base-300 to-base-200" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-base-100/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-base-100/70 via-transparent to-transparent" />
                <div className="absolute top-0 inset-x-0 px-6 py-4 flex justify-end">
                    <a href={media.tmdbUrl} target="_blank" rel="noopener noreferrer"
                       className="btn btn-xs btn-ghost opacity-40 hover:opacity-100 font-unbounded text-[10px]">
                        TMDB ↗
                    </a>
                </div>
            </div>

            {/* ── MAIN ── */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-24 relative z-10 pb-20">

                {/* ── Poster + Titre ── */}
                <div className="flex gap-6 sm:gap-10 items-end">
                    <div className="flex-shrink-0 w-32 sm:w-44">
                        <div className="rounded-box overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/10">
                            <img src={media.poster} alt={media.title}
                                 className="w-full aspect-[2/3] object-cover"
                                 onError={(e) => { e.target.src = koalaFallback; }} />
                        </div>
                    </div>
                    <div className="flex-1 pb-2">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <TypePill type={media.type} />
                            {media.genres.slice(0, 3).map((g) => <GenreBadge key={g} label={g} />)}
                        </div>
                        <h1 className="font-unbounded font-black text-2xl sm:text-4xl leading-tight text-base-content mb-1">
                            {media.title}
                        </h1>
                        {media.originalTitle !== media.title && (
                            <p className="text-xs text-base-content/30 font-unbounded mb-1">{media.originalTitle}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-base-content/50 font-unbounded mt-2">
                            <span className="text-primary font-bold">{media.year}</span>
                            <span className="w-px h-3 bg-base-content/20" />
                            <span>{media.duration}</span>
                            {media.type === "tv" && media.status && (
                                <>
                                    <span className="w-px h-3 bg-base-content/20" />
                                    <span className={media.status === "Ended" ? "text-error/70" : "text-success/70"}>
                                        {media.status === "Ended" ? "Terminée" : "En cours"}
                                    </span>
                                </>
                            )}
                        </div>
                        <p className="text-xs text-base-content/40 mt-1">
                            {media.type === "tv" ? "Créé par" : "Réalisé par"}{" "}
                            <span className="text-base-content/70 font-semibold">{media.director}</span>
                        </p>
                        {media.type === "tv" && media.network && (
                            <p className="text-xs text-base-content/30 mt-0.5 font-unbounded">{media.network}</p>
                        )}
                    </div>
                </div>

                {/* ── BARRE D'ACTIONS ── */}
                <div className="flex flex-wrap items-center justify-between gap-6 mt-8 py-5 border-y border-base-300">
                    <CommunityRating value={media.avgRating} totalRatings={media.totalRatings} />
                    <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => isConnected() ? setNoteOpen(true) : setAuthOpen(true)} className="btn btn-sm btn-primary gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            Laisser un avis
                        </button>
                        <button
                            onClick={handleToggleFavori}
                            disabled={favoriLoading}
                            title={isFavori ? "Retirer des favoris" : "Ajouter aux favoris"}
                            className={`btn btn-sm gap-2 transition-all duration-200 ${
                                isFavori
                                    ? "btn-error border-error/60 hover:btn-error"
                                    : "btn-outline border-base-content/20 hover:border-error/60 hover:text-error"
                            }`}
                        >
                            <Heart
                                className={`w-4 h-4 transition-all duration-200 ${
                                    isFavori ? "fill-current" : "fill-none"
                                } ${favoriLoading ? "animate-pulse" : ""}`}
                            />
                            {isFavori ? "Favori" : "Favoris"}
                        </button>
                        <button onClick={() => isConnected() ? setWatchlistOpen(true) : setAuthOpen(true)} className="btn btn-sm btn-outline gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Créer une watchlist
                        </button>
                        <TrailerButton trailer={media.trailer} />
                    </div>
                </div>

                {/* ── SYNOPSIS ── */}
                <div className="mt-8">
                    <SectionTitle>Synopsis</SectionTitle>
                    <p className="text-base-content/80 leading-relaxed max-w-2xl text-sm sm:text-base">{media.synopsis}</p>
                </div>

                {/* ── PLATEFORMES ── */}
                {media.platforms.length > 0 && (
                    <div className="mt-8">
                        <SectionTitle>Où regarder (France)</SectionTitle>
                        <div className="flex flex-wrap gap-2">
                            {media.platforms.map((p) => <PlatformBadge key={p.name} platform={p} />)}
                        </div>
                    </div>
                )}

                {/* ── MÉTA GRID ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                    {metaItems.map((item) => (
                        <div key={item.label} className="bg-base-200 rounded-box p-4 border border-base-300">
                            <p className="text-[10px] font-unbounded font-semibold tracking-widest uppercase text-primary/70 mb-1">
                                {item.label}
                            </p>
                            <p className="font-semibold text-base-content text-sm">{item.value ?? "—"}</p>
                        </div>
                    ))}
                </div>

                {/* ── ONGLETS CASTING / AVIS ── */}
                <div className="mt-12">
                    <div className="flex gap-1 border-b border-base-300 mb-6">
                        {[
                            { key: "cast",       label: "Casting" },
                            { key: "reviews",    label: `Avis TMDB (${media.reviews.length})` },
                            { key: "screenclub", label: `Avis ScreenClub (${screenclubAvis.length})` },
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`font-unbounded text-[11px] uppercase tracking-widest px-4 py-2 border-b-2 transition-all duration-200 ${
                                    activeTab === key
                                        ? "border-primary text-primary font-semibold"
                                        : "border-transparent text-base-content/40 hover:text-base-content/70"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {activeTab === "cast" && (
                        media.cast.length > 0 ? (
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                                {media.cast.map((m) => <CastCard key={m.id} member={m} />)}
                            </div>
                        ) : (
                            <p className="text-base-content/30 text-sm font-unbounded">Aucun casting disponible.</p>
                        )
                    )}

                    {activeTab === "reviews" && (
                        media.reviews.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {media.reviews.map((r) => <ReviewCard key={r.user} review={r} />)}
                            </div>
                        ) : (
                            <p className="text-base-content/30 text-sm font-unbounded">Aucun avis disponible.</p>
                        )
                    )}

                    {activeTab === "screenclub" && (
                        avisLoading ? (
                            <div className="flex justify-center py-8">
                                <span className="loading loading-spinner loading-md text-primary" />
                            </div>
                        ) : screenclubAvis.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {screenclubAvis.map((a) => (
                                    <ReviewCard
                                        key={a.id}
                                        review={{
                                            id:        a.id,
                                            user:      a.utilisateurPseudo,
                                            avatar:    a.utilisateurAvatar ?? `https://api.dicebear.com/7.x/thumbs/svg?seed=${a.utilisateurPseudo}`,
                                            date:      new Date(a.dateNote).toLocaleDateString("fr-FR"),
                                            rating:    a.note,
                                            text:      a.avis ?? "",
                                            likeCount: a.likeCount ?? 0,
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-base-content/30 text-sm font-unbounded">
                                Aucun avis ScreenClub pour ce titre. Sois le premier !
                            </p>
                        )
                    )}
                </div>

                {/* ── WATCHLISTS ── */}
                <WatchlistsBlock />

                {/* ── SIMILAIRES (carrousel) ── */}
                {media.similar.length > 0 && (
                    <div className="mt-14">
                        <SectionTitle>Dans le même genre</SectionTitle>
                        <SimilarCarousel films={media.similar} onNavigate={onNavigate} />
                    </div>
                )}
            </div>

            {/* ── MODALES ── */}
            <NoteModal
                isOpen={noteOpen}
                onClose={() => setNoteOpen(false)}
                onSuccess={() => { fetchAvis(); setActiveTab("screenclub"); }}
                media={mediaForModal}
            />
            <CreateWatchlistModal
                isOpen={watchlistOpen}
                onClose={() => setWatchlistOpen(false)}
                initialMedia={mediaForModal}
            />
            <AuthModal
                isOpen={authOpen}
                onClose={() => setAuthOpen(false)}
            />
        </div>
    );
}