import { useParams, Navigate } from "react-router-dom";
import { getUser } from "@/api/auth.js";
import ProfilePage from "@pages/ProfilePage.jsx";

/**
 * PublicProfilePage — /profil/:userId
 *
 * Si l'ID dans l'URL correspond à l'utilisateur connecté,
 * on redirige vers /profil (la version "propre" avec bouton Modifier).
 * Sinon on affiche le profil public avec le bouton Suivre.
 */
export default function PublicProfilePage() {
    const { userId } = useParams();
    const jwtUser    = getUser();
    const numericId  = Number(userId);

    // Redirige vers /profil si c'est notre propre compte
    if (jwtUser?.id === numericId) {
        return <Navigate to="/profil" replace />;
    }

    return (
        <ProfilePage
            targetUserId={numericId}
            isOwnProfile={false}
        />
    );
}