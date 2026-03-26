import { useState, useEffect } from "react";
import { getUser } from "@/api/auth.js";
import { fetchAuth } from "@/api/fetchAuth.js";

// ─── Valeurs par défaut (en attendant l'API ou si un champ est absent) ────────

const DEFAULT_STATS   = { films: 0, thisYear: 0, lists: 0, following: 0, followers: 0 };
const DEFAULT_WATCHLIST = { count: 0, posters: [] };

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Récupère toutes les données du profil de l'utilisateur connecté.
 *
 * Endpoints attendus (à adapter à ton back Spring) :
 *   GET /api/users/me           → { pseudo, email, avatar, bio, location, countryCode, level, title, banner }
 *   GET /api/users/me/stats     → { films, thisYear, lists, following, followers }
 *   GET /api/users/me/favorites → [{ id, tmdbId, mediaTitle }]  (notes >= 4)
 *   GET /api/users/me/activity  → [{ type, id, tmdbId?, mediaTitle?, title?, note?, coverUrl? }]  (<7j)
 *   GET /api/users/me/watchlist → { count, posters: [url, ...] }
 *   GET /api/users/me/diary     → [{ month, day, title, rating }]
 */
export function useProfile() {
    // Données immédiates issues du JWT (pas d'appel réseau)
    const jwtUser = getUser();

    const [profile,        setProfile]        = useState(null);
    const [stats,          setStats]          = useState(DEFAULT_STATS);
    const [favoriteFilms,  setFavoriteFilms]  = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [watchlist,      setWatchlist]      = useState(DEFAULT_WATCHLIST);
    const [diary,          setDiary]          = useState([]);
    const [loading,        setLoading]        = useState(true);
    const [error,          setError]          = useState(null);

    useEffect(() => {
        if (!jwtUser?.id) {
            setLoading(false);
            return;
        }

        const load = async () => {
            try {
                // Lance tous les appels en parallèle pour minimiser le temps d'attente
                const [profileData, statsData, favData, activityData, watchlistData, diaryData] =
                    await Promise.allSettled([
                        fetchAuth("/api/users/me"),
                        fetchAuth("/api/users/me/stats"),
                        fetchAuth("/api/users/me/favorites"),
                        fetchAuth("/api/users/me/activity"),
                        fetchAuth("/api/users/me/watchlist"),
                        fetchAuth("/api/users/me/diary"),
                    ]);

                // Chaque requête est traitée indépendamment :
                // si l'une échoue, les autres s'affichent quand même.
                if (profileData.status === "fulfilled")   setProfile(profileData.value);
                if (statsData.status    === "fulfilled")   setStats({ ...DEFAULT_STATS, ...statsData.value });
                if (favData.status === "fulfilled") {
                    setFavoriteFilms((favData.value ?? []).map(f => ({
                        id:       f.id,
                        tmdbId:   f.tmdbId   ?? null,
                        title:    f.mediaTitle ?? f.title ?? "",
                        tmdbType: f.tmdbType  ?? "movie",
                    })));
                }
                if (activityData.status === "fulfilled") {
                    const raw = activityData.value ?? [];
                    setRecentActivity(raw.map(a => ({
                        id:       a.id,
                        type:     a.type     ?? "avis",
                        title:    a.type === "watchlist" ? a.title : a.mediaTitle,
                        tmdbId:   a.tmdbId   ?? null,
                        tmdbType: a.tmdbType ?? "movie",
                        rating:   a.note     ?? null,
                        coverUrl: a.coverUrl ?? null,
                    })));
                }
                if (watchlistData.status === "fulfilled")  setWatchlist({ ...DEFAULT_WATCHLIST, ...watchlistData.value });
                if (diaryData.status    === "fulfilled")   setDiary(diaryData.value ?? []);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jwtUser?.id]);

    // Fusionne les données JWT (disponibles immédiatement) avec celles de l'API
    const mergedProfile = {
        username:    profile?.pseudo      ?? jwtUser?.username ?? "Utilisateur",
        handle:      `@${profile?.pseudo  ?? jwtUser?.username ?? "utilisateur"}`,
        bio:         profile?.bio         ?? "",
        location:    profile?.location    ?? "",
        countryCode: profile?.countryCode ?? "",
        level:       profile?.level       ?? 1,
        title:       profile?.title       ?? "",
        banner:         profile?.banner         ?? null,
        bannerPosition: profile?.bannerPosition ?? 50,
        avatar:      profile?.avatar      ?? jwtUser?.avatar ?? null,
        email:       profile?.email       ?? jwtUser?.email  ?? "",
        id:          jwtUser?.id          ?? null,
    };

    return {
        profile:       mergedProfile,
        stats,
        favoriteFilms,
        recentActivity,
        watchlist,
        diary,
        loading,
        error,
        /** true si on a au moins les données JWT, même avant la réponse API */
        hasBaseData:   !!jwtUser,
    };
}