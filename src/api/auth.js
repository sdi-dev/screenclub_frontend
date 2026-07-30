// ─── Utilitaire ──────────────────────────────────────────────────────────────

/**
 * Wrapper fetch qui distingue :
 * - erreur réseau (serveur éteint, pas de connexion) → message clair
 * - erreur HTTP (4xx, 5xx) → message du back
 */
async function apiFetch(endpoint, options = {}) {
    let res;
    try {
        res = await fetch(endpoint, {
            headers: { "Content-Type": "application/json" },
            ...options,
        });
    } catch {
        throw new Error(
            "Impossible de contacter le serveur. Vérifie ta connexion ou réessaie plus tard."
        );
    }

    if (!res.ok) {
        let message;
        try {
            const err = await res.json();
            message = err.message || err.error || `Erreur ${res.status}.`;
        } catch {
            message = `Erreur ${res.status} : ${res.statusText}`;
        }
        throw new Error(message);
    }

    return res.json();
}

// ─── Token ────────────────────────────────────────────────────────────────────

export function getToken() {
    return localStorage.getItem("token");
}

export function logout() {
    localStorage.removeItem("token");
}

export function isConnected() {
    return !!getToken();
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────

export async function login(email, password) {
    const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("token", data.token);
    return data;
}

export async function register(pseudo, email, password, birthDate) {
    return apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ pseudo, email, password, birthDate }),
    });
}

/**
 * Récupère les données de l'utilisateur connecté depuis le token JWT stocké.
 * Retourne null si non connecté ou token invalide.
 * @returns {{ id: number, username: string, email: string, avatar: string|null, role: string|null } | null}
 */
export function getUser() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        // Décode le payload JWT (base64url → JSON), sans vérification de signature
        const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        return {
            id:       payload.id != null ? Number(payload.id) : null,
            username: payload.pseudo ?? payload.username ?? payload.name ?? "Utilisateur", // claim "pseudo" dans le JWT Spring
            email:    payload.email ?? "",
            avatar:   payload.avatar ?? null,
            role:     payload.role ?? null, // "ADMIN" | "USER" | etc.
        };
    } catch {
        return null;
    }
}

/**
 * Vérifie si l'utilisateur connecté est administrateur.
 * @returns {boolean}
 */
export function isAdmin() {
    return getUser()?.role === "ADMIN";
}