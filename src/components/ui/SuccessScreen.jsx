/**
 * SuccessScreen — écran de confirmation animé (checkmark SVG + message).
 * Utilisé dans NoteModal et CreateWatchlistModal après un submit réussi.
 *
 * @param {{ message?: string }} props
 */
function SuccessScreen({ message = "Votre demande a bien été transmise." }) {
    return (
        <>
            <style>{`
                @keyframes successFadeIn {
                    from { opacity: 0; transform: scale(0.92) translateY(12px); }
                    to   { opacity: 1; transform: scale(1)    translateY(0);    }
                }
                @keyframes checkCircle {
                    from { stroke-dashoffset: 166; }
                    to   { stroke-dashoffset: 0;   }
                }
                @keyframes checkMark {
                    from { stroke-dashoffset: 48; }
                    to   { stroke-dashoffset: 0;  }
                }
                @keyframes successPulse {
                    0%, 100% { box-shadow: 0 0 0 0 oklch(var(--color-success) / 0.25); }
                    50%      { box-shadow: 0 0 0 16px oklch(var(--color-success) / 0);  }
                }
                .success-screen  { animation: successFadeIn 0.4s cubic-bezier(.22,1,.36,1) both; }
                .check-circle    {
                    stroke-dasharray: 166;
                    stroke-dashoffset: 166;
                    animation: checkCircle 0.5s cubic-bezier(.65,0,.45,1) 0.1s forwards;
                }
                .check-mark      {
                    stroke-dasharray: 48;
                    stroke-dashoffset: 48;
                    animation: checkMark 0.35s cubic-bezier(.65,0,.45,1) 0.55s forwards;
                }
                .check-glow      { animation: successPulse 1.8s ease 0.6s infinite; }
            `}</style>

            <div className="success-screen flex flex-col items-center justify-center gap-6 py-8 px-4 text-center">

                {/* Cercle + checkmark SVG animé */}
                <div
                    className="check-glow rounded-full p-1"
                    style={{ background: "oklch(from var(--color-success) l c h / 0.12)" }}
                >
                    <svg
                        className="w-24 h-24"
                        viewBox="0 0 52 52"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Cercle */}
                        <circle
                            className="check-circle"
                            cx="26"
                            cy="26"
                            r="25"
                            stroke="oklch(var(--color-success))"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                        />
                        {/* Checkmark */}
                        <path
                            className="check-mark"
                            d="M14.5 27L21.5 34L37.5 18"
                            stroke="oklch(var(--color-success))"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>

                {/* Texte */}
                <div className="flex flex-col gap-1">
                    <p className="text-lg font-black text-base-content tracking-tight">
                        C'est dans la boîte ! 🎉
                    </p>
                    <p className="text-sm text-base-content/50 max-w-xs leading-relaxed">
                        {message}
                    </p>
                </div>

            </div>
        </>
    );
}

export default SuccessScreen;