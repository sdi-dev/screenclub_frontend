// src/api/reportService.js

const BASE = import.meta.env.VITE_API_URL ?? "";

function getAuthHeader() {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Non authentifié.");
    return { Authorization: `Bearer ${token}` };
}

/**
 * Soumet un signalement pour un avis ou une watchlist.
 *
 * @param {{ typeObjet: "AVIS"|"WATCHLIST", objetId: number, motif: string, message?: string }} payload
 * @returns {Promise<Object>}
 */
export async function soumettreSignalement(payload) {
    let res;
    try {
        res = await fetch(`${BASE}/api/reports`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader(),
            },
            body: JSON.stringify(payload),
        });
    } catch {
        throw new Error("Impossible de contacter le serveur.");
    }

    if (res.status === 409) {
        throw new Error("Vous avez déjà signalé ce contenu.");
    }

    if (!res.ok) {
        let message;
        try {
            const body = await res.json();
            message = body.message ?? `Erreur ${res.status}.`;
        } catch {
            message = `Erreur ${res.status} : ${res.statusText}`;
        }
        throw new Error(message);
    }

    return res.json();
}