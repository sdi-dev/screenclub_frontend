import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTheme } from "@hooks/useTheme.js";
import ScrollToTop from "@components/layout/ScrollToTop.jsx";
import Layout from "@components/layout/Layout.jsx";
import Home from "@pages/Home.jsx";
import NotFound from "@pages/NotFound.jsx";
import TopFilms from "@pages/rankings/TopFilms.jsx";
import TopAnimes from "@pages/rankings/TopAnimes.jsx";
import TopSeries from "@pages/rankings/TopSeries.jsx";
import TopAvis from "@pages/rankings/TopAvis.jsx";
import TopWatchlists from "@pages/rankings/TopWatchlists.jsx";
import ProfilePage from "@pages/ProfilePage.jsx";
import EditProfilePage from "@pages/EditProfilePage.jsx";
import MediaInfoPage from "@pages/MediaInfoPage.jsx";
import RecherchePage from "@pages/RecherchePage.jsx";
import MentionsLegales from "@pages/legal/MentionsLegales.jsx";
import Rgpd from "@pages/legal/RGPD.jsx";
import ConditionsGeneralesUtilisation from "@pages/legal/ConditionsGeneralesUtilisation.jsx";
import Confidentialite from "@pages/legal/Confidentialite.jsx";
import Tendances from "@pages/Tendances.jsx";

function App() {
    const themeCtx = useTheme();

    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<Layout themeCtx={themeCtx} />}>
                    <Route index element={<Home />} />
                    <Route path="/tendances" element={<Tendances />} />
                    <Route path="/topfilms" element={<TopFilms />} />
                    <Route path="/topseries" element={<TopSeries />} />
                    <Route path="/topanimes" element={<TopAnimes />} />
                    <Route path="/topavis" element={<TopAvis />} />
                    <Route path="/topwatchlists" element={<TopWatchlists />} />
                    <Route path="/profil" element={<ProfilePage />} />
                    <Route path="/profil/modifier" element={<EditProfilePage />} />
                    <Route path="/media/:type/:id" element={<MediaInfoPage />} />
                    <Route path="/recherche" element={<RecherchePage />} />
                    <Route path="/legal/mentions-legales" element={<MentionsLegales />} />
                    <Route path="/legal/rgpd" element={<Rgpd />} />
                    <Route path="/legal/cgu" element={<ConditionsGeneralesUtilisation />} />
                    <Route path="/legal/confidentialite" element={<Confidentialite />} />
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;