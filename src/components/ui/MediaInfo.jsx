import { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";
import { getMediaFull, normalizeMedia } from "@services/tmdb.js";
import NoteModal           from "@components/ui/modales/NoteModal.jsx";
import CreateWatchlistModal from "@components/ui/modales/CreateWatchlistModal.jsx";
import AuthModal           from "@components/ui/modales/AuthModal.jsx";
import ReportModal         from "@components/ui/modales/ReportModal.jsx";
import ReviewCard          from "@components/ui/media/ReviewCard.jsx";
import {
    SectionTitle,
    CommunityRating,
    GenreBadge,
    TypePill,
    CastCard,
    PlatformBadge,
    TrailerButton,
    WatchlistsBlock,
    PageSkeleton,
    SimilarCarousel,
} from "@components/ui/media/MediaInfoComponents.jsx";
import { isConnected }                    from "@api/auth.js";
import { getAvisByTmdbId }                from "@api/Avis.js";
import { toggleFavori, getFavoriStatus }  from "@api/Favoris.js";
import koalaFallback from "@images/koala_win7.png";

const META_COLORS = ["text-primary/70", "text-secondary/70", "text-accent/70", "text-info/70"];

export default function MediaInfo({ id, type = "movie", onNavigate }) {

    // ── État principal ─────────────────────────────────────────────────────────
    const [media,   setMedia]   = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    // ── Onglets ────────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState("cast");

    // ── Avis ScreenClub ────────────────────────────────────────────────────────
    const [screenclubAvis, setScreenclubAvis] = useState([]);
    const [avisLoading,    setAvisLoading]    = useState(false);

    // ── Favoris ────────────────────────────────────────────────────────────────
    const [isFavori,      setIsFavori]      = useState(false);
    const [favoriLoading, setFavoriLoading] = useState(false);

    // ── Modales ────────────────────────────────────────────────────────────────
    const [noteOpen,      setNoteOpen]      = useState(false);
    const [watchlistOpen, setWatchlistOpen] = useState(false);
    const [authOpen,      setAuthOpen]      = useState(false);
    const [reportOpen,    setReportOpen]    = useState(false);
    const [reportTarget,  setReportTarget]  = useState(null);

    // ── Chargement du média ────────────────────────────────────────────────────
    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(null);
        setMedia(null);
        setActiveTab("cast");
        getMediaFull(id, type)
            .then((raw) => setMedia(normalizeMedia(raw, type)))
            .catch((e)  => setError(e.message))
            .finally(()  => setLoading(false));
    }, [id, type]);

    // ── Avis ScreenClub ────────────────────────────────────────────────────────
    const fetchAvis = useCallback(async () => {
        if (!id) return;
        setAvisLoading(true);
        try {
            const data = await getAvisByTmdbId(id);
            setScreenclubAvis(data ?? []);
        } catch {
            setScreenclubAvis([]);
        } finally {
            setAvisLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchAvis(); }, [fetchAvis]);

    // ── Statut favori ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!id || !isConnected()) return;
        getFavoriStatus(id, type)
            .then((data) => setIsFavori(data?.favori ?? false))
            .catch(() => setIsFavori(false));
    }, [id, type]);

    const handleToggleFavori = async () => {
        if (!isConnected()) { setAuthOpen(true); return; }
        setFavoriLoading(true);
        const prev = isFavori;
        setIsFavori(!prev);
        try {
            const data = await toggleFavori({ tmdbId: id, tmdbType: type });
            setIsFavori(data?.favori ?? !prev);
        } catch {
            setIsFavori(prev);
        } finally {
            setFavoriLoading(false);
        }
    };

    // ── Signalement ────────────────────────────────────────────────────────────
    const handleOpenReport = (avis) => {
        if (!isConnected()) { setAuthOpen(true); return; }
        setReportTarget({
            typeObjet: "AVIS",
            objetId:   avis.id,
            label:     `Critique de ${avis.pseudo}`,
        });
        setReportOpen(true);
    };

    // ── Gardes ────────────────────────────────────────────────────────────────
    if (loading) return <PageSkeleton />;
    if (error) return (
        <div className="min-h-screen bg-base-100 flex items-center justify-center">
            <div className="card bg-base-200 border border-error/30 p-8 text-center max-w-sm">
                <p className="text-error font-unbounded text-sm mb-2">Erreur de chargement</p>
                <p className="text-base-content/50 text-xs">{error}</p>
            </div>
        </div>
    );
    if (!media) return null;

    const mediaForModal = { tmdbId: media.tmdbId, tmdbType: type, title: media.title, posterUrl: media.poster };

    const metaItems = [
        { label: "Pays",   value: media.country  },
        { label: "Langue", value: media.language },
        ...(media.type === "tv"
                ? [
                    { label: "Saisons",  value: `${media.seasons} saison${media.seasons > 1 ? "s" : ""}` },
                    { label: "Épisodes", value: media.episodes },
                ]
                : [
                    { label: "Durée",  value: media.duration },
                    { label: "Sortie", value: media.year     },
                ]
        ),
    ];

    const TABS = [
        { key: "cast",       label: "Casting",                                    activeColor: "border-secondary text-secondary" },
        { key: "screenclub", label: `Avis (${screenclubAvis.length})`,            activeColor: "border-primary text-primary"     },
    ];

    return (
        <div className="min-h-screen bg-base-100 text-base-content">

            {/* ── BACKDROP ─────────────────────────────────────────────────── */}
            <div className="relative w-full h-[40vh] overflow-hidden">
                {media.backdrop ? (
                    <img
                        src={media.backdrop}
                        alt={`${media.title} backdrop`}
                        className="w-full h-full object-cover object-top"
                    />
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-base-300 to-base-200" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-base-100 via-base-100/30 to-transparent" />
                <div className="absolute inset-0 bg-linear-to-r from-base-100/70 via-transparent to-transparent" />
                <div className="absolute top-0 inset-x-0 px-6 py-4 flex justify-end">
                    <a
                        href={media.tmdbUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-xs btn-ghost opacity-40 hover:opacity-100 font-unbounded text-[10px]"
                    >
                        TMDB ↗
                    </a>
                </div>
            </div>

            {/* ── MAIN ─────────────────────────────────────────────────────── */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-24 relative z-10 pb-20">

                {/* Poster + Titre */}
                <div className="flex gap-6 sm:gap-10 items-end">
                    <div className="shrink-0 w-32 sm:w-44">
                        <div className="rounded-box overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/10">
                            <img
                                src={media.poster}
                                alt={media.title}
                                className="w-full aspect-2/3 object-cover"
                                onError={(e) => { e.target.src = koalaFallback; }}
                            />
                        </div>
                    </div>
                    <div className="flex-1 pb-2">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <TypePill type={media.type} />
                            {media.genres.slice(0, 3).map((g, i) => (
                                <GenreBadge key={g} label={g} index={i} />
                            ))}
                        </div>
                        <h1 className="font-unbounded font-black text-2xl sm:text-4xl leading-tight text-base-content mb-1">
                            {media.title}
                        </h1>
                        {media.originalTitle !== media.title && (
                            <p className="text-xs text-base-content/30 font-unbounded mb-1">{media.originalTitle}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-base-content/50 font-unbounded mt-2">
                            <span className="text-primary font-bold">{media.year}</span>
                            <span className="w-px h-3 bg-base-content/20" />
                            <span>{media.duration}</span>
                            {media.type === "tv" && media.status && (
                                <>
                                    <span className="w-px h-3 bg-base-content/20" />
                                    <span className={`badge badge-sm font-unbounded text-[9px] tracking-wide ${
                                        media.status === "Ended"
                                            ? "badge-error/20 border border-error/40 text-error"
                                            : "badge-success/20 border border-success/40 text-success"
                                    }`}>
                                        {media.status === "Ended" ? "Terminée" : "En cours"}
                                    </span>
                                </>
                            )}
                        </div>
                        <p className="text-xs text-base-content/40 mt-1">
                            {media.type === "tv" ? "Créé par" : "Réalisé par"}{" "}
                            <span className="text-accent font-semibold">{media.director}</span>
                        </p>
                        {media.type === "tv" && media.network && (
                            <p className="text-xs text-base-content/30 mt-0.5 font-unbounded">{media.network}</p>
                        )}
                    </div>
                </div>

                {/* Barre d'actions */}
                <div className="flex flex-wrap items-center justify-between gap-6 mt-8 py-5 border-y border-base-300">
                    <CommunityRating value={media.avgRating} totalRatings={media.totalRatings} />
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => isConnected() ? setNoteOpen(true) : setAuthOpen(true)}
                            className="btn btn-sm btn-primary gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            Laisser un avis
                        </button>
                        <button
                            onClick={handleToggleFavori}
                            disabled={favoriLoading}
                            title={isFavori ? "Retirer des favoris" : "Ajouter aux favoris"}
                            className="btn btn-sm btn-error gap-2 transition-all duration-200"
                        >
                            <Heart className={`w-4 h-4 transition-all duration-200 ${
                                isFavori ? "fill-current" : "fill-none"
                            } ${favoriLoading ? "animate-pulse" : ""}`} />
                            {isFavori ? "Favori" : "Favoris"}
                        </button>
                        <button
                            onClick={() => isConnected() ? setWatchlistOpen(true) : setAuthOpen(true)}
                            className="btn btn-sm btn-accent gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Créer une watchlist
                        </button>
                        <TrailerButton trailer={media.trailer} />
                    </div>
                </div>

                {/* Synopsis */}
                <div className="mt-8">
                    <SectionTitle color="text-base-content/50">Synopsis</SectionTitle>
                    <p className="text-base-content/80 leading-relaxed max-w-2xl text-sm sm:text-base">
                        {media.synopsis}
                    </p>
                </div>

                {/* Plateformes */}
                {media.platforms.length > 0 && (
                    <div className="mt-8">
                        <SectionTitle color="text-info">Où regarder (France)</SectionTitle>
                        <div className="flex flex-wrap gap-2">
                            {media.platforms.map((p) => <PlatformBadge key={p.name} platform={p} />)}
                        </div>
                    </div>
                )}

                {/* Méta grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                    {metaItems.map((item, i) => (
                        <div key={item.label} className="bg-base-200 rounded-box p-4 border border-base-300">
                            <p className={`text-[10px] font-unbounded font-semibold tracking-widest uppercase ${META_COLORS[i % META_COLORS.length]} mb-1`}>
                                {item.label}
                            </p>
                            <p className="font-semibold text-base-content text-sm">{item.value ?? "—"}</p>
                        </div>
                    ))}
                </div>

                {/* Onglets Casting / Avis TMDB / Avis ScreenClub */}
                <div className="mt-12">
                    <div className="flex gap-1 border-b border-base-300 mb-6">
                        {TABS.map(({ key, label, activeColor }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`font-unbounded text-[11px] uppercase tracking-widest px-4 py-2 border-b-2 transition-all duration-200 ${
                                    activeTab === key
                                        ? `${activeColor} font-semibold`
                                        : "border-transparent text-base-content/40 hover:text-base-content/70"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {activeTab === "cast" && (
                        media.cast.length > 0 ? (
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                                {media.cast.map((m) => <CastCard key={m.id} member={m} />)}
                            </div>
                        ) : (
                            <p className="text-base-content/30 text-sm font-unbounded">Aucun casting disponible.</p>
                        )
                    )}

                    {activeTab === "screenclub" && (
                        avisLoading ? (
                            <div className="flex justify-center py-8">
                                <span className="loading loading-spinner loading-md text-primary" />
                            </div>
                        ) : screenclubAvis.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {screenclubAvis.map((a, index) => (
                                    <ReviewCard
                                        key={a.id}
                                        index={index}
                                        review={{
                                            id:        a.id,
                                            user:      a.utilisateurPseudo,
                                            avatar:    a.utilisateurAvatar ?? "https://placehold.co/120x120/252729/orange?text=?&font=montserrat",
                                            date:      new Date(a.dateNote).toLocaleDateString("fr-FR"),
                                            rating:    a.note,
                                            text:      a.avis ?? "",
                                            likeCount: a.likeCount ?? 0,
                                        }}
                                        onReport={() => handleOpenReport(a)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-base-content/30 text-sm font-unbounded">
                                Aucun avis ScreenClub pour ce titre. Sois le premier !
                            </p>
                        )
                    )}
                </div>

                {/* Watchlists */}
                <WatchlistsBlock />

                {/* Similaires */}
                {media.similar.length > 0 && (
                    <div className="mt-14">
                        <SectionTitle color="text-secondary">Dans le même genre</SectionTitle>
                        <SimilarCarousel films={media.similar} onNavigate={onNavigate} />
                    </div>
                )}
            </div>

            {/* ── MODALES ──────────────────────────────────────────────────── */}
            <NoteModal
                isOpen={noteOpen}
                onClose={() => setNoteOpen(false)}
                onSuccess={() => { fetchAvis(); setActiveTab("screenclub"); }}
                media={mediaForModal}
            />
            <CreateWatchlistModal
                isOpen={watchlistOpen}
                onClose={() => setWatchlistOpen(false)}
                initialMedia={mediaForModal}
            />
            <AuthModal
                isOpen={authOpen}
                onClose={() => setAuthOpen(false)}
            />
            <ReportModal
                isOpen={reportOpen}
                onClose={() => { setReportOpen(false); setReportTarget(null); }}
                target={reportTarget}
            />
        </div>
    );
}