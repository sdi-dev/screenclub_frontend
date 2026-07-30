import {BrowserRouter, Routes, Route} from "react-router-dom";
import {useTheme} from "@hooks/useTheme.js";
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
import PublicProfilPage from "@pages/PublicProfilPage.jsx";
import EditProfilePage from "@pages/EditProfilePage.jsx";
import MediaInfoPage from "@pages/MediaInfoPage.jsx";
import RecherchePage from "@pages/RecherchePage.jsx";
import MentionsLegales from "@pages/legal/MentionsLegales.jsx";
import Rgpd from "@pages/legal/RGPD.jsx";
import ConditionsGeneralesUtilisation from "@pages/legal/ConditionsGeneralesUtilisation.jsx";
import Confidentialite from "@pages/legal/Confidentialite.jsx";
import Tendances from "@pages/Tendances.jsx";
import Parametres from "@pages/Parametres.jsx";
import AdminDashboard from "@pages/admin/AdminDashboard.jsx";
import Timeline from "@pages/social/Timeline_v1.jsx";
import PrivateRoute from "@components/auth/PrivateRoute.jsx";
import {AuthProvider} from "@/context/AuthContext.jsx";
import AdminRoute from "@components/auth/AdminRoute.jsx";
import AdminUserPage from "@pages/admin/AdminUserPage.jsx";
import AdminContentPage from "@pages/admin/AdminContentPage.jsx";
import AdminModerationPage from "@pages/admin/AdminModerationPage.jsx";
import AdminLogsPage from "@pages/admin/AdminLogsPage.jsx";
import AdminRevenuePage from "@pages/admin/AdminRevenuePage.jsx";

function App() {
    const themeCtx = useTheme();

    return (
        <AuthProvider>
            <BrowserRouter>
                <ScrollToTop/>
                <Routes>

                    {/* Routes publiques, accessibles à tous les utilisateurs */}

                    <Route path="/" element={<Layout themeCtx={themeCtx}/>}>
                        <Route index element={<Home/>}/>
                        <Route path="/tendances" element={<Tendances/>}/>
                        <Route path="/topfilms" element={<TopFilms/>}/>
                        <Route path="/topseries" element={<TopSeries/>}/>
                        <Route path="/topanimes" element={<TopAnimes/>}/>
                        <Route path="/topavis" element={<TopAvis/>}/>
                        <Route path="/topwatchlists" element={<TopWatchlists/>}/>
                        <Route path="/profil/:userId" element={<PublicProfilPage/>}/>

                        {/* Routes profil, utilisateurs connectés uniquement */}

                        <Route path="/profil" element={
                            <PrivateRoute>
                                <ProfilePage/>
                            </PrivateRoute>
                        }/>

                        <Route path="/profil/modifier" element={
                            <PrivateRoute>
                                <EditProfilePage/>
                            </PrivateRoute>
                        }/>

                        <Route path="/parametres" element={
                            <PrivateRoute>
                                <Parametres/>
                            </PrivateRoute>
                        }/>

                        {/* Route Timeline, accueil des utilisateurs connectés */}

                        <Route path="/timeline" element={
                            <PrivateRoute>
                                <Timeline/>
                            </PrivateRoute>
                        }/>

                        <Route path="/media/:type/:id" element={<MediaInfoPage/>}/>
                        <Route path="/recherche" element={<RecherchePage/>}/>

                        {/* Routes des pages légales */}

                        <Route path="/legal/mentions-legales" element={<MentionsLegales/>}/>
                        <Route path="/legal/rgpd" element={<Rgpd/>}/>
                        <Route path="/legal/cgu" element={<ConditionsGeneralesUtilisation/>}/>
                        <Route path="/legal/confidentialite" element={<Confidentialite/>}/>
                    </Route>

                    {/* Routes Admin */}

                    <Route path="/admin/dashboard" element={
                        <AdminRoute>
                            <AdminDashboard/>
                        </AdminRoute>
                    }/>

                    <Route path="/admin/utilisateurs" element={
                        <AdminRoute>
                            <AdminUserPage/>
                        </AdminRoute>
                    }/>

                    <Route path="/admin/contenus" element={
                        <AdminRoute>
                            <AdminContentPage />
                        </AdminRoute>
                    }/>

                    <Route path="/admin/moderation" element={
                        <AdminRoute>
                            <AdminModerationPage/>
                        </AdminRoute>
                    }/>

                    <Route path="/admin/logs" element={
                        <AdminRoute>
                            <AdminLogsPage/>
                        </AdminRoute>
                    }/>

                    <Route path="/admin/revenus" element={
                        <AdminRoute>
                            <AdminRevenuePage />
                        </AdminRoute>
                    }/>

                    {/* Page 404 */}
                    <Route path="*" element={<NotFound/>}/>

                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;