import { useState, useEffect, useCallback } from "react";
import { getUser } from "@api/auth.js";
import { fetchAuth } from "@api/fetchAuth.js";

const API_BASE = "/api/follows";

/**
 * Hook useFollow
 *
 * Gère le bouton Follow/Unfollow sur le profil d'un utilisateur cible.
 *
 * @param {number|null} targetUserId  - ID du profil affiché (null si profil propre)
 * @param {boolean}     isOwnProfile  - true si c'est le profil de l'utilisateur connecté
 *
 * Usage :
 *   const { following, followersCount, followingCount, loading, toggling, toggle } = useFollow(userId, isOwnProfile);
 */
export function useFollow(targetUserId, isOwnProfile = false) {
    // On stocke l'id JWT dans un state : si getUser() renvoie null au premier
    // render (ex: localStorage pas encore lu), on initialise avec la valeur
    // synchrone et on ne dépend plus d'un appel externe non réactif.
    const [jwtUserId, setJwtUserId] = useState(() => getUser()?.id ?? null);

    const [following,      setFollowing]      = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [loading,        setLoading]        = useState(true);
    const [toggling,       setToggling]       = useState(false);

    // Garantit qu'on récupère bien l'id JWT même si localStorage était vide
    // au tout premier render (montage rapide avant hydratation complète).
    useEffect(() => {
        const id = getUser()?.id ?? null;
        if (id !== null) setJwtUserId(id);
    }, []);

    // L'id à utiliser pour charger les counts :
    // - own profile  → id de l'utilisateur connecté (JWT)
    // - autre profil → targetUserId
    const userId = isOwnProfile ? jwtUserId : targetUserId;

    // ── Chargement initial : compteurs + statut follow ────────────────────────
    useEffect(() => {
        if (!userId) return;

        let cancelled = false;
        setLoading(true);

        const fetchCounts = fetchAuth(`${API_BASE}/counts/${userId}`);

        // Statut follow uniquement si on regarde le profil d'un autre
        const fetchStatus = isOwnProfile
            ? Promise.resolve(null)
            : fetchAuth(`${API_BASE}/status/${targetUserId}`);

        Promise.all([fetchCounts, fetchStatus])
            .then(([counts, status]) => {
                if (cancelled) return;
                setFollowersCount(counts.followers ?? 0);
                setFollowingCount(counts.following  ?? 0);
                if (status) setFollowing(status.following ?? false);
            })
            .catch(console.error)
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [userId, targetUserId, isOwnProfile]);

    // ── Toggle follow/unfollow ─────────────────────────────────────────────────
    const toggle = useCallback(async () => {
        if (!targetUserId || toggling || isOwnProfile) return;

        setToggling(true);
        try {
            const data = await fetchAuth(`${API_BASE}/toggle/${targetUserId}`, {
                method: "POST",
            });

            setFollowing(data.following);
            if (data.followersCount != null) {
                setFollowersCount(data.followersCount);
            }
        } catch (err) {
            console.error("Erreur toggle follow :", err);
        } finally {
            setToggling(false);
        }
    }, [targetUserId, toggling, isOwnProfile]);

    return { following, followersCount, followingCount, loading, toggling, toggle };
}