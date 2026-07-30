import { useState, useEffect, useCallback } from "react";

/**
 * Hook pour gérer le like/favori d'un média.
 *
 * @param {number} utilisateurId  - ID de l'utilisateur connecté (null si non connecté)
 * @param {number} tmdbId         - ID TMDB du média
 * @param {string} tmdbType       - "movie" | "tv"
 */
export function useMediaLike(utilisateurId, tmdbId, tmdbType) {
    const [favori,  setFavori]  = useState(false);
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(false); // évite un flash à l'init

    // Vérifie l'état initial au montage
    useEffect(() => {
        if (!utilisateurId || !tmdbId) return;

        const params = new URLSearchParams({ utilisateurId, tmdbId, tmdbType });
        fetch(`/api/likes/status?${params}`)
            .then((r) => r.json())
            .then((data) => {
                setFavori(data.favori);
                setChecked(true);
            })
            .catch(() => setChecked(true));
    }, [utilisateurId, tmdbId, tmdbType]);

    // Toggle favori
    const toggle = useCallback(async () => {
        if (!utilisateurId || loading) return;
        setLoading(true);
        try {
            const res  = await fetch("/api/likes/toggle", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ utilisateurId, tmdbId, tmdbType }),
            });
            const data = await res.json();
            setFavori(data.favori);
        } catch (err) {
            console.error("Erreur toggle favori :", err);
        } finally {
            setLoading(false);
        }
    }, [utilisateurId, tmdbId, tmdbType, loading]);

    return { favori, loading, checked, toggle };
}