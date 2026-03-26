import { useEffect, useMemo, useState } from "react";
import { getMovie, getTV, tmdbImg } from "@services/tmdb";

/**
 * Résout les posters TMDB pour une liste d'items { tmdbId, tmdbType? }.
 * Si tmdbType === "tv", appelle directement /tv/{id}.
 * Sinon essaie /movie/{id} en premier, puis /tv/{id} en fallback.
 */
async function fetchPoster(tmdbId, tmdbType) {
    if (tmdbType === "tv") {
        try {
            const tv = await getTV(tmdbId);
            if (tv?.poster_path) return tmdbImg(tv.poster_path, "w342");
        } catch { /* série introuvable */ }
        return null;
    }

    // movie ou type inconnu → movie d'abord, TV en fallback
    try {
        const movie = await getMovie(tmdbId);
        if (movie?.poster_path) return tmdbImg(movie.poster_path, "w342");
    } catch { /* pas un film, on essaie TV */ }
    try {
        const tv = await getTV(tmdbId);
        if (tv?.poster_path) return tmdbImg(tv.poster_path, "w342");
    } catch { /* ni film ni série connue */ }
    return null;
}

export function useTmdbPosters(items) {
    const [posters, setPosters] = useState({});

    // Clé stable — invalide le cache si tmdbId ou tmdbType changent
    const tmdbKey = useMemo(
        () => (items ?? []).map((i) => `${i?.tmdbId ?? ""}-${i?.tmdbType ?? ""}`).join(","),
        [items]
    );

    useEffect(() => {
        const ids = (items ?? []).filter((i) => i?.tmdbId);
        if (!ids.length) return;

        let cancelled = false;

        const load = async () => {
            const results = await Promise.all(
                ids.map(async (item) => {
                    const url = await fetchPoster(item.tmdbId, item.tmdbType);
                    return url ? [item.tmdbId, url] : null;
                })
            );
            if (cancelled) return;

            const map = Object.fromEntries(results.filter(Boolean));
            if (Object.keys(map).length > 0) {
                setPosters((prev) => ({ ...prev, ...map }));
            }
        };

        load().catch((e) => console.error("Erreur chargement posters TMDB:", e));

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tmdbKey]);

    return posters;
}