import { Navigate } from "react-router-dom";
import { isAdmin, isConnected } from "@/api/auth.js";

function AdminRoute({ children }) {
    if (!isConnected()) return <Navigate to="/" replace />;
    if (!isAdmin()) return <Navigate to="/" replace />;
    return children;
}

export default AdminRoute;