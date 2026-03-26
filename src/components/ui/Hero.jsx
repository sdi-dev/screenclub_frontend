import AuthModal from "./modales/AuthModal.jsx";
import {useState} from "react";
import duneImg from "@images/dune_2.jpg";

function Hero() {

    const [authOpen, setAuthOpen] = useState(false);

    return (
        <>
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(28px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(-1deg); }
                    50%      { transform: translateY(-14px) rotate(1deg); }
                }
                @keyframes glowPulse {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50%      { opacity: 0.8; transform: scale(1.08); }
                }
                @keyframes slideInBadge {
                    from { opacity: 0; transform: translateX(-16px); }
                    to   { opacity: 1; transform: translateX(0); }
                }

                .hero-badge  { animation: slideInBadge 0.5s cubic-bezier(.22,1,.36,1) 0.1s both; }
                .hero-title  { animation: fadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.25s both; }
                .hero-desc   { animation: fadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.4s both; }
                .hero-cta    { animation: fadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.55s both; }
                .hero-stats  { animation: fadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.7s both; }
                .hero-image  { animation: fadeIn 0.9s ease 0.2s both, float 6s ease-in-out 1.2s infinite; }
                .hero-card   { animation: fadeUp 0.6s cubic-bezier(.22,1,.36,1) 0.9s both; }
                .glow-blob   { animation: glowPulse 5s ease-in-out infinite; }
            `}</style>

            <section className="relative min-h-screen bg-base-100 overflow-hidden flex items-center">

                {/* Arrière-plan décoratif */}
                <div className="absolute inset-0 pointer-events-none">
                    <div
                        className="glow-blob absolute -top-32 -left-32 w-150 h-150 rounded-full"
                        style={{ background: "radial-gradient(circle, oklch(from var(--color-primary) l c h / 0.12) 0%, transparent 70%)" }}
                    />
                    <div
                        className="glow-blob absolute -bottom-24 right-0 w-125 h-125 rounded-full"
                        style={{ background: "radial-gradient(circle, oklch(from var(--color-secondary) l c h / 0.09) 0%, transparent 70%)", animationDelay: "2.5s" }}
                    />
                    <div
                        className="absolute inset-0 opacity-[0.04]"
                        style={{
                            backgroundImage: "linear-gradient(oklch(from var(--color-base-content) l c h) 1px, transparent 1px), linear-gradient(90deg, oklch(from var(--color-base-content) l c h) 1px, transparent 1px)",
                            backgroundSize: "60px 60px"
                        }}
                    />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 w-full">
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                        {/* Texte */}
                        <div className="flex-1 max-w-xl">

                            <div className="hero-badge flex items-center gap-2 mb-6">
                                <span className="badge badge-primary badge-soft gap-1.5">
                                    <span className="status status-primary status-xs"></span>
                                    Communauté active
                                </span>
                                <span className="text-base-content/40 text-sm">12 000+ membres</span>
                            </div>

                            <h1 className="hero-title text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight">
                                <span className="text-primary">Par les fans,</span>
                                <br />
                                <span className="text-base-content">pour les fans.</span>
                            </h1>

                            <p className="hero-desc mt-6 text-base-content/60 text-lg leading-relaxed">
                                Rejoignez une communauté passionnée pour parler films, séries et animés.
                                Critiquez, watchlistez et profitez du meilleur sur{" "}
                                <span className="text-primary font-semibold">ScreenClub</span>.
                            </p>

                            <div className="hero-cta mt-10 flex flex-wrap gap-3">
                                <button className="btn btn-primary btn-lg shadow-lg" onClick={() => setAuthOpen(true)}>
                                    Rejoindre le club
                                </button>
                                <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
                                <button className="btn btn-ghost btn-lg text-base-content/70">
                                    Découvrir →
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="hero-stats mt-12 flex gap-8 pt-8 border-t border-base-300">
                                {[
                                    { value: "100%", label: "Français" },
                                    { value: "2K+", label: "Watchlists" },
                                    { value: "50K+", label: "Critiques" },
                                ].map(({ value, label }) => (
                                    <div key={label}>
                                        <p className="text-2xl font-bold text-base-content">{value}</p>
                                        <p className="text-sm text-base-content/40 mt-0.5">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Image */}
                        <div className="flex-1 flex justify-center lg:justify-end">
                            <div className="relative">
                                <div
                                    className="absolute inset-0 rounded-3xl blur-2xl scale-90 -z-10"
                                    style={{ background: "oklch(75% 0.22 140 / 0.18)" }}
                                />
                                <img
                                    src={duneImg}
                                    alt="ScreenClub hero"
                                    className="hero-image relative rounded-3xl shadow-2xl shadow-primary/20 w-full max-w-xs lg:max-w-sm aspect-[2/3] object-cover object-center"
                                />

                                {/* Badge flottant */}
                                <div className="hero-card absolute -bottom-4 -left-4 bg-base-200 border border-base-300 rounded-2xl px-4 py-3 shadow-xl">
                                    <p className="text-xs text-base-content/50 mb-0.5">Tendance cette semaine</p>
                                    <p className="text-sm font-semibold text-base-content">🎬 Dune : Partie 2</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </>
    );
}

export default Hero;