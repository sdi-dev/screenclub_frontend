import { fetchAuth } from "@/api/fetchAuth.js";

const BASE = import.meta.env.VITE_API_URL ?? "";

// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/watchlists
 * Crée une nouvelle watchlist pour l'utilisateur connecté.
 *
 * @param {{
 *   title:        string,
 *   description?: string,
 *   type:         "PUBLIC" | "PRIVATE",
 *   coverUrl:     string,
 *   mediaIds:     number[]
 * }} data
 * @returns {Promise<WatchlistDto>}
 */
export async function createWatchlist(data) {
    return fetchAuth(`${BASE}/api/watchlists`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

/**
 * GET /api/watchlists/me
 * Toutes les watchlists (publiques + privées) de l'utilisateur connecté.
 *
 * @returns {Promise<WatchlistDto[]>}
 */
export async function getMyWatchlists() {
    return fetchAuth(`${BASE}/api/watchlists/me`);
}

/**
 * GET /api/watchlists/me/public
 * Uniquement les watchlists PUBLIQUES de l'utilisateur connecté.
 *
 * @returns {Promise<WatchlistDto[]>}
 */
export async function getMyPublicWatchlists() {
    return fetchAuth(`${BASE}/api/watchlists/me/public`);
}

/**
 * GET /api/watchlists/public
 * Toutes les watchlists PUBLIQUES de la plateforme (sans auth).
 * → fetch natif : pas de token nécessaire.
 *
 * @returns {Promise<WatchlistDto[]>}
 */
export async function getAllPublicWatchlists() {
    const res = await fetch(`${BASE}/api/watchlists/public`);
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? body.title ?? `Erreur ${res.status}`);
    }
    return res.json();
}