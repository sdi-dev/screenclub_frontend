import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, EyeOff, Trash2, Star, Search, X } from "lucide-react";
import { fetchRecentActivity } from "@api/adminService.js";
import { useAdminData, formatDate } from "@api/adminShared.jsx";
import AdminLayout, {
    Avatar, TypeBadge, ActionBtn,
    Card, CardHeader, Th, Td, SkeletonRow, ErrorRow,
} from "@components/layout/AdminLayout.jsx";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminContentPage() {
    const navigate = useNavigate();

    const activity = useAdminData(fetchRecentActivity);

    // Redirection session expirée
    const activityError = activity.error;
    useEffect(() => {
        if (activityError === "SESSION_EXPIRED") navigate("/");
    }, [activityError, navigate]);

    // ── Filtres (front uniquement — back pas encore prêt) ──
    const [search,     setSearch]     = useState("");
    const [activeType, setActiveType] = useState("tous"); // "tous" | "avis" | "watchlist"

    const filtered = useMemo(() => {
        if (!activity.data) return [];
        return activity.data.filter(item => {
            const matchType   = activeType === "tous" || item.type === activeType;
            const matchSearch = !search || item.auteur?.toLowerCase().includes(search.toLowerCase());
            return matchType && matchSearch;
        });
    }, [activity.data, search, activeType]);

    const avis       = filtered.filter(i => i.type === "avis");
    const watchlists = filtered.filter(i => i.type === "watchlist");

    const hasResults = filtered.length > 0;
    const isFiltered = search !== "" || activeType !== "tous";

    return (
        <AdminLayout activeId="content">

            {/* ── En-tête de page ── */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-xl font-black font-unbounded tracking-tight text-base-content">
                        Contenus utilisateur
                    </h2>
                    <p className="text-xs text-base-content/45 mt-0.5">
                        Avis et watchlists postés par les membres
                    </p>
                </div>

                {/* ── Barre de filtres ── */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Recherche par pseudo */}
                    <label className="input input-sm input-bordered flex items-center gap-2 w-48">
                        <Search size={13} className="text-base-content/40 shrink-0" />
                        <input
                            type="text"
                            placeholder="Rechercher un pseudo…"
                            className="grow text-xs font-sans"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="cursor-pointer text-base-content/30 hover:text-base-content/60 transition-colors">
                                <X size={12} />
                            </button>
                        )}
                    </label>

                    {/* Filtre type */}
                    {["tous", "avis", "watchlist"].map(t => (
                        <button
                            key={t}
                            onClick={() => setActiveType(t)}
                            className={`btn btn-xs font-unbounded capitalize ${activeType === t ? "btn-primary" : "btn-ghost border border-base-content/15"}`}
                        >
                            {t === "tous" ? "Tout" : t === "avis" ? "Avis" : "Watchlists"}
                        </button>
                    ))}

                    {/* Reset filtres */}
                    {isFiltered && (
                        <button
                            onClick={() => { setSearch(""); setActiveType("tous"); }}
                            className="btn btn-xs btn-ghost text-base-content/40 gap-1"
                        >
                            <X size={11} /> Réinitialiser
                        </button>
                    )}
                </div>
            </div>

            {/* Message si aucun résultat après filtrage */}
            {!activity.loading && !activity.error && isFiltered && !hasResults && (
                <div className="text-center py-10">
                    <p className="font-unbounded font-black text-sm text-base-content/30">Aucun résultat</p>
                    <p className="text-xs text-base-content/25 mt-1">Essayez un autre pseudo ou type de contenu</p>
                </div>
            )}

            {/* ── Tableau Avis ── */}
            {(activeType === "tous" || activeType === "avis") && (
                <Card>
                    <CardHeader
                        title={`Derniers avis${avis.length > 0 ? ` (${avis.length})` : ""}`}
                        action="Voir tout →"
                    />
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead><tr>
                                <Th>Titre</Th>
                                <Th colorVar="--color-secondary">Auteur</Th>
                                <Th colorVar="--color-secondary">Date</Th>
                                <Th>Note</Th>
                                <Th colorVar="--color-accent">Actions</Th>
                            </tr></thead>
                            <tbody>
                            {activity.loading && [0,1,2,3,4].map(i => <SkeletonRow key={i} cols={5} />)}
                            {activity.error && <ErrorRow cols={5} message="Impossible de charger les avis." />}
                            {!activity.loading && !activity.error && avis.length === 0 && !activity.error && (
                                <tr>
                                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-base-content/35 font-unbounded">
                                        Aucun avis trouvé
                                    </td>
                                </tr>
                            )}
                            {!activity.loading && !activity.error && avis.map((a, i) => (
                                <tr key={i}>
                                    <Td>
                                        <span className="text-[13px] font-semibold line-clamp-1">{a.titre}</span>
                                    </Td>
                                    <Td>
                                        <div className="flex items-center gap-2">
                                            <Avatar name={a.auteur} index={i} size={26} />
                                            <span className="text-xs font-medium">{a.auteur}</span>
                                        </div>
                                    </Td>
                                    <Td>
                                        <span className="text-xs text-base-content/50">{formatDate(a.date)}</span>
                                    </Td>
                                    <Td>
                                        {a.note
                                            ? <span className="flex items-center gap-1 text-sm font-black font-unbounded text-primary"><Star size={12} />{a.note}</span>
                                            : <span className="text-base-content/20 text-sm">—</span>
                                        }
                                    </Td>
                                    <Td>
                                        <div className="flex gap-1">
                                            <ActionBtn title="Éditer"              hoverColorVar="--color-primary"><Pencil size={13} /></ActionBtn>
                                            <ActionBtn title="Masquer (shadowban)" hoverColorVar="--color-warning"><EyeOff size={13} /></ActionBtn>
                                            <ActionBtn title="Supprimer"           hoverColorVar="--color-error">  <Trash2 size={13} /></ActionBtn>
                                        </div>
                                    </Td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* ── Tableau Watchlists ── */}
            {(activeType === "tous" || activeType === "watchlist") && (
                <Card>
                    <CardHeader
                        title={`Dernières watchlists${watchlists.length > 0 ? ` (${watchlists.length})` : ""}`}
                        action="Voir tout →"
                    />
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead><tr>
                                <Th>Nom de la watchlist</Th>
                                <Th colorVar="--color-secondary">Auteur</Th>
                                <Th colorVar="--color-secondary">Date</Th>
                                <Th colorVar="--color-accent">Actions</Th>
                            </tr></thead>
                            <tbody>
                            {activity.loading && [0,1,2,3].map(i => <SkeletonRow key={i} cols={4} />)}
                            {activity.error && <ErrorRow cols={4} message="Impossible de charger les watchlists." />}
                            {!activity.loading && !activity.error && watchlists.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-5 py-8 text-center text-sm text-base-content/35 font-unbounded">
                                        Aucune watchlist trouvée
                                    </td>
                                </tr>
                            )}
                            {!activity.loading && !activity.error && watchlists.map((w, i) => (
                                <tr key={i}>
                                    <Td>
                                        <div className="flex items-center gap-2">
                                            <TypeBadge type="watchlist" />
                                            <span className="text-[13px] font-semibold line-clamp-1">{w.titre}</span>
                                        </div>
                                    </Td>
                                    <Td>
                                        <div className="flex items-center gap-2">
                                            <Avatar name={w.auteur} index={i} size={26} />
                                            <span className="text-xs font-medium">{w.auteur}</span>
                                        </div>
                                    </Td>
                                    <Td>
                                        <span className="text-xs text-base-content/50">{formatDate(w.date)}</span>
                                    </Td>
                                    <Td>
                                        <div className="flex gap-1">
                                            <ActionBtn title="Éditer"              hoverColorVar="--color-primary"><Pencil size={13} /></ActionBtn>
                                            <ActionBtn title="Masquer (shadowban)" hoverColorVar="--color-warning"><EyeOff size={13} /></ActionBtn>
                                            <ActionBtn title="Supprimer"           hoverColorVar="--color-error">  <Trash2 size={13} /></ActionBtn>
                                        </div>
                                    </Td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            <p className="text-center text-[10px] font-black font-unbounded tracking-[0.15em] text-base-content/20 pb-2">
                SCREENCLUB ADMIN · V0.1 · 2026
            </p>

        </AdminLayout>
    );
}