import GridBackground from "@components/layout/GridBackground.jsx";
import duneImg from "@images/dune_2.jpg";
import AuthModal from "@components/ui/modales/AuthModal.jsx";
import { useState } from "react";

function Hero2() {
    const [authOpen, setAuthOpen] = useState(false);

    return (
        <>
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeLeft {
                    from { opacity: 0; transform: translateX(-20px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes levitate {
                    0%, 100% { transform: translateY(0px); }
                    50%      { transform: translateY(-10px); }
                }
                @keyframes shadowPulse {
                    0%, 100% { box-shadow: 0 20px 60px oklch(0% 0 0 / 0.6), 0 0 40px oklch(from var(--color-primary) l c h / 0.3), 0 0 80px oklch(from var(--color-primary) l c h / 0.15); }
                    50%      { box-shadow: 0 30px 80px oklch(0% 0 0 / 0.7), 0 0 60px oklch(from var(--color-primary) l c h / 0.5), 0 0 120px oklch(from var(--color-primary) l c h / 0.25); }
                }
                .h2-poster { animation: fadeLeft 0.7s cubic-bezier(.22,1,.36,1) 0.1s both; }
                .h2-logo   { animation: fadeUp  0.6s cubic-bezier(.22,1,.36,1) 0.2s both; }
                .h2-nav    { animation: fadeUp  0.6s cubic-bezier(.22,1,.36,1) 0.35s both; }
                .h2-desc   { animation: fadeUp  0.6s cubic-bezier(.22,1,.36,1) 0.5s both; }
                .h2-cta    { animation: fadeUp  0.6s cubic-bezier(.22,1,.36,1) 0.65s both; }
                .poster-img {
                    animation: levitate 4s ease-in-out infinite, shadowPulse 4s ease-in-out infinite;
                    transition: transform 0.4s cubic-bezier(.22,1,.36,1), filter 0.4s ease;
                }
                .poster-wrapper:hover .poster-img {
                    animation-play-state: paused;
                    transform: translateY(-6px) scale(1.03) rotate(-1deg);
                    filter: brightness(1.08);
                    box-shadow:
                        0 30px 80px oklch(0% 0 0 / 0.7),
                        0 0 70px oklch(from var(--color-primary) l c h / 0.55),
                        0 0 140px oklch(from var(--color-primary) l c h / 0.3),
                        0 0 10px oklch(from var(--color-accent) l c h / 0.4) !important;
                }
                .poster-wrapper:hover .poster-halo {
                    opacity: 0.6;
                    transform: scale(1.05);
                }
                .poster-halo {
                    transition: opacity 0.4s ease, transform 0.4s ease;
                    opacity: 0.25;
                }
                .poster-wrapper:hover .poster-badge {
                    transform: scale(1.1) rotate(5deg);
                }
                .poster-badge {
                    transition: transform 0.3s cubic-bezier(.22,1,.36,1);
                }
            `}</style>

            {/* Pas de bg-base-100 ici — le fond vient du wrapper dans Home.jsx */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
                <GridBackground />

                <div className="relative z-10 w-full flex justify-center py-24 px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                        {/* Gauche — poster */}
                        <div className="h2-poster poster-wrapper relative shrink-0 cursor-pointer">
                            <div
                                className="poster-badge absolute -top-4 -right-4 z-20 w-16 h-16 rounded-full flex items-center justify-center font-black text-lg select-none"
                                style={{
                                    background: "oklch(from var(--color-secondary) l c h)",
                                    color: "oklch(from var(--color-secondary-content) l c h)",
                                    boxShadow: "0 0 20px oklch(from var(--color-secondary) l c h / 0.6)",
                                }}
                            >
                                4,5
                            </div>
                            <div
                                className="poster-halo absolute inset-0 rounded-2xl -z-10 blur-3xl scale-90"
                                style={{
                                    background: "linear-gradient(135deg, oklch(from var(--color-primary) l c h / 0.6) 0%, oklch(from var(--color-accent) l c h / 0.4) 50%, oklch(from var(--color-secondary) l c h / 0.3) 100%)",
                                }}
                            />
                            <img
                                src={duneImg}
                                alt="Film à l'affiche"
                                className="poster-img w-52 aspect-2/3 object-cover object-center rounded-2xl"
                                style={{
                                    boxShadow: "0 20px 60px oklch(0% 0 0 / 0.6), 0 0 40px oklch(from var(--color-primary) l c h / 0.3), 0 0 80px oklch(from var(--color-primary) l c h / 0.15)",
                                }}
                            />
                        </div>

                        {/* Droite — contenu */}
                        <div className="flex-1 text-center lg:text-left">
                            <div className="h2-logo flex items-center justify-center lg:justify-start gap-2 mb-5">
                                <h1 className="text-5xl lg:text-7xl font-unbounded font-black text-base-content tracking-tight">
                                    ScreenClub
                                </h1>
                                <svg
                                    className="w-10 h-10 lg:w-14 lg:h-14 shrink-0 mb-1"
                                    style={{ filter: "drop-shadow(0 0 10px oklch(from var(--color-primary) l c h / 0.9))" }}
                                    viewBox="0 0 24 24"
                                    fill="oklch(from var(--color-primary) l c h)"
                                >
                                    <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"/>
                                </svg>
                            </div>

                            <div className="h2-nav flex flex-wrap items-center font-unbounded justify-center lg:justify-start gap-x-6 gap-y-2 mb-8">
                                {["Séries", "Films", "Animés", "Avis", "Watchlists"].map((item) => (
                                    <a
                                        key={item}
                                        href={`/top${item.toLowerCase().replace("é","e")}`}
                                        className="text-sm font-black tracking-widest uppercase text-primary hover:text-secondary transition-colors duration-200"
                                    >
                                        {item}
                                    </a>
                                ))}
                            </div>

                            <p className="h2-desc text-lg lg:text-xl text-base-content/80 leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium">
                                Notez, suivez et partagez vos films, séries et animés préférés
                                avec vos proches ou la communauté{" "}
                                <span
                                    className="text-primary font-black font-unbounded"
                                    style={{ filter: "drop-shadow(0 0 8px oklch(from var(--color-primary) l c h / 0.5))" }}
                                >
                                    ScreenClub
                                </span>{" "}!
                            </p>

                            <div className="h2-cta mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                <button
                                    className="btn btn-primary font-bold uppercase"
                                    onClick={() => setAuthOpen(true)}
                                >
                                    Connexion
                                </button>
                                <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
                                <button className="btn btn-secondary font-bold uppercase">
                                    En savoir plus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Hero2;
