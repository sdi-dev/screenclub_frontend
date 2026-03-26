import { fetchAuth } from "@api/fetchAuth.js";

/**
 * GET /api/likes/status?tmdbId=&tmdbType=
 * Le backend lit l'utilisateurId depuis le JWT (Bearer injecté par fetchAuth).
 *
 * @param {number} tmdbId
 * @param {string} tmdbType - "movie" | "tv"
 * @returns {Promise<{ favori: boolean }>}
 */
export async function getFavoriStatus(tmdbId, tmdbType) {
    const params = new URLSearchParams({ tmdbId, tmdbType });
    return fetchAuth(`/api/likes/status?${params}`);
}

/**
 * POST /api/likes/toggle
 * Le backend lit l'utilisateurId depuis le JWT (Bearer injecté par fetchAuth).
 *
 * @param {{ tmdbId: number, tmdbType: string }} param
 * @returns {Promise<{ favori: boolean }>}
 */
export async function toggleFavori({ tmdbId, tmdbType }) {
    return fetchAuth("/api/likes/toggle", {
        method: "POST",
        body: JSON.stringify({ tmdbId, tmdbType }),
    });
}