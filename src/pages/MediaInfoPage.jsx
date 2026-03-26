import { useParams, useNavigate } from "react-router-dom";
import MediaInfo from "@components/ui/MediaInfo.jsx";

/**
 * Page wrapper pour React Router.
 *
 * URL attendue : /media/:type/:id
 *   - type : "movie" | "tv"  (les animés sont "tv" côté TMDB)
 *   - id   : identifiant TMDB numérique
 *
 * Exemples :
 *   /media/movie/550     → Fight Club
 *   /media/tv/1396       → Breaking Bad
 *   /media/tv/37854      → One Piece  (animé, type "tv" sur TMDB)
 */
export default function MediaInfoPage() {
    const { type, id } = useParams();
    const navigate     = useNavigate();

    const parsedId  = parseInt(id, 10);
    const validType = type === "movie" || type === "tv" ? type : "movie";

    if (isNaN(parsedId)) {
        return (
            <div className="min-h-screen bg-base-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="font-unbounded text-error text-sm">ID invalide</p>
                    <button className="btn btn-sm btn-ghost mt-4" onClick={() => navigate(-1)}>
                        ← Retour
                    </button>
                </div>
            </div>
        );
    }

    return (
        <MediaInfo
            id={parsedId}
            type={validType}
            onNavigate={(newId, newType) => navigate(`/media/${newType}/${newId}`)}
        />
    );
}