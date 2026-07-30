import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, ShieldOff, ShieldCheck, UserX, Mail } from "lucide-react";
import { fetchAllUsers, fetchUserStats } from "@api/adminService.js";
import { useAdminData, formatDate, STATUT_USER_LABELS } from "@api/adminShared.jsx";
import AdminLayout, {
    Avatar, StatusBadge, ActionBtn,
    Card, CardHeader, Th, Td, SkeletonRow, ErrorRow,
} from "@components/layout/AdminLayout.jsx";

// ─── Stats utilisateurs ───────────────────────────────────────────────────────

const USER_STAT_CARDS = [
    { key: "totalActifs",    label: "Actifs",      sub: "membres actifs",    bar: "bg-success",   text: "text-success"   },
    { key: "totalBannis",    label: "Bannis",       sub: "comptes bannis",    bar: "bg-error",     text: "text-error"     },
    { key: "totalInactifs",  label: "Inactifs",     sub: "sans activité",     bar: "bg-warning",   text: "text-warning"   },
    { key: "newsCeMois",     label: "Ce mois",      sub: "nouvelles inscr.",  bar: "bg-primary",   text: "text-primary"   },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminUserPage() {
    const navigate = useNavigate();

    const users = useAdminData(fetchAllUsers);
    const stats = useAdminData(fetchUserStats);

    const usersError = users.error;
    const statsError = stats.error;
    useEffect(() => {
        if ([usersError, statsError].some(e => e === "SESSION_EXPIRED")) navigate("/");
    }, [usersError, statsError, navigate]);

    return (
        <AdminLayout activeId="users">

            {/* ── En-tête de page ── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-xl font-black font-unbounded tracking-tight text-base-content">
                        Utilisateurs
                    </h2>
                    <p className="text-xs text-base-content/45 mt-0.5">
                        Gestion des comptes membres de la plateforme
                    </p>
                </div>
                <button className="btn btn-primary btn-sm font-unbounded gap-2">
                    <Mail size={14} /> Inviter un membre
                </button>
            </div>

            {/* ── Stats ── */}
            <div className="stats-grid">
                {USER_STAT_CARDS.map((s, i) => (
                    <div key={i} className="sc-stat bg-base-200 rounded-box overflow-hidden relative cursor-default border border-primary/10 transition-[transform,box-shadow] duration-180 p-[22px_24px]">
                        <div className={`absolute top-0 left-0 right-0 h-0.75 ${s.bar}`} />
                        <p className={`text-[10px] font-black font-unbounded tracking-widest uppercase mb-2.5 ${s.text}`}>{s.label}</p>
                        {stats.loading ? (
                            <div className="h-8 w-3/5 rounded animate-[sc-pulse_1.4s_ease-in-out_infinite] bg-base-content/8 mb-2.5" />
                        ) : stats.error ? (
                            <p className="text-sm text-error/70 mb-2.5">—</p>
                        ) : (
                            <p className={`text-[30px] font-black font-unbounded leading-none mb-2.5 tracking-[-0.04em] ${s.text}`}>
                                {stats.data?.[s.key]?.toLocaleString("fr-FR") ?? "—"}
                            </p>
                        )}
                        <span className="text-[11px] text-base-content/40">{s.sub}</span>
                    </div>
                ))}
            </div>

            {/* ── Tableau des membres ── */}
            <Card>
                <CardHeader title="Tous les membres" action={
                    <div className="flex items-center gap-2">
                        {/* Filtre statut */}
                        <select className="select select-xs select-bordered font-unbounded text-[10px]">
                            <option value="">Tous les statuts</option>
                            <option value="ACTIF">Actifs</option>
                            <option value="INACTIF">Inactifs</option>
                            <option value="BANNI">Bannis</option>
                        </select>
                        {/* Recherche */}
                        <input
                            type="text"
                            placeholder="Rechercher…"
                            className="input input-xs input-bordered font-sans w-36"
                        />
                    </div>
                } />
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead><tr>
                            <Th>Membre</Th>
                            <Th colorVar="--color-secondary">Email</Th>
                            <Th colorVar="--color-secondary">Inscription</Th>
                            <Th>Rôle</Th>
                            <Th>Statut</Th>
                            <Th colorVar="--color-accent">Critiques</Th>
                            <Th colorVar="--color-accent">Watchlists</Th>
                            <Th colorVar="--color-secondary">Actions</Th>
                        </tr></thead>
                        <tbody>
                        {users.loading && [0,1,2,3,4,5,6,7].map(i => <SkeletonRow key={i} cols={8} />)}
                        {users.error && <ErrorRow cols={8} message="Impossible de charger les membres." />}
                        {!users.loading && !users.error && users.data?.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-5 py-10 text-center text-sm text-base-content/40 font-unbounded">
                                    Aucun membre trouvé
                                </td>
                            </tr>
                        )}
                        {!users.loading && !users.error && users.data?.map((u, i) => (
                            <tr key={u.id}>
                                <Td>
                                    <div className="flex items-center gap-2.5">
                                        <Avatar name={u.pseudo} index={i} />
                                        <div>
                                            <p className="text-[13px] font-semibold leading-tight">{u.pseudo}</p>
                                            <p className="text-[10px] text-base-content/35 mt-0.5">#{u.id}</p>
                                        </div>
                                    </div>
                                </Td>
                                <Td>
                                    <span className="text-xs text-base-content/55">{u.email}</span>
                                </Td>
                                <Td>
                                    <span className="text-xs text-base-content/55">{formatDate(u.inscription)}</span>
                                </Td>
                                <Td>
                                        <span className={`badge badge-xs font-unbounded ${u.role === "ADMIN" ? "badge-primary" : "badge-ghost"}`}>
                                            {u.role === "ADMIN" ? "Admin" : "Membre"}
                                        </span>
                                </Td>
                                <Td>
                                    <StatusBadge status={STATUT_USER_LABELS[u.statut] ?? "inactif"} />
                                </Td>
                                <Td>
                                    <span className="text-xs font-semibold text-accent">{u.nbCritiques ?? "—"}</span>
                                </Td>
                                <Td>
                                    <span className="text-xs font-semibold text-secondary">{u.nbWatchlists ?? "—"}</span>
                                </Td>
                                <Td>
                                    <div className="flex gap-1">
                                        <ActionBtn title="Éditer le profil"  hoverColorVar="--color-primary"><Pencil     size={13} /></ActionBtn>
                                        <ActionBtn title="Envoyer un email"  hoverColorVar="--color-info">   <Mail       size={13} /></ActionBtn>
                                        {u.statut === "BANNI"
                                            ? <ActionBtn title="Débannir"    hoverColorVar="--color-success"><ShieldCheck size={13} /></ActionBtn>
                                            : <ActionBtn title="Bannir"      hoverColorVar="--color-warning"><ShieldOff   size={13} /></ActionBtn>
                                        }
                                        <ActionBtn title="Supprimer le compte" hoverColorVar="--color-error"><UserX size={13} /></ActionBtn>
                                    </div>
                                </Td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!users.loading && !users.error && users.data?.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-3 border-t border-primary/10">
                        <span className="text-[11px] text-base-content/40 font-unbounded">
                            {users.data.length} résultat{users.data.length > 1 ? "s" : ""}
                        </span>
                        <div className="join">
                            <button className="join-item btn btn-xs btn-ghost font-unbounded">«</button>
                            <button className="join-item btn btn-xs btn-active font-unbounded">1</button>
                            <button className="join-item btn btn-xs btn-ghost font-unbounded">2</button>
                            <button className="join-item btn btn-xs btn-ghost font-unbounded">»</button>
                        </div>
                    </div>
                )}
            </Card>

            <p className="text-center text-[10px] font-black font-unbounded tracking-[0.15em] text-base-content/20 pb-2">
                SCREENCLUB ADMIN · V0.1 · 2026
            </p>

        </AdminLayout>
    );
}