import { useNavigate } from "react-router-dom";
import RankingMediaSection from "@components/ui/rankings/RankingMediaSection.jsx";

function Animes() {
    const navigate = useNavigate();

    return (
        <RankingMediaSection
            title="Top Animes"
            onItemClick={(anime) => navigate(`/animes/${anime.id}`)}
        />
    );
}

export default Animes;