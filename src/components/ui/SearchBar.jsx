import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { searchSuggestions } from "@services/tmdb.js";

const DEBOUNCE_MS = 300;
const MIN_CHARS   = 2;

const TYPE_CONFIG = {
    movie: { label: "Film",  cls: "badge-primary"   },
    tv:    { label: "Série", cls: "badge-secondary" },
    anime: { label: "Animé", cls: "badge-accent"    },
};

export default function SearchBar({ className = "", inputClassName = "", onClose }) {
    const navigate = useNavigate();

    const [query,       setQuery]       = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [loading,     setLoading]     = useState(false);
    const [open,        setOpen]        = useState(false);
    const [activeIdx,   setActiveIdx]   = useState(-1);
    const [dropPos,     setDropPos]     = useState({ top: 0, left: 0, width: 340 });

    const wrapperRef  = useRef(null);
    const inputRef    = useRef(null);
    const dropdownRef = useRef(null);
    const debounceRef = useRef(null);
    const rafRef      = useRef(null);

    // ── Calcul de position — rAF pour laisser l'animation CSS se terminer ──
    const recalcPos = useCallback(() => {
        cancelAnimationFrame(rafRef.current);
        // Double rAF pour être sûr que le layout est stable même après une animation
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = requestAnimationFrame(() => {
                if (!wrapperRef.current) return;
                const r = wrapperRef.current.getBoundingClientRect();
                setDropPos({
                    top:   r.bottom + window.scrollY + 8,
                    left:  r.left   + window.scrollX,
                    width: Math.max(r.width, 320),
                });
            });
        });
    }, []);

    // ── Recalcul à chaque ouverture + resize ──────────────────────────────
    useEffect(() => {
        if (open) {
            recalcPos();
            window.addEventListener("resize", recalcPos);
            window.addEventListener("scroll", recalcPos, { passive: true });
        }
        return () => {
            window.removeEventListener("resize", recalcPos);
            window.removeEventListener("scroll", recalcPos);
            cancelAnimationFrame(rafRef.current);
        };
    }, [open, recalcPos]);

    // ── Debounce + fetch ──────────────────────────────────────────────────
    useEffect(() => {
        if (query.trim().length < MIN_CHARS) {
            setSuggestions([]);
            setOpen(false);
            return;
        }
        setLoading(true);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                const results = await searchSuggestions(query.trim(), 8);
                setSuggestions(results);
                if (results.length > 0) {
                    setOpen(true);
                    recalcPos();  // position fraîche après le fetch
                } else {
                    setOpen(false);
                }
                setActiveIdx(-1);
            } catch (err) {
                console.error("[SearchBar] TMDB error:", err);
                setSuggestions([]);
                setOpen(false);
            } finally {
                setLoading(false);
            }
        }, DEBOUNCE_MS);
        return () => clearTimeout(debounceRef.current);
    }, [query, recalcPos]);

    // ── Fermeture au clic/tap extérieur ───────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                wrapperRef.current  && !wrapperRef.current.contains(e.target)
            ) setOpen(false);
        };
        document.addEventListener("pointerdown", handler);
        return () => document.removeEventListener("pointerdown", handler);
    }, []);

    // ── Navigation vers une fiche ──────────────────────────────────────────
    const goToMedia = useCallback((item) => {
        const routeType = item.tmdbType ?? (item.mediaType === "movie" ? "movie" : "tv");
        setQuery("");
        setSuggestions([]);
        setOpen(false);
        onClose?.();
        navigate(`/media/${routeType}/${item.id}`);
    }, [navigate, onClose]);

    const goToSearch = useCallback((q) => {
        if (!q.trim()) return;
        setOpen(false);
        onClose?.();
        navigate(`/recherche?q=${encodeURIComponent(q.trim())}`);
    }, [navigate, onClose]);

    // ── Navigation clavier ────────────────────────────────────────────────
    const handleKeyDown = (e) => {
        switch (e.key) {
            case "ArrowDown":
                if (!open) return;
                e.preventDefault();
                setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
                break;
            case "ArrowUp":
                if (!open) return;
                e.preventDefault();
                setActiveIdx((i) => Math.max(i - 1, -1));
                break;
            case "Enter":
                e.preventDefault();
                if (open && activeIdx >= 0) goToMedia(suggestions[activeIdx]);
                else goToSearch(query);
                break;
            case "Escape":
                setOpen(false);
                inputRef.current?.blur();
                break;
            default:
                break;
        }
    };

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            {/* ── Input ── */}
            <label
                className={`input flex items-center gap-2 ${inputClassName}`}
                onClick={() => suggestions.length > 0 && setOpen(true)}
            >
                {loading ? (
                    <span className="loading loading-spinner loading-xs opacity-50 shrink-0" />
                ) : (
                    <svg className="h-4 w-4 shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                )}
                <input
                    ref={inputRef}
                    type="search"
                    placeholder="Film, série, animé…"
                    className="grow bg-transparent outline-none text-sm min-w-0"
                    aria-label="Rechercher un média"
                    aria-autocomplete="list"
                    aria-expanded={open}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        if (suggestions.length > 0) {
                            setOpen(true);
                            recalcPos();
                        }
                    }}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                    spellCheck={false}
                />
                {query && (
                    <button
                        type="button"
                        className="shrink-0 opacity-40 hover:opacity-80 transition-opacity"
                        onPointerDown={(e) => e.preventDefault()}
                        onClick={() => {
                            setQuery("");
                            setSuggestions([]);
                            setOpen(false);
                            inputRef.current?.focus();
                        }}
                        aria-label="Effacer"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </label>

            {/* ── Dropdown — portal pour échapper à overflow:hidden du panneau mobile ── */}
            {open && suggestions.length > 0 && createPortal(
                <div
                    ref={dropdownRef}
                    role="listbox"
                    style={{
                        position: "absolute",
                        top:      dropPos.top,
                        left:     dropPos.left,
                        width:    dropPos.width,
                        zIndex:   9999,
                    }}
                    className="bg-base-200 border border-base-300 rounded-box shadow-2xl shadow-black/50 overflow-hidden"
                >
                    {suggestions.map((item, idx) => {
                        const tc       = TYPE_CONFIG[item.mediaType] ?? TYPE_CONFIG.tv;
                        const isActive = idx === activeIdx;
                        return (
                            <button
                                key={`${item.id}-${item.mediaType}`}
                                role="option"
                                aria-selected={isActive}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors duration-100 border-b border-base-300/50 last:border-0 cursor-pointer ${
                                    isActive ? "bg-primary/15" : "hover:bg-base-300/60"
                                }`}
                                onPointerDown={(e) => e.preventDefault()}
                                onClick={() => goToMedia(item)}
                            >
                                {/* Poster miniature */}
                                <div className="shrink-0 w-9 h-[54px] rounded overflow-hidden bg-base-300">
                                    {item.poster ? (
                                        <img src={item.poster} alt={item.title}
                                             className="w-full h-full object-cover" loading="lazy" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-base-content/20">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V4h-4z"/>
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Infos */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-semibold text-base-content truncate leading-tight">
                                            {item.title}
                                        </span>
                                        <span className={`badge badge-xs shrink-0 font-unbounded ${tc.cls}`}>
                                            {tc.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[11px] text-base-content/40 font-unbounded">{item.year}</span>
                                        {item.voteAvg > 0 && (
                                            <>
                                                <span className="text-base-content/20 text-[10px]">·</span>
                                                <span className="text-[11px] text-primary/70 flex items-center gap-0.5">
                                                    ★ {(item.voteAvg / 2).toFixed(1)}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    {item.overview && (
                                        <p className="text-[11px] text-base-content/40 mt-0.5 truncate">
                                            {item.overview}
                                        </p>
                                    )}
                                </div>

                                <svg className="w-3.5 h-3.5 shrink-0 text-base-content/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                                </svg>
                            </button>
                        );
                    })}

                    {/* Voir tous les résultats */}
                    <button
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-unbounded text-base-content/40 hover:text-primary hover:bg-base-300/40 transition-colors border-t border-base-300"
                        onPointerDown={(e) => e.preventDefault()}
                        onClick={() => goToSearch(query)}
                    >
                        Voir tous les résultats pour « {query} »
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                        </svg>
                    </button>
                </div>,
                document.body
            )}
        </div>
    );
}