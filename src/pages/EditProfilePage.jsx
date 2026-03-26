import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, FileText, MapPin, Image, Search, Check, X, Loader2, AlertCircle, Bold, Italic, Underline } from "lucide-react";
import { useProfile } from "@hooks/useProfile.js";
import { fetchAuth } from "@/api/fetchAuth.js";
import { searchSuggestions, tmdbImg } from "@services/tmdb.js";
import GridBackground from "@components/layout/GridBackground.jsx";

// ─── Constantes ───────────────────────────────────────────────────────────────

const FALLBACK_AVATAR  = "https://placehold.co/120x120/252729/orange?text=?&font=montserrat";
const NOMINATIM_URL    = "https://nominatim.openstreetmap.org/search";

// ─── Hook : debounce ──────────────────────────────────────────────────────────

function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

// ─── Sous-composant : Section card ───────────────────────────────────────────

function Section({ icon: Icon, title, children }) {
    return (
        <div className="rounded-2xl"
             style={{
                 background: "oklch(from var(--color-base-300) l c h / 0.85)",
                 backdropFilter: "blur(24px)",
                 border: "1px solid oklch(from var(--color-primary) l c h / 0.15)",
                 boxShadow: "0 0 32px oklch(from var(--color-primary) l c h / 0.04)",
             }}>
            <div className="flex items-center gap-2.5 px-5 py-3.5"
                 style={{ borderBottom: "1px solid oklch(from var(--color-primary) l c h / 0.1)", background: "oklch(from var(--color-primary) l c h / 0.04)" }}>
                <Icon size={14} className="text-primary" />
                <span className="text-[11px] font-black tracking-widest uppercase text-primary">{title}</span>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

// ─── Sous-composant : champ texte stylé ──────────────────────────────────────

function Field({ label, hint, error, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">{label}</label>}
            {children}
            {hint  && !error && <p className="text-[11px] text-base-content/40">{hint}</p>}
            {error && <p className="text-[11px] text-error flex items-center gap-1"><AlertCircle size={10} />{error}</p>}
        </div>
    );
}

// ─── Statut API ───────────────────────────────────────────────────────────────

function ApiStatus({ label, status }) {
    if (!status) return null;
    return (
        <div className="flex items-center gap-1.5 mt-1">
            {status === "checking" && <Loader2 size={10} className="animate-spin text-base-content/40" />}
            {status === "ok"       && <span className="w-2 h-2 rounded-full bg-success inline-block" style={{ boxShadow: "0 0 6px oklch(from var(--color-success) l c h / 0.7)" }} />}
            {status === "error"    && <span className="w-2 h-2 rounded-full bg-error inline-block" />}
            <span className={`text-[11px] font-medium ${
                status === "ok"      ? "text-success" :
                    status === "error"   ? "text-error" :
                        "text-base-content/40"
            }`}>
                {label} — {
                status === "checking" ? "vérification…" :
                    status === "ok"       ? "API connectée ✓" :
                        "API inaccessible"
            }
            </span>
        </div>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function EditProfilePage() {
    const navigate = useNavigate();
    const { profile, loading: profileLoading } = useProfile();

    // ── État du formulaire ──────────────────────────────────────────────────
    const [avatar,         setAvatar]         = useState("");
    const [bio,            setBio]            = useState("");
    const [locationQ,      setLocationQ]      = useState("");
    const [location,       setLocation]       = useState("");
    const [countryCode,    setCountryCode]    = useState("");
    const [banner,         setBanner]         = useState("");
    const [bannerPosition, setBannerPosition] = useState(50); // 0-100, vertical %

    // ── Recherche localisation ──────────────────────────────────────────────
    const [locSuggestions, setLocSuggestions] = useState([]);
    const [locLoading,     setLocLoading]     = useState(false);
    const [locOpen,        setLocOpen]        = useState(false);
    const [nominatimStatus, setNominatimStatus] = useState(null);
    const debouncedLoc = useDebounce(locationQ, 500);
    const locWrapperRef = useRef(null);

    // ── Recherche œuvre de référence (backdrop) ─────────────────────────────
    const [mediaQ,           setMediaQ]           = useState("");
    const [mediaSuggestions, setMediaSuggestions] = useState([]);
    const [mediaLoading,     setMediaLoading]     = useState(false);
    const [selectedMedia,    setSelectedMedia]    = useState(null);
    const [tmdbStatus,       setTmdbStatus]       = useState(null);
    const debouncedMedia  = useDebounce(mediaQ, 400);
    const mediaWrapperRef = useRef(null);
    const mediaInputRef   = useRef(null);
    const mediaPortalRef  = useRef(null);
    const skipNextSearch  = useRef(false);
    const [mediaDropPos,  setMediaDropPos] = useState(null);

    // ── Sauvegarde ──────────────────────────────────────────────────────────
    const [saving,     setSaving]     = useState(false);
    const [saveError,  setSaveError]  = useState(null);
    const [saveOk,     setSaveOk]     = useState(false);
    const [avatarError, setAvatarError] = useState(null);

    // ── Textarea ref pour la bio (formatting) ──────────────────────────────
    const bioRef = useRef(null);

    // Pré-remplir depuis le profil chargé
    useEffect(() => {
        if (!profile || profileLoading) return;
        setAvatar(profile.avatar ?? "");
        setBio(profile.bio ?? "");
        setLocationQ(profile.location ?? "");
        setLocation(profile.location ?? "");
        setCountryCode(profile.countryCode ?? "");
        setBanner(profile.banner ?? "");
        setBannerPosition(profile.bannerPosition ?? 50);
    }, [profile?.username, profileLoading]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Fermer dropdowns au clic extérieur ─────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (locWrapperRef.current && !locWrapperRef.current.contains(e.target)) {
                setLocOpen(false);
            }
            if (mediaWrapperRef.current && !mediaWrapperRef.current.contains(e.target)
                && mediaPortalRef.current && !mediaPortalRef.current.contains(e.target)) {
                setMediaSuggestions([]);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // ── Recherche ville Nominatim ───────────────────────────────────────────
    useEffect(() => {
        if (!debouncedLoc || debouncedLoc.length < 2) {
            setLocSuggestions([]);
            setLocOpen(false);
            return;
        }
        if (debouncedLoc === location && location !== "") return;

        setLocLoading(true);
        setNominatimStatus("checking");
        fetch(`${NOMINATIM_URL}?q=${encodeURIComponent(debouncedLoc)}&format=json&limit=6&addressdetails=1&accept-language=fr`)
            .then(r => {
                if (!r.ok) throw new Error(`Nominatim ${r.status}`);
                return r.json();
            })
            .then(data => {
                setNominatimStatus("ok");
                const suggestions = data.map(item => ({
                    label:       item.display_name,
                    city:        item.address?.city ?? item.address?.town ?? item.address?.village ?? item.address?.county ?? item.display_name.split(",")[0],
                    country:     item.address?.country ?? "",
                    countryCode: (item.address?.country_code ?? "").toLowerCase(),
                }));
                setLocSuggestions(suggestions);
                setTimeout(() => setLocOpen(suggestions.length > 0), 0);
            })
            .catch((e) => {
                console.error("Nominatim error:", e);
                setNominatimStatus("error");
                setLocSuggestions([]);
                setLocOpen(false);
            })
            .finally(() => setLocLoading(false));
    }, [debouncedLoc]); // eslint-disable-line react-hooks/exhaustive-deps

    const pickLocation = (s) => {
        const label = `${s.city}${s.country ? ", " + s.country : ""}`;
        setLocation(label);
        setLocationQ(label);
        setCountryCode(s.countryCode);
        setLocSuggestions([]);
        setLocOpen(false);
    };

    // ── Position du portal media (recalculée à chaque ouverture) ──────────────
    useEffect(() => {
        if (mediaSuggestions.length > 0 && mediaInputRef.current) {
            const rect = mediaInputRef.current.getBoundingClientRect();
            setMediaDropPos({
                top:   rect.bottom + window.scrollY + 4,
                left:  rect.left   + window.scrollX,
                width: rect.width,
            });
        }
    }, [mediaSuggestions]);

    // ── Recherche TMDB backdrop ─────────────────────────────────────────────
    useEffect(() => {
        if (!debouncedMedia || debouncedMedia.length < 2) {
            setMediaSuggestions([]);
            return;
        }
        if (skipNextSearch.current) {
            skipNextSearch.current = false;
            return;
        }
        setMediaLoading(true);
        setTmdbStatus("checking");
        searchSuggestions(debouncedMedia, 6)
            .then(results => {
                setTmdbStatus("ok");
                setMediaSuggestions(results);
            })
            .catch(() => {
                setTmdbStatus("error");
                setMediaSuggestions([]);
            })
            .finally(() => setMediaLoading(false));
    }, [debouncedMedia]);

    const pickMedia = async (item) => {
        setMediaSuggestions([]);
        skipNextSearch.current = true;
        setMediaQ(item.title);
        setTmdbStatus("checking");
        try {
            const endpoint = item.tmdbType === "tv"
                ? `https://api.themoviedb.org/3/tv/${item.id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=fr-FR`
                : `https://api.themoviedb.org/3/movie/${item.id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=fr-FR`;
            const res  = await fetch(endpoint);
            const data = await res.json();
            const url  = data.backdrop_path ? tmdbImg(data.backdrop_path, "w1280") : null;
            setTmdbStatus("ok");
            setSelectedMedia({ title: item.title, backdropUrl: url, poster: item.poster });
            if (url) {
                setBanner(url);
                setBannerPosition(50); // reset au centre pour chaque nouvelle bannière
            }
        } catch {
            setTmdbStatus("error");
            setSelectedMedia({ title: item.title, backdropUrl: null, poster: item.poster });
        }
    };

    const clearMedia = () => {
        setSelectedMedia(null);
        setMediaQ("");
        setMediaSuggestions([]);
        setBanner(profile?.banner ?? "");
        setBannerPosition(profile?.bannerPosition ?? 50);
    };

    // ── Formatting bio ──────────────────────────────────────────────────────
    const applyFormat = (tag) => {
        const ta = bioRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end   = ta.selectionEnd;
        if (start === end) return;
        const selected = bio.slice(start, end);
        const before   = bio.slice(0, start);
        const after    = bio.slice(end);
        const markers  = { bold: "**", italic: "_", underline: "__" };
        const m        = markers[tag];
        const newBio   = `${before}${m}${selected}${m}${after}`;
        setBio(newBio.slice(0, 300));
        requestAnimationFrame(() => {
            ta.focus();
            ta.setSelectionRange(start + m.length, end + m.length);
        });
    };

    // ── Validation avatar URL ───────────────────────────────────────────────
    const validateAvatar = (url) => {
        if (!url || url.trim() === "") { setAvatarError(null); return true; }
        if (!url.startsWith("https://")) { setAvatarError("L'URL doit commencer par https://"); return false; }
        if (url.toLowerCase().includes("javascript:") || url.toLowerCase().includes("data:")) {
            setAvatarError("URL non autorisée"); return false;
        }
        setAvatarError(null);
        return true;
    };

    // ── Sauvegarde ──────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!validateAvatar(avatar)) return;
        setSaving(true);
        setSaveError(null);
        setSaveOk(false);
        try {
            await fetchAuth("/api/users/me", {
                method: "PUT",
                body: JSON.stringify({
                    avatar:         avatar.trim()   || null,
                    bio:            bio.trim()      || null,
                    location:       location.trim() || null,
                    countryCode:    countryCode     || null,
                    banner:         banner.trim()   || null,
                    bannerPosition: bannerPosition,
                }),
            });
            setSaveOk(true);
            setTimeout(() => navigate("/profil"), 1000);
        } catch (err) {
            setSaveError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // ── Label position bannière ─────────────────────────────────────────────
    const positionLabel = bannerPosition === 0   ? "Haut"
        : bannerPosition === 100 ? "Bas"
            : bannerPosition === 50  ? "Centre"
                : `${bannerPosition}%`;

    // ── Rendu ───────────────────────────────────────────────────────────────
    return (
        <>
            <style>{`
                @keyframes fadeUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
                .ep-in   { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
                .ep-in-2 { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) .08s both; }
                .ep-in-3 { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) .16s both; }
                .ep-in-4 { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) .24s both; }
            `}</style>

            <div className="relative min-h-screen bg-base-100 overflow-hidden">
                <GridBackground />

                <div className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
                     style={{ background: "radial-gradient(circle, oklch(from var(--color-secondary) l c h / 0.06) 0%, transparent 70%)" }} />

                <div className="relative z-10 max-w-2xl mx-auto px-5 lg:px-8 py-10">

                    {/* ── Header ── */}
                    <div className="ep-in flex items-center gap-4 mb-8">
                        <button onClick={() => navigate("/profil")}
                                className="btn btn-ghost btn-sm btn-circle"
                                aria-label="Retour">
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-base-content tracking-tight">Modifier le profil</h1>
                            <p className="text-xs text-base-content/40 mt-0.5">Les modifications sont visibles immédiatement.</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-5">

                        {/* ── Avatar ── */}
                        <div className="ep-in-2">
                            <Section icon={User} title="Photo de profil">
                                <div className="flex items-start gap-4">
                                    <div className="shrink-0 w-20 h-20 rounded-2xl overflow-hidden"
                                         style={{ border: "2px solid oklch(from var(--color-primary) l c h / 0.3)", boxShadow: "0 0 16px oklch(from var(--color-primary) l c h / 0.2)" }}>
                                        <img src={avatar || FALLBACK_AVATAR}
                                             alt="Avatar"
                                             onError={(e) => { e.target.src = FALLBACK_AVATAR; }}
                                             className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <Field
                                            label="URL de l'image"
                                            hint="Doit commencer par https://. L'image est hébergée externement."
                                            error={avatarError}>
                                            <input
                                                type="url"
                                                value={avatar}
                                                onChange={(e) => { setAvatar(e.target.value); validateAvatar(e.target.value); }}
                                                placeholder="https://exemple.com/mon-avatar.jpg"
                                                className="input input-bordered input-sm w-full text-sm"
                                            />
                                        </Field>
                                    </div>
                                </div>
                            </Section>
                        </div>

                        {/* ── Bio ── */}
                        <div className="ep-in-2">
                            <Section icon={FileText} title="Bio">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-1">
                                        {[
                                            { icon: Bold,      tag: "bold",      label: "Gras" },
                                            { icon: Italic,    tag: "italic",    label: "Italique" },
                                            { icon: Underline, tag: "underline", label: "Souligné" },
                                        ].map(({ icon: Icon, tag, label }) => (
                                            <button
                                                key={tag}
                                                type="button"
                                                title={label}
                                                onClick={() => applyFormat(tag)}
                                                className="btn btn-ghost btn-xs px-2 text-base-content/50 hover:text-primary transition-colors">
                                                <Icon size={13} />
                                            </button>
                                        ))}
                                        <span className="ml-auto text-[11px] text-base-content/30">{bio.length}/300</span>
                                    </div>
                                    <textarea
                                        ref={bioRef}
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value.slice(0, 300))}
                                        placeholder="Cinéphile depuis toujours, passionné de science-fiction et d'animation japonaise..."
                                        rows={3}
                                        className="textarea textarea-bordered w-full text-sm resize-none"
                                    />
                                    <p className="text-[11px] text-base-content/30 italic">
                                        Sélectionne du texte puis clique sur Gras, Italique ou Souligné pour le formater.
                                    </p>
                                </div>
                            </Section>
                        </div>

                        {/* ── Localisation ── */}
                        <div className="ep-in-3" style={{ position: "relative", zIndex: 20 }}>
                            <Section icon={MapPin} title="Localisation">
                                <div ref={locWrapperRef} className="relative">
                                    <Field label="Ville ou pays">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={locationQ}
                                                onChange={(e) => { setLocationQ(e.target.value); setLocation(""); setLocOpen(false); }}
                                                onFocus={() => locSuggestions.length > 0 && setLocOpen(true)}
                                                placeholder="Paris, Lyon, Tokyo..."
                                                className="input input-bordered input-sm w-full pr-8 text-sm"
                                            />
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                {locLoading
                                                    ? <Loader2 size={13} className="animate-spin text-base-content/30" />
                                                    : location && locationQ === location
                                                        ? <Check size={13} className="text-success" />
                                                        : <Search size={13} className="text-base-content/30" />
                                                }
                                            </div>
                                        </div>
                                    </Field>

                                    <ApiStatus label="Recherche OpenStreetMap" status={nominatimStatus} />

                                    {locOpen && locSuggestions.length > 0 && (
                                        <div className="absolute left-0 right-0 mt-1 rounded-xl overflow-hidden"
                                             style={{
                                                 top: "100%",
                                                 background: "oklch(from var(--color-base-300) l c h)",
                                                 border: "1px solid oklch(from var(--color-primary) l c h / 0.2)",
                                                 boxShadow: "0 8px 32px oklch(0% 0 0 / 0.4)",
                                             }}>
                                            {locSuggestions.map((s, i) => (
                                                <button key={i}
                                                        onClick={() => pickLocation(s)}
                                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/10 transition-colors border-b border-base-content/5 last:border-0 flex items-center gap-2">
                                                    {s.countryCode && (
                                                        <img src={`https://flagcdn.com/w20/${s.countryCode}.png`}
                                                             width="14" alt=""
                                                             className="rounded-sm shrink-0"
                                                             onError={(e) => { e.target.style.display = "none"; }} />
                                                    )}
                                                    <span className="font-medium text-base-content/80 truncate">{s.city}</span>
                                                    {s.country && <span className="text-base-content/40 text-xs shrink-0 ml-auto">{s.country}</span>}
                                                </button>
                                            ))}
                                            <button onClick={() => setLocOpen(false)}
                                                    className="w-full px-4 py-2 text-[11px] text-base-content/30 hover:text-base-content/50 transition-colors text-right">
                                                Fermer
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </Section>
                        </div>

                        {/* ── Bannière / Œuvre de référence ── */}
                        <div className="ep-in-4">
                            <Section icon={Image} title="Bannière de profil">
                                <div className="flex flex-col gap-4">

                                    {/* Preview bannière + slider */}
                                    {banner ? (
                                        <div className="flex flex-col gap-3">
                                            {/* Preview */}
                                            <div className="relative w-full h-28 rounded-xl overflow-hidden"
                                                 style={{ border: "1px solid oklch(from var(--color-primary) l c h / 0.2)" }}>
                                                <img src={banner} alt="Bannière"
                                                     className="w-full h-full object-cover"
                                                     style={{ objectPosition: `center ${bannerPosition}%` }} />
                                                <div className="absolute inset-0"
                                                     style={{ background: "linear-gradient(to top, oklch(from var(--color-base-100) l c h / 0.6) 0%, transparent 60%)" }} />
                                                {selectedMedia && (
                                                    <span className="absolute bottom-2 left-3 text-xs font-bold text-white/80">
                                                        {selectedMedia.title}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Slider position verticale */}
                                            <div className="flex flex-col gap-1.5 px-0.5">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
                                                        Position verticale
                                                    </label>
                                                    <span className="text-[11px] text-primary font-mono font-bold">
                                                        {positionLabel}
                                                    </span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min={0}
                                                    max={100}
                                                    step={1}
                                                    value={bannerPosition}
                                                    onChange={(e) => setBannerPosition(Number(e.target.value))}
                                                    className="range range-xs range-primary w-full"
                                                />
                                                <div className="flex justify-between text-[10px] text-base-content/30 select-none">
                                                    <span>Haut</span>
                                                    <span>Centre</span>
                                                    <span>Bas</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-20 rounded-xl flex items-center justify-center"
                                             style={{ background: "oklch(from var(--color-base-content) l c h / 0.04)", border: "1px dashed oklch(from var(--color-base-content) l c h / 0.1)" }}>
                                            <span className="text-xs text-base-content/30 italic">Aucune bannière définie</span>
                                        </div>
                                    )}

                                    {/* Recherche œuvre */}
                                    <Field label="Rechercher une œuvre" hint="Le backdrop TMDB sera utilisé comme bannière.">
                                        <div ref={mediaWrapperRef} className="relative">
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <input
                                                        ref={mediaInputRef}
                                                        type="text"
                                                        value={mediaQ}
                                                        onChange={(e) => setMediaQ(e.target.value)}
                                                        placeholder="Inception, Evangelion, Breaking Bad..."
                                                        className="input input-bordered input-sm w-full pr-8 text-sm"
                                                    />
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                        {mediaLoading
                                                            ? <Loader2 size={13} className="animate-spin text-base-content/30" />
                                                            : <Search size={13} className="text-base-content/30" />
                                                        }
                                                    </div>
                                                </div>
                                                {selectedMedia && (
                                                    <button onClick={clearMedia}
                                                            className="btn btn-ghost btn-sm btn-circle shrink-0">
                                                        <X size={14} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Dropdown résultats TMDB — portal vers body pour échapper overflow-hidden */}
                                            {mediaSuggestions.length > 0 && mediaDropPos && createPortal(
                                                <div ref={mediaPortalRef} style={{
                                                    position: "absolute",
                                                    top:      mediaDropPos.top,
                                                    left:     mediaDropPos.left,
                                                    width:    mediaDropPos.width,
                                                    zIndex:   9999,
                                                }}>
                                                    <div className="rounded-xl overflow-hidden"
                                                         style={{
                                                             background: "oklch(from var(--color-base-300) l c h)",
                                                             border: "1px solid oklch(from var(--color-secondary) l c h / 0.2)",
                                                             boxShadow: "0 8px 32px oklch(0% 0 0 / 0.4)",
                                                         }}>
                                                        {mediaSuggestions.map((item) => (
                                                            <button key={item.id}
                                                                    onClick={() => pickMedia(item)}
                                                                    className="w-full text-left px-3 py-2.5 hover:bg-secondary/10 transition-colors border-b border-base-content/5 last:border-0 flex items-center gap-3">
                                                                {item.poster
                                                                    ? <img src={item.poster} alt={item.title}
                                                                           className="w-8 h-12 object-cover rounded shrink-0" />
                                                                    : <div className="w-8 h-12 bg-base-content/10 rounded shrink-0" />
                                                                }
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-semibold text-base-content/90 truncate">{item.title}</p>
                                                                    <p className="text-[11px] text-base-content/40">{item.year} · {item.mediaType}</p>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>,
                                                document.body
                                            )}
                                        </div>
                                    </Field>

                                    {/* Statut TMDB */}
                                    <ApiStatus label="Backdrop TMDB" status={tmdbStatus} />

                                    {selectedMedia && !selectedMedia.backdropUrl && (
                                        <p className="text-[11px] text-warning flex items-center gap-1">
                                            <AlertCircle size={11} />
                                            Aucun backdrop disponible pour cette œuvre sur TMDB.
                                        </p>
                                    )}
                                </div>
                            </Section>
                        </div>

                        {/* ── Erreur / Succès ── */}
                        {saveError && (
                            <div className="alert alert-error text-sm py-2.5">
                                <AlertCircle size={15} />
                                {saveError}
                            </div>
                        )}
                        {saveOk && (
                            <div className="alert alert-success text-sm py-2.5">
                                <Check size={15} />
                                Profil mis à jour ! Redirection...
                            </div>
                        )}

                        {/* ── Actions ── */}
                        <div className="flex items-center justify-end gap-3 pt-2 pb-8">
                            <button onClick={() => navigate("/profil")}
                                    className="btn btn-ghost btn-sm font-semibold">
                                Annuler
                            </button>
                            <button onClick={handleSave}
                                    disabled={saving || !!avatarError}
                                    className="btn btn-secondary btn-sm font-bold tracking-wide min-w-28"
                                    style={{ boxShadow: "0 0 16px oklch(from var(--color-secondary) l c h / 0.3)" }}>
                                {saving
                                    ? <><Loader2 size={13} className="animate-spin" /> Sauvegarde...</>
                                    : saveOk
                                        ? <><Check size={13} /> Sauvegardé</>
                                        : "Sauvegarder"
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}