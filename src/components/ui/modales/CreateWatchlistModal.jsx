import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { createWatchlist } from "@api/Watchlist";
import SuccessScreen from "@components/ui/SuccessScreen.jsx";
import { searchMedias } from "@api/Media";

// ─── Debounce hook pour la recherche de médias ────────────────────────────────
function useDebounce(value, delay = 350) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

// ─── Icônes inline ────────────────────────────────────────────────────────────
const IconAlert = () => (
    <svg className="w-4 h-4 shrink-0 mt-0.5 text-error" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
    </svg>
);

const IconSearch = () => (
    <svg className="w-4 h-4 text-base-content/40" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
    </svg>
);

const IconClose = ({ className = "" }) => (
    <svg className={`w-3.5 h-3.5 ${className}`} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
    </svg>
);

const IconPlus = () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
    </svg>
);

// ─── Composant principal ──────────────────────────────────────────────────────
/**
 * @param {Object}  props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {{ id: number, title: string, posterUrl?: string, type: string }} [props.initialMedia]
 *   Média pré-sélectionné à l'ouverture (ex: depuis une page MediaInfo).
 */
function CreateWatchlistModal({ isOpen, onClose, initialMedia = null }) {

    const [error, setError]       = useState("");
    const [loading, setLoading]   = useState(false);
    const [success, setSuccess]   = useState(false);

    const [form, setForm] = useState({
        title:       "",
        description: "",
        type:        "PUBLIC",   // "PUBLIC" | "PRIVATE"
        coverUrl:    "",
    });

    // Médias sélectionnés : Set d'objets { id, title, posterUrl, type }
    const [selectedMedias, setSelectedMedias] = useState([]);

    // Recherche de médias
    const [mediaQuery, setMediaQuery]     = useState("");
    const [mediaResults, setMediaResults] = useState([]);
    const [mediaSearching, setMediaSearching] = useState(false);
    const debouncedQuery = useDebounce(mediaQuery, 350);

    const inputRef = useRef(null);

    // ── Recherche auto sur debounce ──
    useEffect(() => {
        if (!debouncedQuery.trim()) { setMediaResults([]); return; }
        let cancelled = false;
        (async () => {
            setMediaSearching(true);
            try {
                const results = await searchMedias(debouncedQuery);
                if (!cancelled) setMediaResults(results ?? []);
            } catch {
                if (!cancelled) setMediaResults([]);
            } finally {
                if (!cancelled) setMediaSearching(false);
            }
        })();
        return () => { cancelled = true; };
    }, [debouncedQuery]);

    // ── Reset + pré-remplissage à l'ouverture/fermeture ──
    useEffect(() => {
        if (isOpen) {
            // Pré-remplir le média initial s'il est fourni
            setSelectedMedias(initialMedia ? [initialMedia] : []);
        } else {
            setError("");
            setLoading(false);
            setSuccess(false);
            setForm({ title: "", description: "", type: "PUBLIC", coverUrl: "" });
            setSelectedMedias([]);
            setMediaQuery("");
            setMediaResults([]);
        }
    }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const addMedia = (media) => {
        if (selectedMedias.some((m) => m.tmdbId === media.tmdbId)) return;
        setSelectedMedias((prev) => [...prev, media]);
        setMediaQuery("");
        setMediaResults([]);
    };

    const removeMedia = (tmdbId) =>
        setSelectedMedias((prev) => prev.filter((m) => m.tmdbId !== tmdbId));

    async function handleSubmit() {
        setError("");

        // ── Validations client ──
        if (!form.title.trim()) {
            setError("Le titre est obligatoire.");
            return;
        }
        if (selectedMedias.length === 0) {
            setError("Ajoute au moins un média avant de créer ta watchlist.");
            return;
        }

        setLoading(true);
        try {
            await createWatchlist({
                title:         form.title.trim(),
                description:   form.description.trim() || null,
                type:          form.type,
                coverImageUrl: form.coverUrl.trim() || null,
                medias:        selectedMedias.map((m) => ({
                    tmdbId:   m.tmdbId,
                    tmdbType: m.tmdbType,
                })),
            });
            setSuccess(true);
            setTimeout(onClose, 2200);
        } catch (err) {
            const msg = err?.message || err?.toString?.() || "Une erreur est survenue.";
            setError(typeof msg === "string" && msg.trim() ? msg : "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) return null;

    const isAlreadySelected = (tmdbId) => selectedMedias.some((m) => m.tmdbId === tmdbId);

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
                @keyframes chipIn {
                    from { opacity: 0; transform: scale(0.85); }
                    to   { opacity: 1; transform: scale(1); }
                }
                .auth-backdrop  { animation: backdropIn 0.25s ease both; }
                .auth-modal     { animation: modalIn 0.35s cubic-bezier(.22,1,.36,1) both; }
                .form-enter     { animation: formIn  0.22s cubic-bezier(.22,1,.36,1) both; }
                .media-chip     { animation: chipIn  0.18s cubic-bezier(.22,1,.36,1) both; }
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
                            <SuccessScreen variant="watchlist" message="Ta watchlist a bien été créée, elle est maintenant disponible sur ton profil." />
                        ) : (<>

                            {/* ── Header ── */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-base-content tracking-tight">
                                        Nouvelle watchlist 🎬
                                    </h2>
                                    <p className="text-sm text-base-content/50 mt-1">
                                        Regroupe tes films, séries et animés préférés
                                    </p>
                                </div>
                                <button
                                    className="btn btn-ghost btn-sm btn-circle text-base-content/50"
                                    onClick={onClose}
                                    aria-label="Fermer"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* ── Toggle PUBLIC / PRIVATE ── */}
                            <div
                                className="flex rounded-xl p-1 mb-8"
                                style={{ background: "oklch(from var(--color-base-300) l c h / 0.6)" }}
                            >
                                {["PUBLIC", "PRIVATE"].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setForm((f) => ({ ...f, type: t }))}
                                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                                            form.type === t
                                                ? "bg-primary text-primary-content shadow"
                                                : "text-base-content/50 hover:text-base-content"
                                        }`}
                                    >
                                        {t === "PUBLIC" ? "🌍 Publique" : "🔒 Privée"}
                                    </button>
                                ))}
                            </div>

                            {/* ── Formulaire ── */}
                            <div className="form-enter flex flex-col gap-4">

                                {/* Titre */}
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend text-base-content/60 text-xs">
                                        Titre <span className="text-error">*</span>
                                    </legend>
                                    <input
                                        type="text"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="Mes classiques du cinéma"
                                        maxLength={50}
                                        className="input w-full bg-base-100/40 border-base-content/10 focus:border-primary"
                                        required
                                        aria-required="true"
                                    />
                                    <p className="label text-base-content/35 text-[11px] mt-1">
                                        ⚠️ Tu ne peux pas avoir deux watchlists avec le même nom
                                    </p>
                                </fieldset>

                                {/* Description */}
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend text-base-content/60 text-xs">
                                        Description
                                        <span className="text-base-content/30 font-normal ml-1">(optionnelle)</span>
                                    </legend>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Une sélection soigneusement choisie de…"
                                        maxLength={255}
                                        rows={3}
                                        className="textarea w-full bg-base-100/40 border-base-content/10 focus:border-primary resize-none"
                                    />
                                    <p className="label text-base-content/35 text-[11px] mt-1 text-right">
                                        {form.description.length}/255
                                    </p>
                                </fieldset>

                                {/* Cover URL */}
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend text-base-content/60 text-xs">
                                        URL de couverture
                                    </legend>
                                    <input
                                        type="url"
                                        name="coverUrl"
                                        value={form.coverUrl}
                                        onChange={handleChange}
                                        placeholder="https://image.tmdb.org/…"
                                        maxLength={255}
                                        className="input w-full bg-base-100/40 border-base-content/10 focus:border-primary"
                                    />
                                </fieldset>

                                {/* ── Médias ── */}
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend text-base-content/60 text-xs">
                                        Médias <span className="text-error">*</span>
                                        <span className="text-base-content/30 font-normal ml-1">(1 minimum)</span>
                                    </legend>

                                    {/* Chips médias sélectionnés */}
                                    {selectedMedias.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {selectedMedias.map((media) => (
                                                <span
                                                    key={media.tmdbId}
                                                    className="media-chip inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-xs font-semibold border border-primary/30 text-primary"
                                                    style={{
                                                        background: "oklch(from var(--color-primary) l c h / 0.12)",
                                                    }}
                                                >
                                                {media.title}
                                                    <button
                                                        onClick={() => removeMedia(media.tmdbId)}
                                                        className="hover:text-error transition-colors"
                                                        aria-label={`Retirer ${media.title}`}
                                                    >
                                                    <IconClose />
                                                </button>
                                            </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Champ de recherche */}
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <IconSearch />
                                        </div>
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={mediaQuery}
                                            onChange={(e) => setMediaQuery(e.target.value)}
                                            placeholder="Rechercher un film, une série…"
                                            className="input w-full pl-9 bg-base-100/40 border-base-content/10 focus:border-primary"
                                        />
                                        {mediaSearching && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <span className="loading loading-spinner loading-xs text-base-content/40" />
                                        </span>
                                        )}
                                    </div>

                                    {/* Résultats de recherche */}
                                    {mediaResults.length > 0 && (
                                        <ul
                                            className="mt-2 rounded-xl border border-base-content/10 overflow-hidden"
                                            style={{
                                                background: "oklch(from var(--color-base-300) l c h / 0.7)",
                                                backdropFilter: "blur(12px)",
                                            }}
                                        >
                                            {mediaResults.map((media) => {
                                                const already = isAlreadySelected(media.tmdbId);
                                                return (
                                                    <li key={media.tmdbId}>
                                                        <button
                                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                                                                already
                                                                    ? "opacity-40 cursor-default"
                                                                    : "hover:bg-primary/10 cursor-pointer"
                                                            }`}
                                                            onClick={() => !already && addMedia(media)}
                                                            disabled={already}
                                                        >
                                                            {/* Mini poster */}
                                                            {media.posterUrl ? (
                                                                <img
                                                                    src={media.posterUrl}
                                                                    alt=""
                                                                    className="w-8 h-11 object-cover rounded"
                                                                />
                                                            ) : (
                                                                <div className="w-8 h-11 rounded bg-base-content/10 flex items-center justify-center text-base-content/30 text-lg">
                                                                    🎞
                                                                </div>
                                                            )}

                                                            <div className="flex-1 text-left min-w-0">
                                                                <p className="font-semibold text-base-content truncate">{media.title}</p>
                                                                <p className="text-[11px] text-base-content/40 capitalize">{media.type?.toLowerCase()}</p>
                                                            </div>

                                                            {already ? (
                                                                <span className="text-[11px] text-base-content/30">Ajouté</span>
                                                            ) : (
                                                                <span className="text-primary opacity-70">
                                                                <IconPlus />
                                                            </span>
                                                            )}
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}

                                    {/* Aucun résultat */}
                                    {!mediaSearching && debouncedQuery.trim() && mediaResults.length === 0 && (
                                        <p className="text-center text-xs text-base-content/35 mt-3 py-2">
                                            Aucun résultat pour « {debouncedQuery} »
                                        </p>
                                    )}
                                </fieldset>

                                {/* ── Alerte erreur — glassmorphism ── */}
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

                                {/* ── Bouton submit ── */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="btn btn-primary btn-block mt-2 shadow-lg"
                                >
                                    {loading
                                        ? <span className="loading loading-spinner loading-sm" />
                                        : "Créer la watchlist"
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

export default CreateWatchlistModal;