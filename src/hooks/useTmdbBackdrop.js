// useTmdbBackdrop.js
import { useEffect, useState } from "react";
import { getMovieBackdrop } from "@services/tmdb";

export function useTmdbBackdrop(tmdbId) {
    const [backdrop, setBackdrop] = useState(null);

    useEffect(() => {
        if (!tmdbId) return;
        getMovieBackdrop(tmdbId).then(setBackdrop);
    }, [tmdbId]);

    return backdrop;
}