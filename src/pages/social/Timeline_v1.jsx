import { useState, useEffect, useRef } from "react";
import BlobsBackground from "@components/layout/BlobsBackground.jsx";
import GridBackground from "@components/layout/GridBackground.jsx";

// ─── Design tokens (Dim palette) ──────────────────────────────────────────────
const DIM = {
    bg:        "var(--color-base-100)",
    surface:   "oklch(from var(--color-base-200) l c h / 0.7)",
    surfaceHi: "oklch(from var(--color-base-200) l c h / 0.9)",
    border:    "oklch(from var(--color-base-content) l c h / 0.12)",
    divider:   "oklch(from var(--color-base-content) l c h / 0.08)",
    input:     "var(--color-base-300)",
};

// ─── Feed cards ───────────────────────────────────────────────────────────────

const cardBase = {
    borderRadius: "0.75rem",
    padding: "1rem",
    backdropFilter: "blur(10px)",
    background: DIM.surface,
    border: `1px solid ${DIM.border}`,
    transition: "transform 0.18s ease",
};

function ActionBar({ id, liked, likes, comments, onLike }) {
    return (
        <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: `1px solid ${DIM.divider}` }}>
            <button onClick={() => onLike(id)}
                    className="flex items-center gap-1.5 text-xs text-base-content/50 hover:text-primary transition-colors duration-150 cursor-pointer">
                <svg className="w-4 h-4" fill={liked ? "oklch(from var(--color-primary) l c h)" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span className={liked ? "font-bold" : ""}>{likes + (liked ? 1 : 0)}</span>
            </button>
            <button className="flex items-center gap-1.5 text-xs text-base-content/50 hover:text-secondary transition-colors duration-150 cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>{comments}</span>
            </button>
            <button className="flex items-center gap-1.5 text-xs text-base-content/50 hover:text-accent transition-colors duration-150 cursor-pointer ml-auto">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Partager
            </button>
        </div>
    );
}

function CardRating({ item, onLike }) {
    const { user, content, timestamp, likes, comments, liked, id } = item;
    return (
        <article className="flex gap-3 hover:scale-[1.002]" style={cardBase}>
            <Avatar initials={user.avatar} />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-black text-sm text-base-content">{user.name}</span>
                    <span className="text-xs text-base-content/40">@{user.handle}</span>
                    <span className="text-xs text-base-content/30 ml-auto shrink-0">{timestamp}</span>
                </div>
                <p className="text-xs text-base-content/45 mb-3">a noté :</p>
                <div className="flex gap-3 items-start">
                    <PosterPlaceholder title={content.title} type={content.type} />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-black font-unbounded text-sm text-base-content truncate">{content.title}</span>
                            <span className="text-xs text-base-content/40">{content.year}</span>
                            <MediaBadge type={content.type} />
                        </div>
                        <StarRating rating={content.rating} />
                        {content.review && (
                            <p className="text-sm text-base-content/65 mt-2 leading-relaxed line-clamp-2">{content.review}</p>
                        )}
                    </div>
                </div>
                <ActionBar id={id} liked={liked} likes={likes} comments={comments} onLike={onLike} />
            </div>
        </article>
    );
}

function CardWatchlist({ item, onLike }) {
    const { user, content, timestamp, likes, comments, liked, id } = item;
    return (
        <article className="flex gap-3 hover:scale-[1.002]" style={cardBase}>
            <Avatar initials={user.avatar} color="secondary" />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-black text-sm text-base-content">{user.name}</span>
                    <span className="text-xs text-base-content/40">@{user.handle}</span>
                    <span className="text-xs text-base-content/30 ml-auto shrink-0">{timestamp}</span>
                </div>
                <div className="flex gap-3 items-center">
                    <PosterPlaceholder title={content.title} type={content.type} />
                    <div>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="font-black font-unbounded text-sm text-base-content">{content.title}</span>
                            <span className="text-xs text-base-content/40">{content.year}</span>
                            <MediaBadge type={content.type} />
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full font-medium"
                              style={{
                                  background: "oklch(from var(--color-secondary) l c h / 0.12)",
                                  color:      "oklch(from var(--color-secondary) l c h)",
                                  border:     "1px solid oklch(from var(--color-secondary) l c h / 0.25)",
                              }}>
                            🔖 {content.note}
                        </span>
                    </div>
                </div>
                <ActionBar id={id} liked={liked} likes={likes} comments={comments} onLike={onLike} />
            </div>
        </article>
    );
}

