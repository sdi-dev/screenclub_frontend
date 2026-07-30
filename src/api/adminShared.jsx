// Constantes, helpers et hook partagés entre les pages du dashboard admin.
// Séparé de AdminLayout.jsx pour satisfaire react-refresh/only-export-components.

import { useState, useEffect, useCallback } from "react";
import {
    LayoutDashboard, Users, FileText, ShieldAlert, TrendingUp, ScrollText,
} from "lucide-react";

// ─── Navigation ───────────────────────────────────────────────────────────────

export const NAV_ITEMS = [
    { id: "dashboard",  label: "Accueil",             icon: LayoutDashboard, path: "/admin/dashboard" },
    { id: "users",      label: "Utilisateurs",         icon: Users,           path: "/admin/utilisateurs" },
    { id: "content",    label: "Contenus utilisateur", icon: FileText,        path: "/admin/contenus" },
    { id: "moderation", label: "Modération",            icon: ShieldAlert,     path: "/admin/moderation" },
    { id: "revenue",    label: "Revenus",               icon: TrendingUp,      path: "/admin/revenus" },
    { id: "logs",       label: "Logs",                  icon: ScrollText,      path: "/admin/logs" },
];

// ─── Constantes ───────────────────────────────────────────────────────────────

export const AVATAR_HUES = [75, 145, 25, 182, 55];

export const STATUT_USER_LABELS   = { ACTIF: "actif", INACTIF: "inactif", BANNI: "banni" };
export const STATUT_REPORT_LABELS = { EN_ATTENTE: "pending", RESOLU: "resolved", REJETE: "resolved" };

export const BADGE_STATUS = {
    actif:    "badge badge-success",
    banni:    "badge badge-error",
    inactif:  "badge badge-ghost",
    pending:  "badge badge-warning",
    resolved: "badge badge-success",
};

export const BADGE_STATUS_LABELS = {
    actif: "Actif", banni: "Banni", inactif: "Inactif", pending: "En attente", resolved: "Résolu",
};

// ─── Helper ───────────────────────────────────────────────────────────────────

export function formatDate(isoString) {
    if (!isoString) return "—";
    const [year, month, day] = isoString.split("-");
    return `${day}/${month}/${year}`;
}

// ─── Hook data async ──────────────────────────────────────────────────────────

export function useAdminData(fetcher) {
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setData(await fetcher());
        } catch (err) {
            setError(err.message ?? "Erreur inconnue.");
        } finally {
            setLoading(false);
        }
    }, [fetcher]);

    useEffect(() => { void load(); }, [load]);

    return { data, loading, error, reload: load };
}