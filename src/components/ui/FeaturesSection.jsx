import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const FEATURES = [
    {
        symbol: (
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
                <path d="M32 4L39.5 24.5H61L44 37.5L50.5 58L32 45.5L13.5 58L20 37.5L3 24.5H24.5L32 4Z"
                      fill="oklch(from var(--color-primary) l c h / 0.15)"
                      stroke="oklch(from var(--color-primary) l c h)"
                      strokeWidth="2" strokeLinejoin="round" />
            </svg>
        ),
        title: "Critiquez chaque film",
        description: "Donnez votre avis sur tous les films que vous avez vus. Notes, ressentis, analyses — votre voix compte autant que celle des critiques professionnels. Construisez votre réputation de cinéphile au fil de vos critiques.",
        link: { label: "Voir les dernières critiques", href: "/avis" },
    },
    {
        symbol: (
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
                <rect x="8" y="8" width="20" height="20" rx="4"
                      fill="oklch(from var(--color-primary) l c h / 0.15)"
                      stroke="oklch(from var(--color-primary) l c h)"
                      strokeWidth="2" />
                <rect x="36" y="8" width="20" height="20" rx="4"
                      fill="oklch(from var(--color-primary) l c h / 0.08)"
                      stroke="oklch(from var(--color-primary) l c h / 0.4)"
                      strokeWidth="2" />
                <rect x="8" y="36" width="20" height="20" rx="4"
                      fill="oklch(from var(--color-primary) l c h / 0.08)"
                      stroke="oklch(from var(--color-primary) l c h / 0.4)"
                      strokeWidth="2" />
                <rect x="36" y="36" width="20" height="20" rx="4"
                      fill="oklch(from var(--color-primary) l c h / 0.15)"
                      stroke="oklch(from var(--color-primary) l c h)"
                      strokeWidth="2" />
            </svg>
        ),
        title: "Watchlists organisées",
        description: "Créez des listes thématiques illimitées. Films à voir, chefs-d'œuvre oubliés, soirées en famille — partagez-les avec votre entourage ou rendez-les publiques pour inspirer la communauté.",
        link: { label: "Créer une watchlist", href: "/topwatchlists" },
    },
    {
        symbol: (
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
                <circle cx="32" cy="32" r="22"
                        fill="oklch(from var(--color-primary) l c h / 0.1)"
                        stroke="oklch(from var(--color-primary) l c h)"
                        strokeWidth="2" />
                <path d="M32 14 L32 32 L44 44"
                      stroke="oklch(from var(--color-primary) l c h)"
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="32" cy="32" r="3"
                        fill="oklch(from var(--color-primary) l c h)" />
            </svg>
        ),
        title: "Tendances en temps réel",
        description: "Découvrez ce que la communauté regarde en ce moment. Films du moment, séries qui buzzent, animés de la saison — ne ratez plus jamais la conversation du moment.",
        link: { label: "Explorer les tendances", href: "/tendances" },
    },
    {
        symbol: (
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
                <circle cx="20" cy="28" r="12"
                        fill="oklch(from var(--color-primary) l c h / 0.1)"
                        stroke="oklch(from var(--color-primary) l c h)"
                        strokeWidth="2" />
                <circle cx="44" cy="28" r="12"
                        fill="oklch(from var(--color-primary) l c h / 0.1)"
                        stroke="oklch(from var(--color-primary) l c h)"
                        strokeWidth="2" />
                <path d="M8 52 C8 44 14 40 20 40 C26 40 32 44 32 44 C32 44 38 40 44 40 C50 40 56 44 56 52"
                      stroke="oklch(from var(--color-primary) l c h)"
                      strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
        title: "Une communauté de passionnés",
        description: "Suivez d'autres cinéphiles, commentez leurs critiques, débattez des fins de films. ScreenClub c'est avant tout des rencontres autour d'une passion commune.",
        link: { label: "Rejoindre la communauté", href: "#cta" },
    },
];

function FeaturesSection() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [animDir, setAnimDir] = useState(1);
    const [visible, setVisible] = useState(true);
    const sectionRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            const section = sectionRef.current;
            if (!section) return;
            const rect = section.getBoundingClientRect();
            const sectionHeight = section.offsetHeight;
            const stepHeight = sectionHeight / FEATURES.length;
            const scrolled = -rect.top;
            const index = Math.min(FEATURES.length - 1, Math.max(0, Math.floor(scrolled / stepHeight)));
            if (index !== activeIndex) {
                setAnimDir(index > activeIndex ? 1 : -1);
                setVisible(false);
                setTimeout(() => {
                    setActiveIndex(index);
                    setVisible(true);
                }, 160);
            }
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [activeIndex]);

    const feature = FEATURES[activeIndex];

    return (
        <>
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .feat-enter-down { animation: slideUp   0.3s cubic-bezier(.22,1,.36,1) both; }
                .feat-enter-up   { animation: slideDown 0.3s cubic-bezier(.22,1,.36,1) both; }
            `}</style>

            <section
                id="features"
                ref={sectionRef}
                style={{ height: `${FEATURES.length * 100}vh` }}
                className="relative"
            >
                {/* sticky div — SANS bg-base-100, fond transparent pour laisser passer les blobs */}
                <div className="sticky top-0 h-screen flex items-center overflow-hidden">

                    {/* Grille décorative */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-[0.03]"
                        style={{
                            backgroundImage: "linear-gradient(oklch(from var(--color-base-content) l c h) 1px, transparent 1px), linear-gradient(90deg, oklch(from var(--color-base-content) l c h) 1px, transparent 1px)",
                            backgroundSize: "60px 60px",
                        }}
                    />

                    <div className="relative z-10 max-w-5xl mx-auto px-6 w-full">
                        <div className="flex gap-1.5 mb-12">
                            {FEATURES.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-0.5 rounded-full transition-all duration-400 ${
                                        i === activeIndex ? "bg-primary w-8" : "bg-base-content/20 w-4"
                                    }`}
                                />
                            ))}
                        </div>

                        <div
                            className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-20 ${
                                visible
                                    ? animDir === 1 ? "feat-enter-down" : "feat-enter-up"
                                    : "opacity-0"
                            }`}
                        >
                            <div className="shrink-0">
                                <div
                                    className="relative w-52 h-52 rounded-3xl border border-primary/20 flex items-center justify-center"
                                    style={{
                                        background: "oklch(from var(--color-base-200) l c h / 0.6)",
                                        boxShadow: "0 0 40px oklch(from var(--color-primary) l c h / 0.08)",
                                        backdropFilter: "blur(12px)",
                                    }}
                                >
                                    <div
                                        className="absolute inset-0 rounded-3xl pointer-events-none"
                                        style={{
                                            background: "radial-gradient(ellipse at center, oklch(from var(--color-primary) l c h / 0.07) 0%, transparent 70%)"
                                        }}
                                    />
                                    <div className="relative z-10 drop-shadow-[0_0_16px_oklch(from_var(--color-primary)_l_c_h/0.5)]">
                                        {feature.symbol}
                                    </div>
                                    <span className="absolute top-4 right-4 text-xs font-mono text-primary/40">
                                        0{activeIndex + 1}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 max-w-lg">
                                <span className="badge badge-primary badge-soft badge-sm mb-4">
                                    Fonctionnalité
                                </span>
                                <h3 className="text-4xl font-black text-base-content tracking-tight leading-tight">
                                    {feature.title}
                                </h3>
                                <p className="mt-5 text-base-content/60 text-lg leading-relaxed">
                                    {feature.description}
                                </p>
                                {feature.link.href.startsWith("#") ? (
                                    <button
                                        onClick={() => document.getElementById(feature.link.href.slice(1))?.scrollIntoView({ behavior: "smooth" })}
                                        className="link link-primary inline-flex items-center gap-1.5 mt-6 text-sm font-semibold"
                                    >
                                        {feature.link.label}
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </button>
                                ) : (
                                    <Link
                                        to={feature.link.href}
                                        className="link link-primary inline-flex items-center gap-1.5 mt-6 text-sm font-semibold"
                                    >
                                        {feature.link.label}
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default FeaturesSection;