function CardNewSeason({ item }) {
    const { content } = item;
    return (
        <article className="flex gap-3" style={{
            ...cardBase,
            background: "oklch(from var(--color-base-200) l c h / 0.85)",
            border: "1px solid oklch(from var(--color-primary) l c h / 0.2)",
        }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg"
                 style={{ background: "oklch(from var(--color-primary) l c h / 0.15)", border: "1px solid oklch(from var(--color-primary) l c h / 0.3)" }}>
                🎬
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black font-unbounded uppercase px-1.5 py-0.5 rounded"
                          style={{ background: "oklch(from var(--color-primary) l c h / 0.15)", color: "oklch(from var(--color-primary) l c h)" }}>
                        Nouveauté
                    </span>
                    <span className="text-xs text-base-content/40">{content.reason}</span>
                </div>
                <p className="text-sm text-base-content/80 leading-relaxed">
                    <span className="font-black font-unbounded text-base-content">{content.title}</span>
                    {" "}— Saison {content.season} disponible le{" "}
                    <span className="font-bold" style={{ color: "oklch(from var(--color-primary) l c h)" }}>{content.airDate}</span>
                </p>
                <button className="btn btn-ghost btn-xs mt-2 font-bold font-unbounded uppercase tracking-widest"
                        style={{
                            color: "oklch(from var(--color-primary) l c h)",
                            border: "1px solid oklch(from var(--color-primary) l c h / 0.3)",
                        }}>
                    Voir la fiche →
                </button>
            </div>
        </article>
    );
}

function CardFollow({ item }) {
    const { user, content, timestamp } = item;
    return (
        <article className="flex gap-3 items-center" style={{ ...cardBase, padding: "0.75rem 1rem" }}>
            <Avatar initials={user.avatar} color="accent" size="sm" />
            <p className="text-sm text-base-content/70 flex-1">
                <span className="font-bold text-base-content">{user.name}</span>
                {" "}suit maintenant{" "}
                <span className="font-bold" style={{ color: "oklch(from var(--color-accent) l c h)" }}>@{content.targetHandle}</span>
            </p>
            <span className="text-xs text-base-content/30 shrink-0">{timestamp}</span>
        </article>
    );
}

function FeedCard({ item, onLike }) {
    switch (item.type) {
        case "rating":     return <CardRating item={item} onLike={onLike} />;
        case "watchlist":  return <CardWatchlist item={item} onLike={onLike} />;
        case "new_season": return <CardNewSeason item={item} />;
        case "follow":     return <CardFollow item={item} />;
        default:           return null;
    }
}

// ─── Empty states ─────────────────────────────────────────────────────────────

function EmptyFeedNow() {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            {/* Illustration */}
            <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
                     style={{
                         background: "oklch(from var(--color-primary) l c h / 0.10)",
                         border: "1px solid oklch(from var(--color-primary) l c h / 0.22)",
                         boxShadow: "0 0 32px oklch(from var(--color-primary) l c h / 0.08)",
                     }}>
                    🎬
                </div>
                {/* Petits satellites décoratifs */}
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                     style={{ background: "oklch(from var(--color-secondary) l c h / 0.15)", border: "1px solid oklch(from var(--color-secondary) l c h / 0.3)" }}>
                    📺
                </div>
                <div className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                     style={{ background: "oklch(from var(--color-accent) l c h / 0.15)", border: "1px solid oklch(from var(--color-accent) l c h / 0.3)" }}>
                    ✨
                </div>
            </div>

            <p className="font-black font-unbounded text-sm text-base-content mb-2">
                Rien en ce moment
            </p>
            <p className="text-xs text-base-content/45 max-w-xs leading-relaxed mb-6">
                Votre fil d'actualité est vide. Suivez des membres ou ajoutez des œuvres à votre watchlist pour commencer à voir de l'activité ici.
            </p>

            <div className="flex flex-col gap-2 w-full max-w-xs">
                <button className="btn btn-primary font-bold uppercase"
                        style={{ boxShadow: "0 0 18px oklch(from var(--color-primary) l c h / 0.35)" }}>
                    Découvrir des membres →
                </button>
                <button className="btn btn-secondary font-bold uppercase"
                        style={{ border: `1px solid ${DIM.border}` }}>
                    Explorer le catalogue
                </button>
            </div>
        </div>
    );
}

