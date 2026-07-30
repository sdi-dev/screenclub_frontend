import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import SuccessScreen from "@components/ui/SuccessScreen.jsx";
import {soumettreSignalement} from "@api/reportService.js";

// ─── Constantes ───────────────────────────────────────────────────────────────

const MOTIFS = [
    { value: "PROPOS_HAINEUX",      label: "Propos haineux" },
    { value: "HARCELEMENT",         label: "Harcèlement" },
    { value: "SPAM",                label: "Spam" },
    { value: "DESINFORMATION",      label: "Désinformation" },
    { value: "CONTENU_INAPPROPRIE", label: "Contenu inapproprié" },
    { value: "AUTRE",               label: "Autre" },
];

const TYPE_LABELS = {
    AVIS:      "cet avis",
    WATCHLIST: "cette watchlist",
};

// ─── Icônes ───────────────────────────────────────────────────────────────────

const IconAlert = () => (
    <svg className="w-4 h-4 shrink-0 mt-0.5 text-error" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

const IconFlag = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18M3 7l9-4 9 4v8l-9 4-9-4V7z" />
    </svg>
);

// ─── Composant principal ──────────────────────────────────────────────────────

/**
 * @param {Object}   props
 * @param {boolean}  props.isOpen
 * @param {Function} props.onClose
 * @param {{ typeObjet: "AVIS"|"WATCHLIST", objetId: number, label?: string }} props.target
 *   - typeObjet : type de contenu signalé
 *   - objetId   : id de l'avis ou de la watchlist
 *   - label     : texte descriptif affiché (ex. "Critique de Oppenheimer")
 */
function ReportModal({ isOpen, onClose, target }) {
    const [motif,   setMotif]   = useState("");
    const [message, setMessage] = useState("");
    const [error,   setError]   = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Reset à chaque ouverture
    useEffect(() => {
        if (isOpen) {
            setMotif("");
            setMessage("");
            setError("");
            setLoading(false);
            setSuccess(false);
        }
    }, [isOpen]);

    async function handleSubmit() {
        setError("");

        if (!motif) {
            setError("Sélectionne un motif de signalement.");
            return;
        }

        setLoading(true);
        try {
            await soumettreSignalement({
                typeObjet: target.typeObjet,
                objetId:   target.objetId,
                motif,
                message:   message.trim() || undefined,
            });
            setSuccess(true);
            setTimeout(onClose, 2200);
        } catch (err) {
            const msg = err?.message ?? "Une erreur est survenue.";
            setError(typeof msg === "string" && msg.trim() ? msg : "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen || !target) return null;

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

                .report-motif-option {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 14px;
                    border-radius: 10px;
                    cursor: pointer;
                    border: 1px solid transparent;
                    transition: background 0.12s, border-color 0.12s;
                    font-size: 13px;
                }
                .report-motif-option:hover {
                    background: oklch(from var(--color-base-300) l c h / 0.6);
                }
                .report-motif-option.selected {
                    background: oklch(from var(--color-error) l c h / 0.1);
                    border-color: oklch(from var(--color-error) l c h / 0.35);
                    color: oklch(from var(--color-error) l c h);
                }
                .report-motif-option input[type="radio"] {
                    accent-color: oklch(from var(--color-error) l c h);
                    width: 15px; height: 15px; flex-shrink: 0;
                }
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
                    {/* Halo décoratif — rouge pour différencier visuellement de NoteModal */}
                    <div
                        className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
                        style={{ background: "radial-gradient(circle, oklch(from var(--color-error) l c h / 0.1) 0%, transparent 70%)" }}
                    />

                    <div className="relative z-10 p-8">

                        {/* ── Écran succès ── */}
                        {success ? (
                            <SuccessScreen
                                variant="report"
                                message="Signalement envoyé. Notre équipe de modération va examiner ce contenu."
                            />
                        ) : (
                            <>
                                {/* ── Header ── */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                                            style={{ background: "oklch(from var(--color-error) l c h / 0.12)", color: "oklch(from var(--color-error) l c h)" }}
                                        >
                                            <IconFlag />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-base-content tracking-tight">
                                                Signaler un contenu
                                            </h2>
                                            {target.label && (
                                                <p className="text-xs text-base-content/45 mt-0.5 line-clamp-1">
                                                    {target.label}
                                                </p>
                                            )}
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
                                <div className="form-enter flex flex-col gap-5">

                                    {/* Sélection du motif */}
                                    <fieldset>
                                        <legend className="text-xs font-unbounded font-semibold tracking-widest uppercase text-base-content/50 mb-3">
                                            Motif <span className="text-error/70">*</span>
                                        </legend>
                                        <div className="flex flex-col gap-1.5">
                                            {MOTIFS.map((m) => (
                                                <label
                                                    key={m.value}
                                                    className={`report-motif-option ${motif === m.value ? "selected" : ""}`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="motif"
                                                        value={m.value}
                                                        checked={motif === m.value}
                                                        onChange={() => setMotif(m.value)}
                                                    />
                                                    {m.label}
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>

                                    {/* Message facultatif */}
                                    <fieldset className="fieldset">
                                        <legend className="fieldset-legend text-base-content/60 text-xs">
                                            Précisions
                                            <span className="text-base-content/30 font-normal ml-1">(optionnel)</span>
                                        </legend>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Décris le problème en quelques mots…"
                                            maxLength={500}
                                            rows={3}
                                            className="textarea w-full bg-base-100/40 border-base-content/10 focus:border-error resize-none"
                                        />
                                        <p className="label text-base-content/35 text-[11px] mt-1 text-right">
                                            {message.length}/500
                                        </p>
                                    </fieldset>

                                    {/* Disclaimer */}
                                    <p className="text-[11px] text-base-content/35 leading-relaxed">
                                        Les signalements abusifs ou de mauvaise foi peuvent entraîner une restriction de ton compte conformément à nos{" "}
                                        <a href="/legal/cgu" className="underline hover:text-base-content/60 transition-colors">CGU</a>.
                                    </p>

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
                                        disabled={loading || !motif}
                                        className="btn btn-error btn-block mt-1 shadow-lg"
                                    >
                                        {loading
                                            ? <span className="loading loading-spinner loading-sm" />
                                            : `Signaler ${TYPE_LABELS[target?.typeObjet] ?? "ce contenu"}`
                                        }
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}

export default ReportModal;