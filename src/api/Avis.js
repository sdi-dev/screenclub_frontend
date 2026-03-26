import { fetchAuth } from "@/api/fetchAuth.js";

const BASE = import.meta.env.VITE_API_URL ?? "";

// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/avis
 * Crée ou modifie un avis sur un média.
 * Le back se charge de créer le Media en BDD si besoin (via TMDb).
 *
 * @param {{
 *   tmdbId:   number,
 *   tmdbType: "movie" | "tv",
 *   note:     number,        // 0 à 5
 *   avis?:    string | null
 * }} data
 * @returns {Promise<MediaNoteResponseDto>}
 */
export async function ajouterAvis(data) {
    return fetchAuth(`${BASE}/api/avis`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

/**
 * GET /api/avis/media/:mediaId
 * Tous les avis d'un média.
 *
 * @param {number} mediaId
 * @returns {Promise<MediaNoteResponseDto[]>}
 */
export async function getAvisByMedia(mediaId) {
    return fetchAuth(`${BASE}/api/avis/media/${mediaId}`);
}

/**
 * GET /api/avis/utilisateur/:utilisateurId
 * Tous les avis d'un utilisateur.
 *
 * @param {number} utilisateurId
 * @returns {Promise<MediaNoteResponseDto[]>}
 */
export async function getAvisByUtilisateur(utilisateurId) {
    return fetchAuth(`${BASE}/api/avis/utilisateur/${utilisateurId}`);
}

/**
 * GET /api/avis/tmdb/:tmdbId
 * Tous les avis d'un média via son tmdbId TMDB.
 * Endpoint public — pas de token JWT envoyé pour éviter un rejet du JwtAuthFilter
 * sur les sessions expirées ou non connectées.
 *
 * @param {number} tmdbId
 * @returns {Promise<MediaNoteResponseDto[]>}
 */
export async function getAvisByTmdbId(tmdbId) {
    const res = await fetch(`${BASE}/api/avis/tmdb/${tmdbId}`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Erreur ${res.status}`);
    return res.json();
}

/**
 * DELETE /api/avis/:avisId
 * Supprime un avis (seul son auteur peut le faire, vérifié côté Spring).
 *
 * @param {number} avisId
 * @returns {Promise<void>}
 */
export async function supprimerAvis(avisId) {
    return fetchAuth(`${BASE}/api/avis/${avisId}`, { method: "DELETE" });
}

/**
 * POST /api/avis/:avisId/like
 * Toggle like sur un avis (like si absent, unlike si présent).
 * Requiert d'être authentifié.
 *
 * @param {number} avisId
 * @returns {Promise<{ liked: boolean, likeCount: number }>}
 */
export async function toggleLikeAvis(avisId) {
    return fetchAuth(`${BASE}/api/avis/${avisId}/like`, { method: "POST" });
}