function EmptyFeedFollowing() {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
                     style={{
                         background: "oklch(from var(--color-secondary) l c h / 0.10)",
                         border: "1px solid oklch(from var(--color-secondary) l c h / 0.22)",
                         boxShadow: "0 0 32px oklch(from var(--color-secondary) l c h / 0.08)",
                     }}>
                    👥
                </div>
            </div>

            <p className="font-black font-unbounded text-sm text-base-content mb-2">
                Vous ne suivez personne
            </p>
            <p className="text-xs text-base-content/45 max-w-xs leading-relaxed mb-6">
                Suivez des critiques, amis ou cinéphiles partageant vos goûts — leur activité apparaîtra ici.
            </p>

            <button className="btn btn-accent font-bold uppercase">
                Trouver des membres à suivre →
            </button>
        </div>
    );
}

// ─── Sidebar carousel (état vide) ─────────────────────────────────────────────

function SidebarCarousel() {
    // TODO: brancher sur l'API — données éditorials/tendances
    // const { data: carouselItems, isLoading } = useQuery(...)

    return (
        <div className="rounded-xl overflow-hidden relative" style={{ background: DIM.surfaceHi, border: `1px solid ${DIM.border}`, backdropFilter: "blur(10px)", minHeight: "9.5rem" }}>
            <div className="relative p-4 flex flex-col items-center justify-center gap-3 h-full min-h-[9.5rem]">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                     style={{ background: "oklch(from var(--color-primary) l c h / 0.12)", border: "1px solid oklch(from var(--color-primary) l c h / 0.2)" }}>
                    📡
                </div>
                <div className="text-center">
                    <p className="font-black font-unbounded text-xs text-base-content mb-1">À la une</p>
                    <p className="text-[10px] text-base-content/40 leading-relaxed">
                        Les tendances et nouveautés<br />arrivent bientôt ici.
                    </p>
                </div>
                {/* Dots placeholder */}
                <div className="flex gap-1 items-center">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} style={{
                            width: i === 0 ? "1.25rem" : "0.375rem",
                            height: "0.375rem",
                            borderRadius: "9999px",
                            background: i === 0
                                ? "oklch(from var(--color-primary) l c h / 0.45)"
                                : "oklch(60% 0.01 255 / 0.2)",
                        }} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Sidebar quick log ────────────────────────────────────────────────────────

function SidebarQuickLog() {
    return (
        <div className="rounded-xl p-4" style={{ background: DIM.surfaceHi, border: `1px solid ${DIM.border}`, backdropFilter: "blur(10px)" }}>
            <h3 className="font-black font-unbounded text-xs uppercase text-primary mb-3 tracking-wider">Poster</h3>
            <input type="text" placeholder="Rechercher un film, une série…"
                   className="w-full text-xs px-3 py-2 rounded-lg text-base-content placeholder:text-base-content/30 outline-none mb-2"
                   style={{ background: DIM.input, border: `1px solid ${DIM.border}` }} />
            <button className="btn btn-primary font-bold uppercase w-full"
                    style={{ boxShadow: "0 0 14px oklch(from var(--color-primary) l c h / 0.28)" }}>
                + Ajouter une entrée
            </button>
        </div>
    );
}

// ─── Sidebar suggestions (état vide) ──────────────────────────────────────────

function SidebarSuggestions() {
    // TODO: brancher sur l'API — GET /api/users/suggestions
    // const { data: suggestions, isLoading } = useQuery(...)
    const suggestions = []; // sera remplacé par les données API

    return (
        <div className="rounded-xl p-4" style={{ background: DIM.surfaceHi, border: `1px solid ${DIM.border}`, backdropFilter: "blur(10px)" }}>
            <h3 className="font-bold font-unbounded text-xs uppercase text-secondary mb-3 tracking-wider">Suggestions</h3>

            {suggestions.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                         style={{ background: "oklch(from var(--color-accent) l c h / 0.12)", border: "1px solid oklch(from var(--color-accent) l c h / 0.22)" }}>
                        🔍
                    </div>
                    <div>
                        <p className="text-xs font-bold text-base-content mb-1">Aucune suggestion</p>
                        <p className="text-[10px] text-base-content/40 leading-relaxed">
                            Complétez votre profil pour<br />obtenir des recommandations.
                        </p>
                    </div>
                    <button className="btn btn-outline btn-secondary font-bold uppercase">
                        Compléter mon profil
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {suggestions.map((s) => (
                        <div key={s.handle} className="flex items-center gap-2">
                            <Avatar initials={s.avatar} size="sm" color="accent" />
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-xs text-base-content truncate">{s.name}</p>
                                <p className="text-[10px] text-base-content/40">{s.commonTastes} goûts en commun</p>
                            </div>
                            <button className="text-[10px] font-black px-2 py-1 rounded-lg transition-all duration-150 cursor-pointer shrink-0"
                                    style={{
                                        background: "oklch(from var(--color-primary) l c h / 0.15)",
                                        color:      "oklch(from var(--color-primary) l c h)",
                                        border:     "1px solid oklch(from var(--color-primary) l c h / 0.3)",
                                    }}>
                                + Suivre
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const TABS = [
    { key: "now",       label: "En ce moment" },
    { key: "following", label: "Suivis" },
];

export default function Timeline() {
    // TODO: remplacer par useQuery TanStack — GET /api/feed?tab=now|following
    // const { data: feed = [], isLoading, isError } = useQuery({ queryKey: ['feed', activeTab], ... })
    const [feed, setFeed]           = useState([]); // vide — en attente de l'API
    const [activeTab, setActiveTab] = useState("now");

    const handleLike = (id) => setFeed(f => f.map(item => item.id === id ? { ...item, liked: !item.liked } : item));

    const displayFeed = activeTab === "following"
        ? feed.filter(item => !item.isSystem)
        : feed;

    return (
        <>
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .feed-item { animation: fadeUp 0.4s cubic-bezier(.22,1,.36,1) both; }
                .feed-item:nth-child(1) { animation-delay: 0.04s; }
                .feed-item:nth-child(2) { animation-delay: 0.09s; }
                .feed-item:nth-child(3) { animation-delay: 0.14s; }
                .feed-item:nth-child(4) { animation-delay: 0.19s; }
                .feed-item:nth-child(5) { animation-delay: 0.24s; }
                .feed-item:nth-child(6) { animation-delay: 0.29s; }

                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(5px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                .tab-pane { animation: slideIn 0.22s cubic-bezier(.22,1,.36,1) both; }
            `}</style>

            <div className="min-h-screen" style={{ background: DIM.bg }}>
                <BlobsBackground fixed/>
                <GridBackground fixed/>
                <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">

                    {/* ── Feed ──────────────────────────────────────────────── */}
                    <main className="flex-1 min-w-0">

                        {/* Tab bar */}
                        <div className="flex mb-5" style={{ borderBottom: `1px solid ${DIM.divider}` }}>
                            {TABS.map(tab => (
                                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                        className="relative px-5 py-2.5 text-xs font-black font-unbounded uppercase tracking-wider transition-colors duration-150 cursor-pointer"
                                        style={{ color: activeTab === tab.key ? "oklch(from var(--color-primary) l c h)" : "oklch(from var(--color-base-content) l c h / 0.4)" }}>
                                    {tab.label}
                                    {activeTab === tab.key && (
                                        <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                                              style={{ background: "oklch(from var(--color-primary) l c h)", boxShadow: "0 0 8px oklch(from var(--color-primary) l c h / 0.55)" }} />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Cards ou empty state */}
                        <div key={activeTab} className="tab-pane flex flex-col gap-3">
                            {displayFeed.length === 0 ? (
                                activeTab === "following"
                                    ? <EmptyFeedFollowing />
                                    : <EmptyFeedNow />
                            ) : (
                                displayFeed.map(item => (
                                    <div key={item.id} className="feed-item">
                                        <FeedCard item={item} onLike={handleLike} />
                                    </div>
                                ))
                            )}
                        </div>

                        {displayFeed.length > 0 && (
                            <div className="mt-6 text-center">
                                <button className="btn btn-ghost btn-sm font-black font-unbounded uppercase tracking-widest text-xs text-base-content/40"
                                        style={{ border: `1px solid ${DIM.border}` }}>
                                    Charger plus
                                </button>
                            </div>
                        )}
                    </main>

                    {/* ── Sidebar ───────────────────────────────────────────── */}
                    <aside className="w-72 shrink-0 hidden lg:flex flex-col gap-4">
                        <SidebarCarousel />
                        <SidebarQuickLog />
                        <SidebarSuggestions />
                    </aside>

                </div>
            </div>
        </>
    );
}