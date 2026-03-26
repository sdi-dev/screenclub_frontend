import { useNavigate } from "react-router-dom";
import RankingMediaSection from "@components/ui/rankings/RankingMediaSection.jsx";

function TopFilms() {
    const navigate = useNavigate();

    return (
        <RankingMediaSection
            title="Top Films"
            onItemClick={(film) => navigate(`/film/${film.id}`)}
        />
    );
}

export default TopFilms;