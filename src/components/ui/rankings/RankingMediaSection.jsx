import GridBackground from "@components/layout/GridBackground.jsx";

// Données mock — à remplacer par tes vraies données / appels API
const MOCK_ITEMS = [
    { id: 1,  title: "Dune : Partie 2",       year: 2024, genre: "Science-Fiction", rating: 9.2, poster: "https://placehold.co/120x180" },
    { id: 2,  title: "Oppenheimer",            year: 2023, genre: "Drame historique", rating: 9.0, poster: "https://placehold.co/120x180" },
    { id: 3,  title: "Past Lives",             year: 2023, genre: "Romance",         rating: 8.8, poster: "https://placehold.co/120x180" },
    { id: 4,  title: "Poor Things",            year: 2023, genre: "Fantastique",     rating: 8.6, poster: "https://placehold.co/120x180" },
    { id: 5,  title: "The Zone of Interest",   year: 2023, genre: "Drame",           rating: 8.4, poster: "https://placehold.co/120x180" },
    { id: 6,  title: "Anatomy of a Fall",      year: 2023, genre: "Thriller",        rating: 8.3, poster: "https://placehold.co/120x180" },
    { id: 7,  title: "Killers of the Flower Moon", year: 2023, genre: "Western",     rating: 8.1, poster: "https://placehold.co/120x180" },
    { id: 8,  title: "Monster",                year: 2023, genre: "Drame",           rating: 8.0, poster: "https://placehold.co/120x180" },
    { id: 9,  title: "The Holdovers",          year: 2023, genre: "Comédie-drame",   rating: 7.9, poster: "https://placehold.co/120x180" },
    { id: 10, title: "All of Us Strangers",    year: 2023, genre: "Romance",         rating: 7.8, poster: "https://placehold.co/120x180" },
];

function RankBadge({ rank }) {
    const isTop3 = rank <= 3;
    return (
        <span
            className={`text-3xl font-black font-mono leading-none select-none w-10 text-right shrink-0 ${
                isTop3 ? "text-primary" : "text-base-content/20"
            }`}
            style={isTop3 ? {
                filter: "drop-shadow(0 0 8px oklch(from var(--color-primary) l c h / 0.7))"
            } : {}}
        >
            {String(rank).padStart(2, "0")}
        </span>
    );
}

function RatingBar({ rating }) {
    const pct = (rating / 10) * 100;
    return (
        <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-0.5 rounded-full bg-base-content/10 overflow-hidden">
                <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-xs font-bold text-primary shrink-0">{rating.toFixed(1)}</span>
        </div>
    );
}

function RankingMediaSection({ title = "Top Films", items = MOCK_ITEMS, onItemClick }) {
    return (
        <>
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes glowPulse {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50%      { opacity: 0.85; transform: scale(1.05); }
                }
                .rank-item { animation: fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }
                .rank-blob { animation: glowPulse 6s ease-in-out infinite; }
            `}</style>

            <section className="relative bg-base-100 py-20 px-6 overflow-hidden">

                <GridBackground />

                {/* Blob */}
                <div className="absolute inset-0 pointer-events-none">
                    <div
                        className="rank-blob absolute -top-32 right-0 w-[500px] h-[500px] rounded-full"
                        style={{ background: "radial-gradient(circle, oklch(from var(--color-primary) l c h / 0.08) 0%, transparent 70%)" }}
                    />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto">

                    {/* Header */}
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <span className="badge badge-primary badge-soft badge-sm mb-2">Classement</span>
                            <h2 className="text-4xl font-black text-base-content tracking-tight">
                                {title}
                            </h2>
                        </div>
                        <span className="text-xs text-base-content/30 font-mono">
                            Mis à jour aujourd'hui
                        </span>
                    </div>

                    {/* Liste */}
                    <div className="flex flex-col gap-2">
                        {items.slice(0, 10).map((item, i) => (
                            <div
                                key={item.id}
                                className="rank-item group relative flex items-center gap-5 rounded-2xl border border-base-content/5 p-4 cursor-pointer transition-all duration-200 hover:border-primary/25"
                                style={{
                                    animationDelay: `${i * 0.06}s`,
                                    background: "oklch(from var(--color-base-200) l c h / 0.5)",
                                    backdropFilter: "blur(12px)",
                                    WebkitBackdropFilter: "blur(12px)",
                                }}
                                onClick={() => onItemClick?.(item)}
                            >
                                {/* Halo hover */}
                                <div
                                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
                                    style={{ background: "radial-gradient(ellipse at left, oklch(from var(--color-primary) l c h / 0.05) 0%, transparent 60%)" }}
                                />

                                {/* Numéro */}
                                <RankBadge rank={i + 1} />

                                {/* Poster */}
                                <div className="relative shrink-0 w-12 h-16 rounded-lg overflow-hidden">
                                    <img
                                        src={item.poster}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    {i < 3 && (
                                        <div
                                            className="absolute inset-0 rounded-lg"
                                            style={{ boxShadow: "inset 0 0 0 1px oklch(from var(--color-primary) l c h / 0.4)" }}
                                        />
                                    )}
                                </div>

                                {/* Infos */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-base-content truncate group-hover:text-primary transition-colors duration-200">
                                            {item.title}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-base-content/40">{item.year}</span>
                                        <span className="text-base-content/20 text-xs">·</span>
                                        <span className="text-xs text-base-content/40">{item.genre}</span>
                                    </div>
                                    <RatingBar rating={item.rating} />
                                </div>

                                {/* Flèche */}
                                <svg
                                    className="w-4 h-4 text-base-content/20 group-hover:text-primary transition-all duration-200 group-hover:translate-x-1 shrink-0"
                                    viewBox="0 0 16 16" fill="none"
                                >
                                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        ))}
                    </div>

                </div>
            </section>
        </>
    );
}

export default RankingMediaSection;