/**
 * SuccessScreen — cinématique ScreenClub.
 * Utilise uniquement les classes DaisyUI/Tailwind pour les couleurs
 * → compatible avec tous les thèmes (jaune, vite, red, jamaica…).
 *
 * @param {{ message?: string, variant?: "note" | "watchlist" | "report" | "default" }} props
 */
function SuccessScreen({
                           message = "Votre demande a bien été transmise.",
                           variant = "default",
                       }) {
    const config = {
        note: {title: "Avis publié", sub: "CRITIQUE EN LIGNE"},
        watchlist: {title: "Watchlist créée", sub: "LISTE ENREGISTRÉE"},
        report: {title: "Signalement envoyé", sub: "SIGNALÉ"},
        default: {title: "C'est dans la boîte", sub: "CONFIRMÉ"},
    };
    const { title, sub } = config[variant] ?? config.default;

    return (
        <>
            <style>{`
                @keyframes ss-in {
                    from { opacity: 0; transform: translateY(18px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes ss-icon-pop {
                    0%   { opacity: 0; transform: scale(0.4); }
                    65%  { transform: scale(1.07); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @keyframes ss-levitate {
                    0%, 100% { transform: translateY(0px); }
                    50%      { transform: translateY(-8px); }
                }
                @keyframes ss-glow-pulse {
                    0%, 100% { opacity: 0.2; transform: scale(1); }
                    50%      { opacity: 0.5; transform: scale(1.2); }
                }
                @keyframes ss-draw-circle {
                    from { stroke-dashoffset: 201; }
                    to   { stroke-dashoffset: 0; }
                }
                @keyframes ss-draw-check {
                    from { stroke-dashoffset: 50; }
                    to   { stroke-dashoffset: 0; }
                }
                @keyframes ss-text-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes ss-label-in {
                    from { opacity: 0; letter-spacing: 0.5em; }
                    to   { opacity: 1; letter-spacing: 0.25em; }
                }
                @keyframes ss-line-grow {
                    from { transform: scaleX(0); }
                    to   { transform: scaleX(1); }
                }
                @keyframes ss-star-spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }

                .ss-in       { animation: ss-in 0.5s cubic-bezier(.22,1,.36,1) both; }
                .ss-icon-pop { animation: ss-icon-pop 0.55s cubic-bezier(.34,1.56,.64,1) 0.1s both, ss-levitate 4s ease-in-out 1s infinite; }
                .ss-glow     { animation: ss-glow-pulse 2.5s ease-in-out 0.8s infinite; }
                .ss-circle   { stroke-dasharray: 201; stroke-dashoffset: 201; animation: ss-draw-circle 0.6s ease-out 0.2s forwards; }
                .ss-check    { stroke-dasharray: 50;  stroke-dashoffset: 50;  animation: ss-draw-check  0.38s ease-out 0.65s forwards; }
                .ss-star     { transform-origin: 79px 11px; animation: ss-star-spin 8s linear infinite; }
                .ss-label    { animation: ss-label-in 0.5s cubic-bezier(.22,1,.36,1) 0.7s both; }
                .ss-line     { transform-origin: left; animation: ss-line-grow 0.4s ease-out 0.85s both; }
                .ss-title    { animation: ss-text-in 0.45s cubic-bezier(.22,1,.36,1) 0.9s both; }
                .ss-msg      { animation: ss-text-in 0.45s cubic-bezier(.22,1,.36,1) 1.05s both; }
            `}</style>

            <div className="ss-in flex flex-col items-center gap-7 py-10 px-6 text-center">

                {/* ── Icône ── */}
                <div className="relative">

                    {/* Glow — classe bg-primary pour la couleur */}
                    <div className="ss-glow absolute inset-0 -m-6 rounded-full bg-primary blur-2xl" />

                    {/* SVG — text-primary sur le parent, currentColor dans le SVG */}
                    <div className="ss-icon-pop relative text-primary">
                        <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
                            {/* Fond teinté */}
                            <circle cx="45" cy="45" r="32" fill="currentColor" fillOpacity="0.12" />
                            {/* Anneau décoratif fin */}
                            <circle cx="45" cy="45" r="40" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" fill="none" />
                            {/* Cercle animé */}
                            <circle
                                className="ss-circle"
                                cx="45" cy="45" r="32"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                fill="none"
                                strokeLinecap="round"
                                transform="rotate(-90 45 45)"
                            />
                            {/* Checkmark */}
                            <path
                                className="ss-check"
                                d="M30 46L41 57L61 35"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                            {/* Étoile ScreenClub décorative */}
                            <g className="ss-star">
                                <path
                                    d="M79 7L80.2 10.2L83.5 11L80.2 11.8L79 15L77.8 11.8L74.5 11L77.8 10.2Z"
                                    fill="currentColor"
                                    fillOpacity="0.7"
                                />
                            </g>
                            {/* Petit point accent */}
                            <circle cx="11" cy="79" r="2.5" fill="currentColor" fillOpacity="0.4" />
                        </svg>
                    </div>
                </div>

                {/* ── Texte ── */}
                <div className="flex flex-col items-center gap-2">

                    {/* Label uppercase */}
                    <p className="ss-label font-unbounded text-[0.6rem] font-bold tracking-[0.25em] text-primary uppercase m-0">
                        {sub}
                    </p>

                    {/* Ligne déco */}
                    <div className="ss-line h-px w-10 bg-primary opacity-40" />

                    {/* Titre */}
                    <p className="ss-title font-unbounded text-xl font-black tracking-tight text-base-content m-0 leading-snug">
                        {title}
                    </p>

                    {/* Message */}
                    <p className="ss-msg text-sm text-base-content/50 max-w-[240px] leading-relaxed m-0 font-medium">
                        {message}
                    </p>
                </div>

            </div>
        </>
    );
}

export default SuccessScreen;