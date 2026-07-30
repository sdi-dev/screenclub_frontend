import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {Info, Play} from "lucide-react";

/* ─── TMDB CONFIG ──────────────────────────────────────────── */
const API_KEY   = import.meta.env.VITE_TMDB_API_KEY;
const IMG       = "https://image.tmdb.org/t/p/";
const BACKDROP  = (p) => p ? `${IMG}original${p}` : null;
const POSTER    = (p) => p ? `${IMG}w500${p}` : null;
const LOGO      = (p) => p ? `${IMG}w500${p}` : null;

const api = async (path, params = {}) => {
    const url = new URL(`https://api.themoviedb.org/3${path}`);
    url.searchParams.set("api_key", API_KEY);
    url.searchParams.set("language", "fr-FR");
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const r = await fetch(url);
    if (!r.ok) throw new Error(`TMDB ${r.status}`);
    return r.json();
};

/* ─── LOGO FETCH (best logo from images endpoint) ─────────── */
const fetchLogo = async (type, id) => {
    try {
        const data = await api(`/${type}/${id}/images`, {
            include_image_language: "fr,en,null",
        });
        const logos = data.logos ?? [];
        const pick  = logos.find(l => l.iso_639_1 === "fr") ?? logos[0];
        return pick ? LOGO(pick.file_path) : null;
    } catch {
        return null;
    }
};

/* ─── GENRE MAP (subset) ───────────────────────────────────── */
const GENRE_NAMES = {
    28: "Action", 12: "Aventure", 16: "Animation", 35: "Comédie",
    80: "Crime", 18: "Drame", 14: "Fantasy", 27: "Horreur",
    10749: "Romance", 878: "Sci-Fi", 53: "Thriller", 10752: "Guerre",
    37: "Western", 99: "Documentaire", 36: "Histoire",
    10759: "Action & Aventure", 10762: "Kids", 10763: "News",
    10764: "Reality", 10765: "Sci-Fi & Fantasy", 10766: "Soap",
    10767: "Talk", 10768: "War & Politics",
};


