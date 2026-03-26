import { useNavigate } from "react-router-dom";

function NotFound() {
    const navigate = useNavigate();

    return (
        <>
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes glowPulse {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50%      { opacity: 0.8; transform: scale(1.06); }
                }
                @keyframes flicker {
                    0%, 100% { opacity: 1; }
                    92%      { opacity: 1; }
                    93%      { opacity: 0.4; }
                    94%      { opacity: 1; }
                    96%      { opacity: 0.6; }
                    97%      { opacity: 1; }
                }
                .nf-blob  { animation: glowPulse 5s ease-in-out infinite; }
                .nf-badge { animation: fadeUp 0.4s cubic-bezier(.22,1,.36,1) 0.1s both; }
                .nf-title { animation: fadeUp 0.6s cubic-bezier(.22,1,.36,1) 0.2s both, flicker 6s ease-in-out 1s infinite; }
                .nf-sub   { animation: fadeUp 0.6s cubic-bezier(.22,1,.36,1) 0.35s both; }
                .nf-desc  { animation: fadeUp 0.6s cubic-bezier(.22,1,.36,1) 0.5s both; }
                .nf-cta   { animation: fadeUp 0.6s cubic-bezier(.22,1,.36,1) 0.65s both; }
            `}</style>

            <section className="relative min-h-screen bg-base-100 flex items-center justify-center overflow-hidden px-6">

                {/* Grille subtile */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.04]"
                    style={{
                        backgroundImage: "linear-gradient(oklch(from var(--color-base-content) l c h) 1px, transparent 1px), linear-gradient(90deg, oklch(from var(--color-base-content) l c h) 1px, transparent 1px)",
                        backgroundSize: "60px 60px",
                    }}
                />

                {/* Blobs */}
                <div className="absolute inset-0 pointer-events-none">
                    <div
                        className="nf-blob absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full"
                        style={{ background: "radial-gradient(circle, oklch(from var(--color-primary) l c h / 0.09) 0%, transparent 65%)" }}
                    />
                    <div
                        className="nf-blob absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full"
                        style={{ background: "radial-gradient(circle, oklch(from var(--color-secondary) l c h / 0.07) 0%, transparent 70%)", animationDelay: "2.5s" }}
                    />
                </div>

                {/* Contenu */}
                <div className="relative z-10 text-center max-w-lg">

                    <div className="nf-badge flex justify-center mb-6">
                        <span className="badge badge-error badge-soft gap-1.5">
                            <span className="status status-error status-xs"></span>
                            Erreur 404
                        </span>
                    </div>

                    {/* 404 géant avec néon + flicker */}
                    <h1
                        className="nf-title text-[10rem] font-black leading-none tracking-tighter text-primary select-none"
                        style={{
                            filter: "drop-shadow(0 0 30px oklch(from var(--color-primary) l c h / 0.7)) drop-shadow(0 0 60px oklch(from var(--color-primary) l c h / 0.3))",
                        }}
                    >
                        404
                    </h1>

                    <h2 className="nf-sub text-2xl font-bold text-base-content tracking-tight mt-2">
                        Cette page n'existe pas
                    </h2>

                    <p className="nf-desc mt-4 text-base-content/50 text-base leading-relaxed">
                        Le film que tu cherches a été retiré de l'affiche, ou cette URL n'a jamais existé.
                    </p>

                    {/* Carte glassmorphism */}
                    <div
                        className="nf-cta mt-10 rounded-2xl border border-primary/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
                        style={{
                            background: "oklch(from var(--color-base-200) l c h / 0.5)",
                            backdropFilter: "blur(16px)",
                            WebkitBackdropFilter: "blur(16px)",
                            boxShadow: "0 0 30px oklch(from var(--color-primary) l c h / 0.06)",
                        }}
                    >
                        <div className="text-left">
                            <p className="text-sm font-semibold text-base-content">Où veux-tu aller ?</p>
                            <p className="text-xs text-base-content/40 mt-0.5">Retourne là où il se passe quelque chose</p>
                        </div>
                        <div className="flex gap-3 shrink-0">
                            <button
                                className="btn btn-ghost btn-sm text-base-content/60"
                                onClick={() => navigate(-1)}
                            >
                                ← Retour
                            </button>
                            <button
                                className="btn btn-primary btn-sm"
                                style={{ boxShadow: "0 0 16px oklch(from var(--color-primary) l c h / 0.35)" }}
                                onClick={() => navigate("/")}
                            >
                                Accueil
                            </button>
                        </div>
                    </div>

                </div>
            </section>
        </>
    );
}

export default NotFound;