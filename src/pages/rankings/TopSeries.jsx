import { useNavigate } from "react-router-dom";
import RankingMediaSection from "@components/ui/rankings/RankingMediaSection.jsx";

function TopSeries() {
    const navigate = useNavigate();

    return (
        <RankingMediaSection
            title="Top Series"
            onItemClick={(serie) => navigate(`/series/${serie.id}`)}
        />
    );
}

export default TopSeries;