/* ═══════════════════════════════════════════════════════════
   HERO CAROUSEL  (Netflix-exact)
══════════════════════════════════════════════════════════════ */
function HeroCarousel({ items }) {
    const [active, setActive]     = useState(0);
    const [fading, setFading]     = useState(false);
    const [logos,  setLogos]      = useState({});
    const timerRef                = useRef(null);
    const DURATION                = 7000;

    /* preload logos */
    useEffect(() => {
        items.slice(0, 8).forEach(item => {
            const type = item.media_type === "movie" ? "movie" : "tv";
            fetchLogo(type, item.id).then(url => {
                if (url) setLogos(prev => ({ ...prev, [item.id]: url }));
            });
        });
    }, [items]);

    const goTo = useCallback((idx) => {
        setFading(true);
        setTimeout(() => {
            setActive(idx);
            setFading(false);
        }, 400);
    }, []);

    /* auto-advance */
    useEffect(() => {
        if (!items.length) return;
        timerRef.current = setInterval(() => {
            setActive(a => {
                const next = (a + 1) % Math.min(items.length, 8);
                setFading(true);
                setTimeout(() => setFading(false), 400);
                return next;
            });
        }, DURATION);
        return () => clearInterval(timerRef.current);
    }, [items]);

    const restartTimer = (idx) => {
        clearInterval(timerRef.current);
        goTo(idx);
        timerRef.current = setInterval(() => {
            setActive(a => {
                const next = (a + 1) % Math.min(items.length, 8);
                setFading(true);
                setTimeout(() => setFading(false), 400);
                return next;
            });
        }, DURATION);
    };

    const navigate = useNavigate();

    if (!items.length) return (
        <div className="w-full bg-base-200 flex items-center justify-center"
             style={{ height: "85vh" }}>
            <span className="loading loading-spinner loading-lg text-primary" />
        </div>
    );

    const item   = items[active];
    const genres = (item.genre_ids ?? []).slice(0, 3).map(g => GENRE_NAMES[g]).filter(Boolean);
    const title  = item.title ?? item.name;
    const type   = item.media_type === "movie" ? "Film" : "Série";
    const logo   = logos[item.id];
    const year   = (item.release_date ?? item.first_air_date ?? "").slice(0, 4);
    const routeType      = item.media_type === "movie" ? "movie" : "tv";
    const handleHeroClick = () => navigate(`/media/${routeType}/${item.id}`);

    return (
        <div className="relative w-full overflow-hidden select-none" style={{ height: "85vh", minHeight: 520 }}>

            {/* ── Backdrop image ── */}
            {items.slice(0, 8).map((it, i) => (
                <div key={it.id}
                     className="absolute inset-0 transition-opacity duration-500"
                     style={{ opacity: i === active ? 1 : 0 }}>
                    {BACKDROP(it.backdrop_path) && (
                        <img
                            src={BACKDROP(it.backdrop_path)}
                            alt=""
                            className="w-full h-full object-cover object-top"
                            style={{ filter: "brightness(0.55) saturate(1.1)" }}
                            loading={i === 0 ? "eager" : "lazy"}
                        />
                    )}
                </div>
            ))}

            {/* ── Gradient overlays ── */}
            <div className="absolute inset-0 pointer-events-none"
                 style={{
                     background: `
                         linear-gradient(to bottom, transparent 30%, oklch(10% 0.008 60) 100%),
                         linear-gradient(to right, oklch(10% 0.008 60 / 0.85) 0%, transparent 55%)
                     `
                 }} />

            {/* ── Content ── */}
            <div className="absolute inset-0 flex flex-col justify-end pb-32 px-8 md:px-16 lg:px-24"
                 style={{
                     opacity: fading ? 0 : 1,
                     transform: fading ? "translateY(8px)" : "translateY(0)",
                     transition: "opacity 0.4s ease, transform 0.4s ease",
                 }}>

                {/* Badge */}
                <div className="flex items-center gap-3 mb-4">
                    <span className="badge badge-primary text-xs font-bold tracking-widest uppercase px-3 py-2"
                          style={{ fontFamily: "var(--font-unbounded)" }}>
                        {type}
                    </span>
                    {year && (
                        <span className="text-base-content/60 text-sm"
                              style={{ fontFamily: "var(--font-unbounded)", fontSize: "0.7rem" }}>
                            {year}
                        </span>
                    )}
                    <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-primary fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                        </svg>
                        <span className="text-primary text-sm font-bold"
                              style={{ fontFamily: "var(--font-unbounded)", fontSize: "0.7rem" }}>
                            {item.vote_average?.toFixed(1)}
                        </span>
                    </div>
                </div>

                {/* Logo or title */}
                {logo ? (
                    <img src={logo} alt={title}
                         className="mb-4 max-h-24 md:max-h-32 w-auto object-contain object-left"
                         style={{ filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.8))" }} />
                ) : (
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 text-base-content leading-none"
                        style={{ fontFamily: "var(--font-unbounded)", textShadow: "0 4px 24px rgba(0,0,0,0.8)" }}>
                        {title}
                    </h1>
                )}

                {/* Genres */}
                {genres.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                        {genres.map((g, i) => (
                            <span key={g} className="flex items-center gap-2">
                                <span className="text-base-content/70 text-sm"
                                      style={{ fontFamily: "var(--font-unbounded)", fontSize: "0.65rem" }}>
                                    {g}
                                </span>
                                {i < genres.length - 1 && (
                                    <span className="text-primary/50">•</span>
                                )}
                            </span>
                        ))}
                    </div>
                )}

                {/* Overview */}
                <p className="text-base-content/80 text-sm md:text-base mb-6 max-w-xl leading-relaxed line-clamp-3">
                    {item.overview || "Aucune description disponible."}
                </p>

                {/* CTA buttons */}
                <div className="flex gap-3 flex-wrap">
                    <button className="btn btn-primary font-bold uppercase"
                            onClick={handleHeroClick}>
                        <Play />
                        Voir
                    </button>
                    <button className="btn btn-ghost uppercase border border-base-content/25 gap-2 px-7 font-bold backdrop-blur-sm"
                            onClick={handleHeroClick}>
                        <Info />
                        Plus d'infos
                    </button>
                </div>
            </div>

            {/* ── Bottom dot indicators ── */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {items.slice(0, 8).map((_, i) => (
                    <button key={i}
                            onClick={() => restartTimer(i)}
                            className="h-1 rounded-full transition-all duration-300 cursor-pointer"
                            style={{
                                width: i === active ? "2rem" : "0.5rem",
                                background: i === active
                                    ? "oklch(var(--color-primary))"
                                    : "oklch(var(--color-base-content) / 0.3)",
                            }} />
                ))}
            </div>

            {/* ── Progress bar (Netflix bar) ── */}
            <ProgressBar key={active} duration={DURATION} paused={fading} />

            {/* ── Bottom edge fade into page ── */}
            <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
                 style={{ background: "linear-gradient(to bottom, transparent, oklch(10% 0.008 60))" }} />
        </div>
    );
}

