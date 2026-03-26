const BASE = import.meta.env.VITE_API_URL ?? "";

/**
 * Recherche des médias (films, séries, animés) par titre.
 *
 * Le backend doit retourner un tableau d'objets avec au minimum :
 *   { id, title, type, posterUrl }
 *
 * @param {string} query
 * @returns {Promise<Array<{ id: number, title: string, type: string, posterUrl: string }>>}
 */
export async function searchMedias(query) {
    const params = new URLSearchParams({ q: query });
    const res = await fetch(`${BASE}/api/medias/search?${params}`, {
        credentials: "include",
    });

    if (!res.ok) throw new Error(`Erreur ${res.status}`);

    const data = await res.json();

    // TMDB retourne { results: [...] }
    return (data.results ?? [])
        .filter((r) => r.media_type === "movie" || r.media_type === "tv")
        .map((r) => ({
            tmdbId:   r.id,
            tmdbType: r.media_type,           // "movie" ou "tv"
            title:    r.title ?? r.name,       // film → title, série → name
            posterUrl: r.poster_path
                ? `https://image.tmdb.org/t/p/w200${r.poster_path}`
                : null,
            type: r.media_type === "movie" ? "FILM" : "SERIE",
        }));
}
/**
 * Récupère un média par son id.
 * @param {number} id
 */
export async function getMedia(id) {
    const res = await fetch(`${BASE}/api/medias/${id}`, {
        credentials: "include",
    });

    if (!res.ok) throw new Error(`Erreur ${res.status}`);
    return res.json();
}