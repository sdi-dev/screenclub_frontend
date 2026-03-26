import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ajouterAvis } from "@/api/avis";
import SuccessScreen from "@components/ui/SuccessScreen.jsx";

// ─── Icônes ───────────────────────────────────────────────────────────────────
const IconAlert = () => (
    <svg className="w-4 h-4 shrink-0 mt-0.5 text-error" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
    </svg>
);

// ─── Étoile SVG ───────────────────────────────────────────────────────────────
const Star = ({ filled, hovered, onClick, onMouseEnter, index }) => (
    <button
        type="button"
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        aria-label={`${index} étoile${index > 1 ? "s" : ""}`}
        className="transition-transform duration-100 hover:scale-110 active:scale-95 focus:outline-none"
        style={{ background: "none", border: "none", padding: "2px", cursor: "pointer" }}
    >
        <svg
            viewBox="0 0 24 24"
            className="w-9 h-9 transition-colors duration-100"
            fill={filled || hovered ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.5}
            style={{
                color: filled || hovered
                    ? "oklch(var(--color-warning) / 1)"
                    : "oklch(from var(--color-base-content) l c h / 0.2)",
            }}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
            />
        </svg>
    </button>
);

// ─── Labels associés aux notes ────────────────────────────────────────────────
const NOTE_LABELS = {
    0: "",
    1: "Très mauvais",
    2: "Bof",
    3: "Pas mal",
    4: "Bien !",
    5: "Excellent !",
};

// ─── Composant principal ──────────────────────────────────────────────────────
/**
 * @param {Object}   props
 * @param {boolean}  props.isOpen      - Ouvre/ferme la modale
 * @param {Function} props.onClose     - Callback fermeture
 * @param {{ id: number, title: string, posterUrl?: string }} props.media
 * @param {Object}   [props.existing]  - Avis existant à modifier { note, avis }
 */