function ProgressBar({ duration, paused }) {
    return (
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "transparent" }}>
            <div className="h-full bg-primary/60 origin-left"
                 style={{
                     animation: paused ? "none" : `netflixProgress ${duration}ms linear forwards`,
                 }} />
            <style>{`
                @keyframes netflixProgress {
                    from { transform: scaleX(0); }
                    to   { transform: scaleX(1); }
                }
            `}</style>
        </div>
    );
}


/* ═══════════════════════════════════════════════════════════
   RANK BADGE  — large, coin haut-gauche, top-3 colorés
══════════════════════════════════════════════════════════════ */
const RANK_STYLES = {
    1: {
        color:  "#FFD700",          /* or */
        shadow: "0 0 18px #FFD70099, 0 2px 8px #00000088",
        stroke: "#BFA000",
    },
    2: {
        color:  "#C0C0C0",          /* argent */
        shadow: "0 0 14px #C0C0C066, 0 2px 8px #00000088",
        stroke: "#888",
    },
    3: {
        color:  "#CD7F32",          /* bronze */
        shadow: "0 0 14px #CD7F3266, 0 2px 8px #00000088",
        stroke: "#8B4500",
    },
};

function RankBadge({ rank }) {
    const s = RANK_STYLES[rank];

    const fontSize = rank <= 3
        ? "clamp(2.2rem, 4.5vw, 2.8rem)"
        : "clamp(1.6rem, 3vw, 2rem)";

    const color  = s?.color  ?? "rgba(255,255,255,0.85)";
    const shadow = s?.shadow ?? "0 1px 4px rgba(0,0,0,0.6)";

    return (
        <div className="absolute z-20 pointer-events-none"
             style={{ top: 0, left: 0 }}>
            <div style={{
                background:   "rgba(0,0,0,0.55)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                borderBottomRightRadius: "8px",
                padding:      "2px 8px 0px 6px",
                lineHeight:    1,
            }}>
                <span style={{
                    display:       "block",
                    fontFamily:    "'Bebas Neue', sans-serif",
                    fontWeight:     400,
                    fontSize,
                    lineHeight:     1,
                    color,
                    textShadow:    shadow,
                    letterSpacing: "0.02em",
                    userSelect:    "none",
                }}>
                    {rank}
                </span>
            </div>
        </div>
    );
}


