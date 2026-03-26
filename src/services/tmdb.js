const API_KEY  = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = (import.meta.env.VITE_TMDB_BASE_URL ?? "https://api.themoviedb.org/3").replace(/\/$/, "");
const IMG_URL  = (import.meta.env.VITE_TMDB_IMAGE_URL ?? "https://image.tmdb.org/t/p").replace(/\/$/, "");

// ─── Images ────────────────────────────────────────────────────────────────
export const tmdbImg = (path, size = "w342") =>
    path ? `${IMG_URL}/${size}${path}` : null;

// ─── Helper interne ────────────────────────────────────────────────────────
// N'utilise PAS new URL() pour éviter les erreurs si BASE_URL est mal formé.
const get = async (endpoint, params = {}) => {
    const qs = new URLSearchParams({ api_key: API_KEY, language: "fr-FR", ...params }).toString();
    const res = await fetch(`${BASE_URL}${endpoint}?${qs}`);
    if (!res.ok) throw new Error(`TMDB ${res.status} – ${endpoint}`);
    return res.json();
};

// ─── Détection animé ───────────────────────────────────────────────────────
const isAnime = (item) =>
    (item.genre_ids?.includes(16) ?? false) &&
    (item.original_language === "ja" || item.origin_country?.includes("JP"));

// ─── Suggestions (dropdown header) ────────────────────────────────────────
/**
 * Recherche multi TMDB filtrée : movie + tv (animés détectés automatiquement).
 * Triés par popularité décroissante.
 */
export const searchSuggestions = async (query, limit = 8) => {
    if (!query?.trim()) return [];
    const data = await get("/search/multi", { query: query.trim(), include_adult: "false" });

    return (data.results ?? [])
        .filter((r) => r.media_type === "movie" || r.media_type === "tv")
        .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
        .slice(0, limit)
        .map((r) => {
            const isMovie     = r.media_type === "movie";
            const mediaType   = isAnime(r) ? "anime" : r.media_type;
            const releaseDate = isMovie ? r.release_date : r.first_air_date;
            return {
                id:         r.id,
                tmdbType:   r.media_type,
                mediaType,
                title:      isMovie ? r.title : r.name,
                year:       releaseDate?.slice(0, 4) ?? "—",
                poster:     tmdbImg(r.poster_path, "w92"),
                overview:   r.overview ?? "",
                popularity: r.popularity ?? 0,
                voteAvg:    r.vote_average ?? 0,
            };
        });
};

// ─── Recherche pleine page (plus de résultats + pagination) ───────────────
/**
 * Retourne une page de résultats + métadonnées de pagination.
 */
export const searchFull = async (query, page = 1) => {
    if (!query?.trim()) return { results: [], totalResults: 0, totalPages: 0, page: 1 };
    const data = await get("/search/multi", {
        query:         query.trim(),
        include_adult: "false",
        page,
    });

    const results = (data.results ?? [])
        .filter((r) => r.media_type === "movie" || r.media_type === "tv")
        .map((r) => {
            const isMovie     = r.media_type === "movie";
            const mediaType   = isAnime(r) ? "anime" : r.media_type;
            const releaseDate = isMovie ? r.release_date : r.first_air_date;
            return {
                id:         r.id,
                tmdbType:   r.media_type,
                mediaType,
                title:      isMovie ? r.title : r.name,
                year:       releaseDate?.slice(0, 4) ?? "—",
                poster:     tmdbImg(r.poster_path, "w342"),
                overview:   r.overview ?? "",
                popularity: r.popularity ?? 0,
                voteAvg:    r.vote_average ?? 0,
            };
        });

    return {
        results,
        totalResults: data.total_results ?? 0,
        totalPages:   Math.min(data.total_pages ?? 1, 20), // TMDB plafonne à 500 pages, on limite à 20
        page:         data.page ?? 1,
    };
};

// ─── Rétro-compatibilité ───────────────────────────────────────────────────
export const getMovieBackdrop = async (tmdbId) => {
    const data = await get(`/movie/${tmdbId}`);
    return data.backdrop_path ? tmdbImg(data.backdrop_path, "w1280") : null;
};

// ─── Film ──────────────────────────────────────────────────────────────────
export const getMovie          = (id) => get(`/movie/${id}`);
export const getMovieCredits   = (id) => get(`/movie/${id}/credits`);
export const getMovieReviews   = (id) => get(`/movie/${id}/reviews`);
export const getMovieSimilar   = (id) => get(`/movie/${id}/similar`);
export const getMovieVideos    = (id) => get(`/movie/${id}/videos`, { language: "fr-FR,en-US" });
export const getMovieProviders = (id) => get(`/movie/${id}/watch/providers`);

