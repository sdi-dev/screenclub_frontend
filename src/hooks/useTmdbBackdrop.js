// useTmdbBackdrop.js
import { useEffect, useState } from "react";
import { tmdbImg } from "@services/tmdb";

const API_KEY  = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = (import.meta.env.VITE_TMDB_BASE_URL ?? "https://api.themoviedb.org/3").replace(/\/$/, "");

/**
 * Taille TMDB à utiliser selon la largeur d'écran :
 *   < 1024px  → w1280  (tablette / mobile — déjà suffisant)
 *   ≥ 1024px  → original (desktop large — qualité max)
 */
function getBackdropSize() {
    return window.innerWidth >= 1024 ? "original" : "w1280";
}

/**
 * Fetch le backdrop d'un film ou d'une série.
 * Essaie /movie/ en premier, puis /tv/ en fallback si aucun backdrop trouvé.
 *
 * @param {number|string} tmdbId
 * @param {"movie"|"tv"|null} tmdbType  — optionnel, évite le double appel si connu
 */
async function fetchBackdrop(tmdbId, tmdbType = null) {
    const qs   = `api_key=${API_KEY}&language=fr-FR`;
    const size = getBackdropSize();

    // Si le type est connu, on fait un seul appel
    if (tmdbType === "tv") {
        const res  = await fetch(`${BASE_URL}/tv/${tmdbId}?${qs}`);
        const data = await res.json();
        return data.backdrop_path ? tmdbImg(data.backdrop_path, size) : null;
    }

    // Par défaut on essaie movie, fallback tv
    const res  = await fetch(`${BASE_URL}/movie/${tmdbId}?${qs}`);
    const data = await res.json();

    if (data.backdrop_path) return tmdbImg(data.backdrop_path, size);

    // Fallback TV (utile si le film favori est en réalité une série)
    const resTv  = await fetch(`${BASE_URL}/tv/${tmdbId}?${qs}`);
    const dataTv = await resTv.json();
    return dataTv.backdrop_path ? tmdbImg(dataTv.backdrop_path, size) : null;
}

/**
 * Hook useTmdbBackdrop
 *
 * @param {number|null} tmdbId
 * @param {"movie"|"tv"|null} tmdbType  — passe le type si tu l'as pour éviter un appel réseau inutile
 *
 * Usage :
 *   const backdrop = useTmdbBackdrop(tmdbId, tmdbType);
 *   const backdrop = useTmdbBackdrop(tmdbId);            // rétro-compatible
 */
export function useTmdbBackdrop(tmdbId, tmdbType = null) {
    const [backdrop, setBackdrop] = useState(null);

    useEffect(() => {
        if (!tmdbId) return;
        fetchBackdrop(tmdbId, tmdbType).then(setBackdrop).catch(() => setBackdrop(null));
    }, [tmdbId, tmdbType]);

    return backdrop;
}