import { useState, useEffect } from "react";
import { getUser } from "@/api/auth.js";
import { fetchAuth } from "@/api/fetchAuth.js";

// ─── Valeurs par défaut ───────────────────────────────────────────────────────

const DEFAULT_STATS     = { oeuvres: 0, thisYear: 0, lists: 0, following: 0, followers: 0 };
const DEFAULT_WATCHLIST = { count: 0, posters: [] };

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Récupère toutes les données d'un profil.
 *
 * @param {number|null} targetUserId
 *   - undefined / null → charge le profil du connecté  (/api/users/me/*)
 *   - un ID            → charge le profil public        (/api/users/{id}/*)
 *
 * Endpoints utilisés :
 *   /api/users/me/**       → profil propre (authentifié)
 *   /api/users/{id}/**     → profil public (sans auth)
 */
export function useProfile(targetUserId = null) {
    const jwtUser  = getUser();
    const isOwn    = !targetUserId;                          // true si profil propre
    const base     = isOwn ? "/api/users/me" : `/api/users/${targetUserId}`;
    const fetcher  = isOwn ? fetchAuth : publicFetch;        // auth uniquement pour /me

    const [profile,        setProfile]        = useState(null);
    const [stats,          setStats]          = useState(DEFAULT_STATS);
    const [favoriteMedias, setFavoriteMedias] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [watchlist,      setWatchlist]      = useState(DEFAULT_WATCHLIST);
    const [diary,          setDiary]          = useState([]);
    const [badges,         setBadges]         = useState([]);
    const [loading,        setLoading]        = useState(true);
    const [error,          setError]          = useState(null);

    // Recharge quand on change de profil cible
    const cacheKey = targetUserId ?? jwtUser?.id;

    useEffect(() => {
        // Sur /profil (profil propre), on a besoin du JWT
        if (isOwn && !jwtUser?.id) {
            setLoading(false);
            return;
        }
        // Sur /profil/:id (profil public), on a juste besoin d'un ID valide
        if (!isOwn && !targetUserId) {
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);

        // Réinitialise l'affichage entre deux profils
        setProfile(null);
        setStats(DEFAULT_STATS);
        setFavoriteMedias([]);
        setRecentActivity([]);
        setWatchlist(DEFAULT_WATCHLIST);
        setDiary([]);
        setBadges([]);

        const load = async () => {
            try {
                const [profileData, statsData, favData, activityData, watchlistData, diaryData] =
                    await Promise.allSettled([
                        fetcher(`${base}`),
                        fetcher(`${base}/stats`),
                        fetcher(`${base}/favorites`),
                        fetcher(`${base}/activity`),
                        fetcher(`${base}/watchlist`),
                        fetcher(`${base}/diary`),
                    ]);

                if (cancelled) return;

                if (profileData.status === "fulfilled") {
                    setProfile(profileData.value);
                    setBadges(profileData.value?.badges ?? []);
                }
                if (statsData.status   === "fulfilled")  setStats({ ...DEFAULT_STATS, ...statsData.value });

                if (favData.status === "fulfilled") {
                    setFavoriteMedias((favData.value ?? []).map(f => ({
                        id:       f.id,
                        tmdbId:   f.tmdbId    ?? null,
                        title:    f.mediaTitle ?? f.title ?? "",
                        tmdbType: f.tmdbType   ?? "movie",
                    })));
                }

                if (activityData.status === "fulfilled") {
                    setRecentActivity((activityData.value ?? []).map(a => ({
                        id:       a.id,
                        type:     a.type     ?? "avis",
                        title:    a.type === "watchlist" ? a.title : a.mediaTitle,
                        tmdbId:   a.tmdbId   ?? null,
                        tmdbType: a.tmdbType ?? "movie",
                        rating:   a.note     ?? null,
                        coverUrl: a.coverUrl ?? null,
                    })));
                }

                if (watchlistData.status === "fulfilled") setWatchlist({ ...DEFAULT_WATCHLIST, ...watchlistData.value });
                if (diaryData.status     === "fulfilled") setDiary(diaryData.value ?? []);

            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cacheKey]);

    // Fusionne les données API avec les données JWT (disponibles immédiatement)
    // Pour un profil tiers, pas de fallback JWT → affichage uniquement API.
    const mergedProfile = {
        username:       profile?.pseudo         ?? (isOwn ? jwtUser?.username : "Utilisateur"),
        handle:         `@${profile?.pseudo     ?? (isOwn ? jwtUser?.username : "utilisateur")}`,
        bio:            profile?.bio            ?? "",
        location:       profile?.location       ?? "",
        countryCode:    profile?.countryCode    ?? "",
        level:          profile?.level          ?? 1,
        title:          profile?.title          ?? "",
        banner:         profile?.banner         ?? null,
        bannerPosition: profile?.bannerPosition ?? 50,
        avatar:         profile?.avatar         ?? (isOwn ? jwtUser?.avatar : null),
        email:          profile?.email          ?? (isOwn ? jwtUser?.email  : ""),
        id:             profile?.id             ?? (isOwn ? jwtUser?.id     : targetUserId),
    };

    return {
        profile:     mergedProfile,
        stats,
        favoriteMedias,
        recentActivity,
        watchlist,
        diary,
        badges,
        loading,
        error,
        /** true si on a au moins les données minimales pour afficher le profil */
        hasBaseData: isOwn ? !!jwtUser : !!targetUserId,
    };
}

// ─── Fetch sans auth (profils publics) ───────────────────────────────────────

/**
 * Fetch simple sans header Authorization — pour les endpoints publics /api/users/{id}/*.
 */
async function publicFetch(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} sur ${url}`);
    return res.json();
}