// ─── Série TV ──────────────────────────────────────────────────────────────
export const getTV             = (id) => get(`/tv/${id}`);
export const getTVCredits      = (id) => get(`/tv/${id}/credits`);
export const getTVReviews      = (id) => get(`/tv/${id}/reviews`);
export const getTVSimilar      = (id) => get(`/tv/${id}/similar`);
export const getTVVideos       = (id) => get(`/tv/${id}/videos`, { language: "fr-FR,en-US" });
export const getTVProviders    = (id) => get(`/tv/${id}/watch/providers`);

// ─── Agrégat universel ─────────────────────────────────────────────────────
export const getMediaFull = async (id, type = "movie") => {
    const m = type === "movie";
    const [details, credits, reviews, similar, videos, providers] = await Promise.all([
        m ? getMovie(id)           : getTV(id),
        m ? getMovieCredits(id)    : getTVCredits(id),
        m ? getMovieReviews(id)    : getTVReviews(id),
        m ? getMovieSimilar(id)    : getTVSimilar(id),
        m ? getMovieVideos(id)     : getTVVideos(id),
        m ? getMovieProviders(id)  : getTVProviders(id),
    ]);
    return { details, credits, reviews, similar, videos, providers };
};

// ─── Normalisation ─────────────────────────────────────────────────────────
export const normalizeMedia = ({ details, credits, reviews, similar, videos, providers }, type = "movie") => {
    const m             = type === "movie";
    const title         = m ? details.title          : details.name;
    const originalTitle = m ? details.original_title : details.original_name;
    const releaseDate   = m ? details.release_date   : details.first_air_date;
    const year          = releaseDate?.slice(0, 4) ?? "—";
    const runtime       = m ? details.runtime : details.episode_run_time?.[0] ?? null;
    const duration      = runtime
        ? `${Math.floor(runtime / 60)}h ${runtime % 60}m`
        : m ? "—" : `${details.number_of_seasons} saison(s)`;

    const cast = (credits.cast ?? []).slice(0, 12).map((p) => ({
        id:   p.id,
        name: p.name,
        role: p.character ?? "—",
        img:  tmdbImg(p.profile_path, "w185") ?? "https://placehold.co/80x80",
    }));

    const director = m
        ? (credits.crew ?? []).filter((c) => c.job === "Director").map((c) => c.name).join(", ") || "—"
        : (details.created_by ?? []).map((c) => c.name).join(", ") || "—";

    const reviewsList = (reviews.results ?? []).slice(0, 5).map((r) => ({
        user:   r.author,
        avatar: r.author_details?.avatar_path?.startsWith("/https")
            ? r.author_details.avatar_path.slice(1)
            : tmdbImg(r.author_details?.avatar_path, "w92") ?? "https://placehold.co/40x40",
        rating: r.author_details?.rating ? r.author_details.rating / 2 : null,
        date:   new Date(r.created_at).toLocaleDateString("fr-FR", { month: "short", year: "numeric" }),
        text:   r.content,
    }));

    const similarList = (similar.results ?? []).slice(0, 8).map((s) => ({
        id:     s.id,
        title:  m ? s.title : s.name,
        year:   (m ? s.release_date : s.first_air_date)?.slice(0, 4) ?? "—",
        img:    tmdbImg(s.poster_path, "w342") ?? "https://placehold.co/200x300",
        rating: Math.round((s.vote_average / 2) * 10) / 10,
        type,
    }));

    const trailer  = (videos.results ?? []).find((v) => v.site === "YouTube" && v.type === "Trailer");
    const watchFR  = providers.results?.FR?.flatrate ?? [];
    const platforms = watchFR.map((p) => ({ name: p.provider_name, logo: tmdbImg(p.logo_path, "w92") }));

    return {
        type,
        title,
        originalTitle,
        year,
        duration,
        synopsis:    details.overview || "Aucun synopsis disponible.",
        genres:      details.genres?.map((g) => g.name) ?? [],
        country:     details.production_countries?.[0]?.name ?? "—",
        language:    details.spoken_languages?.[0]?.name ?? "—",
        avgRating:   Math.round((details.vote_average / 2) * 10) / 10,
        totalRatings: details.vote_count >= 1000
            ? `${(details.vote_count / 1000).toFixed(1)}k`
            : String(details.vote_count ?? 0),
        poster:    tmdbImg(details.poster_path, "w342")  ?? "https://placehold.co/342x513",
        backdrop:  tmdbImg(details.backdrop_path, "w1280") ?? null,
        cast,
        director,
        reviews:   reviewsList,
        similar:   similarList,
        trailer,
        platforms,
        tmdbId:    details.id,
        tmdbUrl:   `https://www.themoviedb.org/${type}/${details.id}`,
        ...(!m ? {
            seasons:  details.number_of_seasons,
            episodes: details.number_of_episodes,
            status:   details.status,
            network:  details.networks?.[0]?.name ?? "—",
        } : {}),
    };
};