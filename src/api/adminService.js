// src/api/adminService.js

const BASE = import.meta.env.VITE_API_URL ?? "";

/**
 * Récupère le token JWT depuis le localStorage.
 * Note : migration vers cookie HttpOnly prévue — isolée ici pour ne changer
 * qu'un seul endroit lors de la migration.
 */
function getAuthHeader() {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Non authentifié.");
    return { Authorization: `Bearer ${token}` };
}

/**
 * Wrapper fetch admin : injecte le token et normalise les erreurs.
 * Toutes les routes admin renvoient 403 si le rôle est insuffisant —
 * Spring Security le garantit, on propage l'erreur proprement.
 */
async function adminFetch(endpoint, options = {}) {
    let res;
    try {
        res = await fetch(`${BASE}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader(),
                ...options.headers,
            },
        });
    } catch {
        throw new Error("Impossible de contacter le serveur.");
    }

    if (res.status === 401) throw new Error("SESSION_EXPIRED");
    if (res.status === 403) throw new Error("FORBIDDEN");

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

// ─── Endpoints dashboard ──────────────────────────────────────────────────────

/** Statistiques globales : membres, critiques, watchlists, signalements en attente */
export async function fetchAdminStats() {
    return adminFetch("/api/admin/stats");
}

/** 10 derniers inscrits */
export async function fetchRecentUsers() {
    return adminFetch("/api/admin/users/recent");
}

/** 10 signalements les plus récents */
export async function fetchRecentReports() {
    return adminFetch("/api/admin/reports/recent");
}

/** 10 derniers avis + watchlists fusionnés et triés */
export async function fetchRecentActivity() {
    return adminFetch("/api/admin/activity/recent");
}
// ─── Endpoints utilisateurs ───────────────────────────────────────────────────

/** Liste complète des membres (paginée côté back) */
export async function fetchAllUsers(page = 0, size = 20, statut = "") {
    const params = new URLSearchParams({ page, size });
    if (statut) params.set("statut", statut);
    return adminFetch(`/api/admin/users?${params}`);
}

/** Statistiques agrégées des comptes : actifs, bannis, inactifs, nouveaux ce mois */
export async function fetchUserStats() {
    return adminFetch("/api/admin/users/stats");
}