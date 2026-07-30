import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Star, Eye, Pencil, EyeOff } from "lucide-react";
import { ajouterAvis } from "@api/Avis";
import SuccessScreen from "@components/ui/SuccessScreen.jsx";

// ─── Icônes ───────────────────────────────────────────────────────────────────
const IconAlert = () => (
    <svg className="w-4 h-4 shrink-0 mt-0.5 text-error" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
    </svg>
);

// ─── Couleur amber fixe pour les étoiles ─────────────────────────────────────
const AMBER = "oklch(83% 0.18 84)";
const AMBER_EMPTY = "oklch(from var(--color-base-content) l c h / 0.18)";

// ─── Étoile SVG ───────────────────────────────────────────────────────────────
const StarIcon = ({ filled, hovered, onClick, onMouseEnter, index }) => (
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
            style={{ color: filled || hovered ? AMBER : AMBER_EMPTY }}
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

// ─── Toolbar — wrap de sélection ─────────────────────────────────────────────
function wrapSelection(textarea, open, close, setValue) {
    const start  = textarea.selectionStart;
    const end    = textarea.selectionEnd;
    const before = textarea.value.slice(0, start);
    const sel    = textarea.value.slice(start, end);
    const after  = textarea.value.slice(end);

    setValue(before + open + sel + close + after);

    setTimeout(() => {
        textarea.focus();
        if (sel.length === 0) {
            const pos = start + open.length;
            textarea.setSelectionRange(pos, pos);
        } else {
            textarea.setSelectionRange(start + open.length, start + open.length + sel.length);
        }
    }, 0);
}

// ─── Parser formatage (séquentiel, sans ambiguïté regex) ─────────────────────
const TOKENS = [
    { open: "||", close: "||", type: "spoiler"   },
    { open: "**", close: "**", type: "bold"      },
    { open: "__", close: "__", type: "underline" },
    { open: "_",  close: "_",  type: "italic"    },
];

function parseSegment(text, key = 0) {
    if (!text) return [];
    const parts = [];
    let remaining = text;
    let globalIdx = key;

    while (remaining.length > 0) {
        let earliestPos   = Infinity;
        let earliestClose = null;
        let earliestToken = null;

        for (const token of TOKENS) {
            const pos = remaining.indexOf(token.open);
            if (pos !== -1 && pos < earliestPos) {
                const closePos = remaining.indexOf(token.close, pos + token.open.length);
                if (closePos !== -1) {
                    earliestPos   = pos;
                    earliestClose = closePos;
                    earliestToken = token;
                }
            }
        }

        if (!earliestToken) { parts.push(remaining); break; }
        if (earliestPos > 0) parts.push(remaining.slice(0, earliestPos));

        const inner = remaining.slice(earliestPos + earliestToken.open.length, earliestClose);
        globalIdx++;

        if (earliestToken.type === "spoiler") {
            parts.push(<SpoilerSpan key={globalIdx}>{inner}</SpoilerSpan>);
        } else if (earliestToken.type === "bold") {
            parts.push(<strong key={globalIdx}>{inner}</strong>);
        } else if (earliestToken.type === "underline") {
            parts.push(<u key={globalIdx}>{inner}</u>);
        } else if (earliestToken.type === "italic") {
            parts.push(<em key={globalIdx}>{inner}</em>);
        }

        remaining = remaining.slice(earliestClose + earliestToken.close.length);
    }

    return parts;
}

function SpoilerSpan({ children }) {
    const [revealed, setRevealed] = useState(false);
    return (
        <span
            onClick={() => setRevealed(true)}
            title={revealed ? undefined : "Spoiler — cliquez pour révéler"}
            className="px-1 rounded cursor-pointer select-none transition-all duration-200"
            style={{
                background: revealed
                    ? "oklch(from var(--color-warning) l c h / 0.20)"
                    : "oklch(from var(--color-base-content) l c h / 0.85)",
                color: revealed
                    ? "oklch(from var(--color-base-content) l c h / 1)"
                    : "transparent",
                userSelect: revealed ? "text" : "none",
            }}
        >
            {children}
        </span>
    );
}

function renderFormatted(text) {
    if (!text) return null;
    return parseSegment(text);
}

// ─── Boutons toolbar B / I / U ────────────────────────────────────────────────
const ToolbarBtn = ({ label, title, onClick }) => (
    <button
        type="button"
        title={title}
        onClick={onClick}
        className="btn btn-sm btn-ghost text-base-content/60 hover:text-base-content hover:bg-base-content/10 min-w-[34px] px-2 font-mono"
    >
        {label}
    </button>
);

// ─── Composant principal ──────────────────────────────────────────────────────
/**
 * @param {Object}   props
 * @param {boolean}  props.isOpen
 * @param {Function} props.onClose
 * @param {{ tmdbId: number, tmdbType: string, title: string, posterUrl?: string }} props.media
 * @param {Function} [props.onSuccess]
 * @param {Object}   [props.existing]  { note, avis }
 */
function NoteModal({ isOpen, onClose, media, onSuccess, existing = null }) {
    const [note, setNote]       = useState(existing?.note ?? 0);
    const [hovered, setHovered] = useState(0);
    const [avis, setAvis]       = useState(existing?.avis ?? "");
    const [preview, setPreview] = useState(false);
    const [error, setError]     = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const textareaRef           = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setNote(existing?.note ?? 0);
            setAvis(existing?.avis ?? "");
            setError("");
            setLoading(false);
            setHovered(0);
            setSuccess(false);
            setPreview(false);
        }
    }, [isOpen, existing]);

    function handleWrap(open, close) {
        if (textareaRef.current) wrapSelection(textareaRef.current, open, close, setAvis);
    }

    async function handleSubmit() {
        setError("");
        if (note === 0) { setError("Tu dois attribuer au moins une étoile."); return; }

        setLoading(true);
        try {
            await ajouterAvis({
                tmdbId:   media.tmdbId,
                tmdbType: media.tmdbType,
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
    const atLimit       = avis.length >= 1000;

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
                .format-toolbar { border-bottom: 1px solid oklch(from var(--color-base-content) l c h / 0.08); }
            `}</style>

            <div
                className="auth-backdrop fixed inset-0 z-999 flex items-center justify-center p-4"
                style={{ background: "oklch(0% 0 0 / 0.72)" }}
                onClick={onClose}
            >
                <div
                    className="auth-modal relative w-full max-w-md rounded-3xl border border-base-content/15 shadow-2xl overflow-y-auto max-h-[90dvh] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    style={{
                        background: "oklch(from var(--color-base-200) l c h / 0.88)",
                        backdropFilter: "blur(40px) saturate(1.4)",
                        WebkitBackdropFilter: "blur(40px) saturate(1.4)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Halo décoratif */}
                    <div
                        className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
                        style={{ background: "radial-gradient(circle, oklch(from var(--color-primary) l c h / 0.10) 0%, transparent 70%)" }}
                    />

                    <div className="relative z-10 p-8">

                        {/* ── Écran succès ── */}
                        {success ? (
                            <SuccessScreen variant="note" message="Votre avis a bien été transmis, il sera publié sous peu." />
                        ) : (<>

                            {/* ── Header ── */}
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex items-center gap-4">
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
                                        <h2
                                            className="text-xl font-bold text-base-content tracking-tight flex items-center gap-2"
                                            style={{ fontFamily: "var(--font-unbounded, 'Unbounded', sans-serif)" }}
                                        >
                                            {existing ? "Modifier mon avis" : "Donner mon avis"}
                                            <Star className="w-5 h-5 shrink-0" style={{ color: AMBER }} strokeWidth={2} />
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
                                        style={{ background: "oklch(from var(--color-base-300) l c h / 0.7)" }}
                                    >
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <StarIcon
                                                key={i}
                                                index={i}
                                                filled={i <= note}
                                                hovered={i <= hovered}
                                                onClick={() => setNote(i)}
                                                onMouseEnter={() => setHovered(i)}
                                            />
                                        ))}
                                    </div>

                                    <p
                                        className="text-sm font-semibold transition-all duration-150 h-5"
                                        style={{ color: displayedNote > 0 ? AMBER : "transparent" }}
                                    >
                                        {NOTE_LABELS[displayedNote]}
                                    </p>
                                </div>

                                {/* Avis texte */}
                                <fieldset className="fieldset gap-0">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <legend className="fieldset-legend text-base-content/60 text-xs">
                                            Avis
                                            <span className="text-base-content/30 font-normal ml-1">(optionnel)</span>
                                        </legend>

                                        {/* Bouton aperçu / éditer — coloré */}
                                        <button
                                            type="button"
                                            onClick={() => setPreview(p => !p)}
                                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all hover:opacity-80 active:scale-95"
                                            style={{
                                                background: preview
                                                    ? "oklch(from var(--color-primary) l c h / 0.15)"
                                                    : "oklch(from var(--color-secondary) l c h / 0.15)",
                                                color: preview
                                                    ? "oklch(from var(--color-primary) l c h / 1)"
                                                    : "oklch(from var(--color-secondary) l c h / 1)",
                                                border: preview
                                                    ? "1px solid oklch(from var(--color-primary) l c h / 0.30)"
                                                    : "1px solid oklch(from var(--color-secondary) l c h / 0.30)",
                                            }}
                                        >
                                            {preview
                                                ? <><Pencil className="w-3 h-3" /> Éditer</>
                                                : <><Eye className="w-3 h-3" /> Aperçu</>
                                            }
                                        </button>
                                    </div>

                                    {/* Zone d'édition avec toolbar */}
                                    {!preview ? (
                                        <div
                                            className="rounded-xl overflow-hidden border border-base-content/10 focus-within:border-primary transition-colors"
                                            style={{ background: "oklch(from var(--color-base-100) l c h / 0.55)" }}
                                        >
                                            {/* Toolbar */}
                                            <div className="format-toolbar flex items-center gap-1 px-3 py-2">
                                                <ToolbarBtn
                                                    label={<span className="text-base" style={{ fontWeight: 800 }}>B</span>}
                                                    title="Gras (**texte**)"
                                                    onClick={() => handleWrap("**", "**")}
                                                />
                                                <ToolbarBtn
                                                    label={<span className="text-base" style={{ fontStyle: "italic" }}>I</span>}
                                                    title="Italique (_texte_)"
                                                    onClick={() => handleWrap("_", "_")}
                                                />
                                                <ToolbarBtn
                                                    label={<span className="text-base" style={{ textDecoration: "underline" }}>U</span>}
                                                    title="Souligné (__texte__)"
                                                    onClick={() => handleWrap("__", "__")}
                                                />

                                                {/* Séparateur */}
                                                <span
                                                    className="mx-1.5 h-5 self-center"
                                                    style={{ borderLeft: "1px solid oklch(from var(--color-base-content) l c h / 0.15)" }}
                                                />

                                                {/* Bouton spoiler — badge warning bien visible */}
                                                <button
                                                    type="button"
                                                    title="Spoiler (||texte||)"
                                                    onClick={() => handleWrap("||", "||")}
                                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all hover:opacity-80 active:scale-95"
                                                    style={{
                                                        background: "oklch(from var(--color-warning) l c h / 0.18)",
                                                        color: "oklch(from var(--color-warning) l c h / 1)",
                                                        border: "1px solid oklch(from var(--color-warning) l c h / 0.40)",
                                                    }}
                                                >
                                                    <EyeOff className="w-3.5 h-3.5" />
                                                    Spoiler
                                                </button>
                                            </div>

                                            {/* Textarea */}
                                            <textarea
                                                ref={textareaRef}
                                                value={avis}
                                                onChange={(e) => setAvis(e.target.value)}
                                                placeholder="Qu'est-ce que tu as pensé de ce titre ?"
                                                maxLength={1000}
                                                rows={4}
                                                className="w-full bg-transparent border-none outline-none resize-none px-3 py-2 text-sm text-base-content placeholder:text-base-content/30"
                                                style={{ display: "block" }}
                                            />
                                        </div>
                                    ) : (
                                        /* Preview */
                                        <div
                                            className="rounded-xl border border-base-content/10 min-h-[100px] px-3 py-2 text-sm text-base-content/80 leading-relaxed"
                                            style={{ background: "oklch(from var(--color-base-100) l c h / 0.55)" }}
                                        >
                                            {avis.trim()
                                                ? <p className="whitespace-pre-wrap">{renderFormatted(avis)}</p>
                                                : <span className="text-base-content/30 italic">Aucun texte pour l'aperçu.</span>
                                            }
                                        </div>
                                    )}

                                    {/* Compteur / alerte limite */}
                                    {atLimit ? (
                                        <div
                                            role="alert"
                                            className="flex items-center gap-2 rounded-xl border border-error/25 px-3 py-2 mt-1.5 text-xs"
                                            style={{ background: "oklch(from var(--color-error) l c h / 0.12)" }}
                                        >
                                            <IconAlert />
                                            <span className="text-error/90">
                                                Oops, vous ne pouvez pas écrire plus de 1000 caractères.
                                            </span>
                                        </div>
                                    ) : (
                                        <p className="label text-base-content/30 text-[11px] mt-1 text-right">
                                            {avis.length}/1000
                                        </p>
                                    )}

                                    {/* Charte */}
                                    <p className="text-[11px] text-base-content/50 mt-1.5 leading-relaxed">
                                        En postant cette review, vous vous engagez à respecter la{" "}
                                        <a
                                            href="/legal/cgu"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="link link-secondary"
                                        >
                                            charte ScreenClub
                                        </a>
                                        .
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