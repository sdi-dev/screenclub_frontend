import { getToken } from "@/api/auth.js";

// ─── Utilitaire erreurs ───────────────────────────────────────────────────────

/**
 * Lit le corps d'une réponse en erreur et retourne un message lisible.
 * Gère :
 * - Problem Details RFC 9457 → body.detail
 * - Erreurs de validation Spring → map de champs concaténée
 * - Erreurs génériques → body.error / body.message
 * - Fallback → "Erreur {status}"
 */
async function parseErrorBody(res) {
    const contentType = res.headers.get("Content-Type") ?? "";

    if (contentType.includes("application/json")) {
        const body = await res.json().catch(() => ({}));

        if (body.detail)  return body.detail;
        if (body.error)   return body.error;
        if (body.message) return body.message;

        // Erreurs de validation Spring : { "champ": "message", ... }
        const messages = Object.values(body).filter(Boolean);
        return messages.join(" — ") || `Erreur ${res.status}`;
    }

    const text = await res.text().catch(() => "");
    return text.trim() || `Erreur ${res.status}`;
}

// ─── Fetch authentifié ────────────────────────────────────────────────────────

/**
 * Wrapper fetch qui injecte automatiquement le token JWT Bearer.
 * - 401 : supprime le token et redirige vers /login
 * - 204 : retourne null (pas de body)
 * - Autres erreurs HTTP : throw avec message lisible
 *
 * @param {string} url
 * @param {RequestInit} options
 * @returns {Promise<any>}
 */
export async function fetchAuth(url, options = {}) {
    const token = getToken();

    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    // Token expiré ou invalide
    if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
        return;
    }

    if (!response.ok) {
        throw new Error(await parseErrorBody(response));
    }

    // 204 No Content : pas de body JSON
    if (response.status === 204) return null;

    return response.json();
}