function NoteModal({ isOpen, onClose, media, onSuccess ,existing = null }) {

    const [note, setNote]       = useState(existing?.note ?? 0);
    const [hovered, setHovered] = useState(0);
    const [avis, setAvis]       = useState(existing?.avis ?? "");
    const [error, setError]     = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Reset à chaque ouverture
    useEffect(() => {
        if (isOpen) {
            setNote(existing?.note ?? 0);
            setAvis(existing?.avis ?? "");
            setError("");
            setLoading(false);
            setHovered(0);
            setSuccess(false);
        }
    }, [isOpen, existing]);

    async function handleSubmit() {
        setError("");

        if (note === 0) {
            setError("Tu dois attribuer au moins une étoile.");
            return;
        }

        setLoading(true);
        try {
            await ajouterAvis({
                tmdbId:   media.tmdbId,
                tmdbType: media.tmdbType, // "movie" ou "tv"
                note,
                avis: avis.trim() || null,
            });
            setSuccess(true);
            onSuccess?.();
            setTimeout(onClose, 2200);
        } catch (err) {
            const msg = err?.message || err?.toString?.() || "Une erreur est survenue.";
            setError(typeof msg === "string" && msg.trim() ? msg : "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) return null;

    const displayedNote = hovered || note;

    return createPortal(
        <>
            <style>{`
                @keyframes backdropIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes modalIn {
                    from { opacity: 0; transform: translateY(24px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes formIn {
                    from { opacity: 0; transform: translateX(12px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                .auth-backdrop { animation: backdropIn 0.25s ease both; }
                .auth-modal    { animation: modalIn 0.35s cubic-bezier(.22,1,.36,1) both; }
                .form-enter    { animation: formIn  0.22s cubic-bezier(.22,1,.36,1) both; }
            `}</style>

            <div
                className="auth-backdrop fixed inset-0 z-999 flex items-center justify-center p-4"
                style={{ background: "oklch(0% 0 0 / 0.65)" }}
                onClick={onClose}
            >
                <div
                    className="auth-modal relative w-full max-w-md rounded-3xl border border-base-content/10 shadow-2xl overflow-y-auto max-h-[90dvh] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    style={{
                        background: "oklch(from var(--color-base-200) l c h / 0.55)",
                        backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Halo décoratif */}
                    <div
                        className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
                        style={{ background: "radial-gradient(circle, oklch(from var(--color-primary) l c h / 0.12) 0%, transparent 70%)" }}
                    />

                    <div className="relative z-10 p-8">

                        {/* ── Écran succès ── */}
                        {success ? (
                            <SuccessScreen message="Votre avis a bien été transmis, il sera publié sous peu." />
                        ) : (<>

                            {/* ── Header ── */}
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    {/* Mini poster */}
                                    {media?.posterUrl ? (
                                        <img
                                            src={media.posterUrl}
                                            alt={media.title}
                                            className="w-12 h-16 object-cover rounded-lg shadow-md shrink-0"
                                        />
                                    ) : (
                                        <div className="w-12 h-16 rounded-lg bg-base-content/10 flex items-center justify-center text-2xl shrink-0">
                                            🎞
                                        </div>
                                    )}
                                    <div>
                                        <h2 className="text-2xl font-black text-base-content tracking-tight">
                                            {existing ? "Modifier mon avis" : "Donner mon avis"} ⭐
                                        </h2>
                                        <p className="text-sm text-base-content/50 mt-1 line-clamp-1">
                                            {media?.title}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    className="btn btn-ghost btn-sm btn-circle text-base-content/50 shrink-0"
                                    onClick={onClose}
                                    aria-label="Fermer"
                                >
                                    ✕
                                </button>
                            </div>

                        {/* ── Formulaire ── */}
                            <div className="form-enter flex flex-col gap-6">

                                {/* Étoiles */}
                                <div
                                    className="flex flex-col items-center gap-3"
                                    onMouseLeave={() => setHovered(0)}
                                >
                                    <div
                                        className="flex items-center justify-center gap-1 px-6 py-4 rounded-2xl w-full"
                                        style={{ background: "oklch(from var(--color-base-300) l c h / 0.6)" }}
                                    >
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <Star
                                                key={i}
                                                index={i}
                                                filled={i <= note}
                                                hovered={i <= hovered}
                                                onClick={() => setNote(i)}
                                                onMouseEnter={() => setHovered(i)}
                                            />
                                        ))}
                                    </div>

                                    {/* Label de la note */}
                                    <p
                                        className="text-sm font-semibold transition-all duration-150 h-5"
                                        style={{
                                            color: displayedNote > 0
                                                ? "oklch(var(--color-warning) / 0.9)"
                                                : "transparent",
                                        }}
                                    >
                                        {NOTE_LABELS[displayedNote]}
                                    </p>
                                </div>

                                {/* Avis texte */}
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend text-base-content/60 text-xs">
                                        Avis
                                        <span className="text-base-content/30 font-normal ml-1">(optionnel)</span>
                                    </legend>
                                    <textarea
                                        value={avis}
                                        onChange={(e) => setAvis(e.target.value)}
                                        placeholder="Qu'est-ce que tu as pensé de ce titre ?"
                                        maxLength={1000}
                                        rows={4}
                                        className="textarea w-full bg-base-100/40 border-base-content/10 focus:border-primary resize-none"
                                    />
                                    <p className="label text-base-content/35 text-[11px] mt-1 text-right">
                                        {avis.length}/1000
                                    </p>
                                </fieldset>

                                {/* Alerte erreur */}
                                {error && (
                                    <div
                                        role="alert"
                                        className="flex items-start gap-3 rounded-xl border border-error/25 p-3 text-sm"
                                        style={{
                                            background: "oklch(from var(--color-error) l c h / 0.12)",
                                            backdropFilter: "blur(12px)",
                                            WebkitBackdropFilter: "blur(12px)",
                                        }}
                                    >
                                        <IconAlert />
                                        <span className="text-error/90">{error}</span>
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="btn btn-primary btn-block mt-2 shadow-lg"
                                >
                                    {loading
                                        ? <span className="loading loading-spinner loading-sm" />
                                        : existing ? "Mettre à jour" : "Publier mon avis"
                                    }
                                </button>

                            </div>
                        </>)}
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}

export default NoteModal;