/* ═══════════════════════════════════════════════════════════
   POSTER CARD
══════════════════════════════════════════════════════════════ */
function PosterCard({ item, rank }) {
    const [hovered, setHovered] = useState(false);
    const navigate = useNavigate();
    const title  = item.title ?? item.name;
    const year   = (item.release_date ?? item.first_air_date ?? "").slice(0, 4);
    const isTV   = item.media_type === "tv" || (item.media_type === undefined && item.first_air_date !== undefined);
    const typeLabel = isTV ? "Série" : "Film";
    /* TMDB route type : "movie" | "tv" — les animés sont "tv" côté TMDB */
    const routeType = item.media_type === "movie" ? "movie" : "tv";

    const handleClick = () => navigate(`/media/${routeType}/${item.id}`);

    return (
        <div className="relative flex-none cursor-pointer group"
             style={{ width: "clamp(130px, 11vw, 180px)" }}
             onClick={handleClick}
             onMouseEnter={() => setHovered(true)}
             onMouseLeave={() => setHovered(false)}>

            {/* Poster wrapper */}
            <div className="relative rounded-lg overflow-hidden"
                 style={{
                     aspectRatio: "2/3",
                     boxShadow: hovered
                         ? "0 20px 60px oklch(0% 0 0 / 0.7), 0 0 0 1.5px oklch(var(--color-primary) / 0.5)"
                         : "0 8px 24px oklch(0% 0 0 / 0.45)",
                     transform: hovered ? "scale(1.06) translateY(-4px)" : "scale(1) translateY(0)",
                     transition: "transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease",
                 }}>

                {POSTER(item.poster_path) ? (
                    <img src={POSTER(item.poster_path)} alt={title}
                         className="w-full h-full object-cover"
                         loading="lazy" />
                ) : (
                    <div className="w-full h-full bg-base-300 flex items-center justify-center p-3">
                        <span className="text-base-content/40 text-center text-xs leading-snug"
                              style={{ fontFamily: "var(--font-unbounded)" }}>
                            {title}
                        </span>
                    </div>
                )}

                {/* Rank badge — inside poster so nothing clips */}
                {rank !== undefined && <RankBadge rank={rank} />}

                {/* Hover overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-2.5"
                     style={{
                         background: "linear-gradient(to top, oklch(8% 0 0 / 0.92) 0%, transparent 55%)",
                         opacity: hovered ? 1 : 0,
                         transition: "opacity 0.25s ease",
                     }}>
                    <p className="text-white text-xs font-bold leading-snug line-clamp-2 mb-1"
                       style={{ fontFamily: "var(--font-unbounded)", fontSize: "0.6rem" }}>
                        {title}
                    </p>
                    <div className="flex items-center justify-between">
                        <span className="text-primary text-xs font-bold"
                              style={{ fontFamily: "var(--font-unbounded)", fontSize: "0.58rem" }}>
                            ★ {item.vote_average?.toFixed(1)}
                        </span>
                        <span className="text-base-content/50 text-xs"
                              style={{ fontSize: "0.55rem" }}>
                            {year}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                        <span className="badge badge-primary badge-xs"
                              style={{ fontFamily: "var(--font-unbounded)", fontSize: "0.5rem" }}>
                            {typeLabel}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}


/* ═══════════════════════════════════════════════════════════
   TRENDING ROW
══════════════════════════════════════════════════════════════ */
function TrendingRow({ title, items, showRank = false, loading = false }) {
    const rowRef   = useRef(null);
    const [canLeft,  setCanLeft]  = useState(false);
    const [canRight, setCanRight] = useState(true);

    const updateArrows = () => {
        const el = rowRef.current;
        if (!el) return;
        setCanLeft(el.scrollLeft > 8);
        setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
    };

    useEffect(() => {
        const el = rowRef.current;
        if (!el) return;
        el.addEventListener("scroll", updateArrows, { passive: true });
        updateArrows();
        return () => el.removeEventListener("scroll", updateArrows);
    }, [items]);

    const scroll = (dir) => {
        const el = rowRef.current;
        if (!el) return;
        const amount = el.clientWidth * 0.75;
        el.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
    };

    return (
        <section className="relative mb-10 group/row mx-4 md:mx-10 lg:mx-16">
            {/* Row header */}
            <div className="flex items-center gap-4 mb-4">
                <h2 className="text-base-content font-black tracking-tight"
                    style={{ fontFamily: "var(--font-unbounded)", fontSize: "clamp(0.85rem, 1.8vw, 1.15rem)" }}>
                    {title}
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                <span className="text-primary/70 font-bold text-xs cursor-pointer hover:text-primary transition-colors"
                      style={{ fontFamily: "var(--font-unbounded)", fontSize: "0.6rem", letterSpacing: "0.08em" }}>
                    VOIR TOUT →
                </span>
            </div>

            {/* Scroll container */}
            <div className="relative">
                {/* Left arrow */}
                <button
                    onClick={() => scroll("left")}
                    className="absolute left-0 top-0 bottom-0 z-10 w-12 items-center justify-center
                               transition-all duration-200 cursor-pointer hidden md:flex"
                    style={{
                        background: "linear-gradient(to right, oklch(10% 0.008 60 / 0.95), transparent)",
                        opacity: canLeft ? 1 : 0,
                        pointerEvents: canLeft ? "auto" : "none",
                    }}>
                    <svg className="w-6 h-6 text-base-content" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6"/>
                    </svg>
                </button>

                {/* Right arrow */}
                <button
                    onClick={() => scroll("right")}
                    className="absolute right-0 top-0 bottom-0 z-10 w-12 items-center justify-center
                               transition-all duration-200 cursor-pointer hidden md:flex"
                    style={{
                        background: "linear-gradient(to left, oklch(10% 0.008 60 / 0.95), transparent)",
                        opacity: canRight ? 1 : 0,
                        pointerEvents: canRight ? "auto" : "none",
                    }}>
                    <svg className="w-6 h-6 text-base-content" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/>
                    </svg>
                </button>

                {/* Items */}
                <div ref={rowRef}
                     className="flex gap-3 overflow-x-auto px-1 pb-3"
                     style={{
                         scrollbarWidth: "none",
                         msOverflowStyle: "none",
                         scrollSnapType: "x mandatory",
                     }}>
                    {loading
                        ? Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="flex-none rounded-lg animate-pulse bg-base-300"
                                 style={{
                                     width: "clamp(130px, 11vw, 180px)",
                                     aspectRatio: "2/3",
                                     scrollSnapAlign: "start",
                                 }} />
                        ))
                        : items.map((item, i) => (
                            <div key={item.id} style={{ scrollSnapAlign: "start" }}>
                                <PosterCard item={item} rank={showRank ? i + 1 : undefined} />
                            </div>
                        ))
                    }
                </div>
            </div>
        </section>
    );
}


/* ═══════════════════════════════════════════════════════════
   PAGE  TENDANCES
══════════════════════════════════════════════════════════════ */
function Tendances() {
    const [heroItems,   setHeroItems]   = useState([]);
    const [allTrend,    setAllTrend]    = useState([]);
    const [movies,      setMovies]      = useState([]);
    const [tvShows,     setTvShows]     = useState([]);
    const [anime,       setAnime]       = useState([]);
    const [loading,     setLoading]     = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [trendAll, trendMovies, trendTV, animeData] = await Promise.all([
                    api("/trending/all/week",   { page: 1 }),
                    api("/trending/movie/week", { page: 1 }),
                    api("/trending/tv/week",    { page: 1 }),
                    api("/discover/tv", {
                        with_genres: "16",
                        with_origin_country: "JP",
                        sort_by: "popularity.desc",
                        page: 1,
                    }),
                ]);

                const trending = trendAll.results   ?? [];
                const films    = trendMovies.results ?? [];
                const series   = trendTV.results    ?? [];
                const animes   = animeData.results  ?? [];

                /* hero = trending all, filtered for those with backdrop */
                const heroPool = trending
                    .filter(i => i.backdrop_path && i.overview)
                    .slice(0, 10);

                setHeroItems(heroPool);
                setAllTrend(trending.slice(0, 20));
                setMovies(films.slice(0, 20));
                setTvShows(series.slice(0, 20));
                setAnime(animes.slice(0, 20));
            } catch (err) {
                console.error("TMDB fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="relative bg-base-100 min-h-screen overflow-x-hidden">

            {/* ── Ambient glow at top (aesthetic) ── */}
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
                     style={{ background: "oklch(var(--color-primary))" }} />
                <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-8"
                     style={{ background: "oklch(var(--color-secondary))" }} />
            </div>

            <div className="relative" style={{ zIndex: 1 }}>

                {/* ──────────────── HERO CAROUSEL ──────────────── */}
                <HeroCarousel items={heroItems} />

                {/* ──────────────── ROWS ──────────────── */}
                <div className="pt-2 pb-20">

                    {/* Top 20 — Toutes catégories */}
                    <TrendingRow
                        title="🔥 Top 20 Tendances"
                        items={allTrend}
                        showRank
                        loading={loading}
                    />

                    {/* Top 20 Films */}
                    <TrendingRow
                        title="🎬 Top 20 Films"
                        items={movies}
                        showRank
                        loading={loading}
                    />

                    {/* Top 20 Séries */}
                    <TrendingRow
                        title="📺 Top 20 Séries"
                        items={tvShows}
                        showRank
                        loading={loading}
                    />

                    {/* Top 20 Anime */}
                    <TrendingRow
                        title="⛩️ Top 20 Anime"
                        items={anime}
                        showRank
                        loading={loading}
                    />
                </div>
            </div>

            {/* Scrollbar hide global + Bebas Neue font */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
                [style*="scrollbarWidth: none"]::-webkit-scrollbar,
                .overflow-x-auto::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
}

export default Tendances;