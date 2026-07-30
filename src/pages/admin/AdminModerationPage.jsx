import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search, X, Scale, Footprints, EyeOff,
    Clock, AlertTriangle, ChevronDown, Flag, CheckCheck, Trash2,
} from "lucide-react";
import { fetchRecentUsers, fetchRecentReports } from "@api/adminService.js";
import { useAdminData, formatDate, STATUT_REPORT_LABELS } from "@api/adminShared.jsx";
import { getUser } from "@api/auth.js";
import AdminLayout, {
    Avatar, StatusBadge, ActionBtn, Card, CardHeader, Th, Td, SkeletonRow, ErrorRow,
} from "@components/layout/AdminLayout.jsx";

// ─── Constantes ───────────────────────────────────────────────────────────────

const KICK_DURATIONS = [
    { label: "3 jours",  value: "3d" },
    { label: "7 jours",  value: "7d" },
    { label: "15 jours", value: "15d" },
    { label: "1 mois",   value: "30d" },
];

const ACTION_CONFIG = {
    kick: {
        label:       "Kick temporaire",
        icon:        Footprints,
        color:       "--color-warning",
        badgeClass:  "badge-warning",
        description: "L'utilisateur sera suspendu pour la durée choisie.",
        hasDuration: true,
    },
    ban: {
        label:       "Ban permanent",
        icon:        Scale,
        color:       "--color-error",
        badgeClass:  "badge-error",
        description: "L'utilisateur sera définitivement banni de la plateforme.",
        hasDuration: false,
    },
    shadowban: {
        label:       "Shadowban",
        icon:        EyeOff,
        color:       "--color-secondary",
        badgeClass:  "badge-secondary",
        description: "L'utilisateur reste connecté mais son contenu sera masqué pour tous les autres. Il n'en sera pas informé.",
        hasDuration: false,
    },
};

const STATUT_LABELS = { ACTIF: "actif", INACTIF: "inactif", BANNI: "banni" };

const MOTIF_LABELS = {
    PROPOS_HAINEUX:      "Propos haineux",
    HARCELEMENT:         "Harcèlement",
    SPAM:                "Spam",
    DESINFORMATION:      "Désinformation",
    CONTENU_INAPPROPRIE: "Contenu inapproprié",
    AUTRE:               "Autre",
};

const MOTIF_BADGE = {
    PROPOS_HAINEUX:      "badge-error",
    HARCELEMENT:         "badge-error",
    SPAM:                "badge-warning",
    DESINFORMATION:      "badge-warning",
    CONTENU_INAPPROPRIE: "badge-ghost",
    AUTRE:               "badge-ghost",
};

// ─── Modale d'action ─────────────────────────────────────────────────────────

function ActionModal({ target, actionType, onClose, onConfirm }) {
    const admin = getUser();
    const [duration,  setDuration]  = useState("7d");
    const [reason,    setReason]    = useState("");
    const [confirmed, setConfirmed] = useState(false);

    if (!target || !actionType) return null;

    const cfg     = ACTION_CONFIG[actionType];
    const Icon    = cfg.icon;
    const now     = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

    function handleConfirm() {
        // TODO — brancher l'appel API quand le back sera prêt
        // ex: await banUser({ userId: target.id, type: actionType, duration, reason, adminId: admin.id })
        onConfirm({ target, actionType, duration, reason, admin });
        onClose();
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modale */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="bg-base-100 rounded-box border border-base-content/10 shadow-2xl w-full max-w-md pointer-events-auto flex flex-col gap-0 overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* En-tête coloré */}
                    <div
                        className="px-6 py-5 flex items-center gap-3"
                        style={{ background: `oklch(from var(${cfg.color}) l c h / 0.1)`, borderBottom: `1px solid oklch(from var(${cfg.color}) l c h / 0.2)` }}
                    >
                        <span
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: `oklch(from var(${cfg.color}) l c h / 0.15)`, border: `1px solid oklch(from var(${cfg.color}) l c h / 0.3)` }}
                        >
                            <Icon size={18} style={{ color: `oklch(from var(${cfg.color}) l c h)` }} />
                        </span>
                        <div>
                            <p className="font-black font-unbounded text-sm text-base-content">{cfg.label}</p>
                            <p className="text-xs text-base-content/50 mt-0.5">
                                Cible : <span className="font-bold text-base-content">{target.pseudo}</span>
                            </p>
                        </div>
                        <button onClick={onClose} className="ml-auto btn btn-ghost btn-sm btn-circle text-base-content/40">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="px-6 py-5 flex flex-col gap-4">
                        {/* Description */}
                        <div role="alert" className="alert alert-warning text-xs py-2.5 px-4">
                            <AlertTriangle size={14} className="shrink-0" />
                            <span>{cfg.description}</span>
                        </div>

                        {/* Durée — kick uniquement */}
                        {cfg.hasDuration && (
                            <div>
                                <label className="text-[11px] font-black font-unbounded uppercase tracking-widest text-base-content/50 mb-2 block">
                                    <Clock size={11} className="inline mr-1 -mt-0.5" /> Durée de la suspension
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {KICK_DURATIONS.map(d => (
                                        <button
                                            key={d.value}
                                            onClick={() => setDuration(d.value)}
                                            className={`btn btn-xs font-unbounded ${duration === d.value ? "btn-warning" : "btn-ghost border border-base-content/15"}`}
                                        >
                                            {d.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Motif */}
                        <div>
                            <label className="text-[11px] font-black font-unbounded uppercase tracking-widest text-base-content/50 mb-2 block">
                                Motif (optionnel)
                            </label>
                            <textarea
                                className="textarea textarea-bordered w-full text-sm resize-none font-sans"
                                rows={3}
                                placeholder="Raison de l'action de modération…"
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                            />
                        </div>

                        {/* Récapitulatif admin */}
                        <div
                            className="rounded-lg px-4 py-3 flex flex-col gap-1 text-xs"
                            style={{ background: "oklch(from var(--color-base-200) l c h / 0.6)", border: "1px solid oklch(from var(--color-base-content) l c h / 0.08)" }}
                        >
                            <p className="text-base-content/40 font-unbounded text-[10px] uppercase tracking-widest mb-1">Enregistré sous</p>
                            <div className="flex items-center justify-between">
                                <span className="text-base-content/60">Administrateur</span>
                                <span className="font-semibold text-base-content">{admin?.username ?? "—"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-base-content/60">Rôle</span>
                                <span className="badge badge-primary badge-xs font-unbounded">{admin?.role ?? "ADMIN"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-base-content/60">Date</span>
                                <span className="font-semibold text-base-content">{now}</span>
                            </div>
                            {cfg.hasDuration && (
                                <div className="flex items-center justify-between">
                                    <span className="text-base-content/60">Durée</span>
                                    <span className="font-semibold text-base-content">
                                        {KICK_DURATIONS.find(d => d.value === duration)?.label}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Confirmation */}
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-xs"
                                checked={confirmed}
                                onChange={e => setConfirmed(e.target.checked)}
                            />
                            <span className="text-xs text-base-content/60">
                                Je confirme cette action de modération
                            </span>
                        </label>
                    </div>

                    {/* Actions */}
                    <div
                        className="px-6 py-4 flex items-center justify-end gap-2"
                        style={{ borderTop: "1px solid oklch(from var(--color-base-content) l c h / 0.08)" }}
                    >
                        <button onClick={onClose} className="btn btn-ghost btn-sm font-unbounded">
                            Annuler
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!confirmed}
                            className="btn btn-sm font-unbounded gap-2"
                            style={confirmed ? {
                                background:  `oklch(from var(${cfg.color}) l c h)`,
                                color:       "oklch(from var(--color-base-100) l c h)",
                                border:      "none",
                            } : {}}
                        >
                            <Icon size={13} />
                            {cfg.label}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Bouton action rapide ─────────────────────────────────────────────────────

function ModerationBtn({ actionType, onClick }) {
    const [hov, setHov] = useState(false);
    const cfg  = ACTION_CONFIG[actionType];
    const Icon = cfg.icon;
    return (
        <button
            title={cfg.label}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            onClick={onClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold font-unbounded transition-all duration-150 cursor-pointer border whitespace-nowrap"
            style={{
                background:  hov ? `oklch(from var(${cfg.color}) l c h / 0.12)` : "transparent",
                borderColor: hov ? `oklch(from var(${cfg.color}) l c h / 0.4)`  : `oklch(from var(${cfg.color}) l c h / 0.2)`,
                color:       `oklch(from var(${cfg.color}) l c h)`,
            }}
        >
            <Icon size={12} />
            {cfg.label}
        </button>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminModerationPage() {
    const navigate = useNavigate();

    // On réutilise fetchRecentUsers en attendant un endpoint dédié
    const users   = useAdminData(fetchRecentUsers);
    const reports = useAdminData(fetchRecentReports);

    const usersError   = users.error;
    const reportsError = reports.error;
    useEffect(() => {
        if ([usersError, reportsError].some(e => e === "SESSION_EXPIRED")) navigate("/");
    }, [usersError, reportsError, navigate]);

    const [search,        setSearch]        = useState("");
    const [modalUser,     setModalUser]     = useState(null);
    const [modalType,     setModalType]     = useState(null);
    const [lastAction,    setLastAction]    = useState(null);
    const [reportFilter,  setReportFilter]  = useState("tous"); // "tous" | "EN_ATTENTE" | "RESOLU" | "REJETE"

    const filteredUsers = useMemo(() => {
        if (!users.data) return [];
        if (!search) return users.data;
        return users.data.filter(u =>
            u.pseudo?.toLowerCase().includes(search.toLowerCase())
        );
    }, [users.data, search]);

    const filteredReports = useMemo(() => {
        if (!reports.data) return [];
        if (reportFilter === "tous") return reports.data;
        return reports.data.filter(r => r.statut === reportFilter);
    }, [reports.data, reportFilter]);

    const pendingCount = reports.data?.filter(r => r.statut === "EN_ATTENTE").length ?? 0;

    function openModal(user, type) {
        setModalUser(user);
        setModalType(type);
    }

    function handleConfirm(payload) {
        // TODO — appel API à brancher
        setLastAction(payload);
        setTimeout(() => setLastAction(null), 4000);
    }

    return (
        <AdminLayout activeId="moderation">

            {/* ── En-tête ── */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-xl font-black font-unbounded tracking-tight text-base-content">
                        Modération
                    </h2>
                    <p className="text-xs text-base-content/45 mt-0.5">
                        Kick, ban et shadowban des membres de la plateforme
                    </p>
                </div>

                {/* Recherche pseudo */}
                <label className="input input-sm input-bordered flex items-center gap-2 w-56">
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
            </div>

            {/* ── Légende des actions ── */}
            <div className="flex flex-wrap gap-3">
                {Object.entries(ACTION_CONFIG).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                        <div
                            key={key}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                            style={{
                                background: `oklch(from var(${cfg.color}) l c h / 0.08)`,
                                border:     `1px solid oklch(from var(${cfg.color}) l c h / 0.2)`,
                            }}
                        >
                            <Icon size={13} style={{ color: `oklch(from var(${cfg.color}) l c h)` }} />
                            <span className="font-black font-unbounded text-[10px] uppercase tracking-wide" style={{ color: `oklch(from var(${cfg.color}) l c h)` }}>
                                {cfg.label}
                            </span>
                            <span className="text-base-content/45 hidden sm:inline">— {cfg.description}</span>
                        </div>
                    );
                })}
            </div>

            {/* ── Toast confirmation ── */}
            {lastAction && (
                <div role="alert" className="alert alert-success text-sm py-3 px-4">
                    <Scale size={15} className="shrink-0" />
                    <span>
                        Action <span className="font-bold">{ACTION_CONFIG[lastAction.actionType].label}</span> appliquée
                        sur <span className="font-bold">{lastAction.target.pseudo}</span> — en attente de connexion API.
                    </span>
                </div>
            )}

            {/* ── Tableau utilisateurs ── */}
            <Card>
                <CardHeader
                    title={`Membres${filteredUsers.length > 0 ? ` (${filteredUsers.length})` : ""}`}
                    action={search ? `Résultats pour "${search}"` : null}
                />
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead><tr>
                            <Th>Membre</Th>
                            <Th colorVar="--color-secondary">Email</Th>
                            <Th colorVar="--color-secondary">Inscription</Th>
                            <Th>Statut actuel</Th>
                            <Th colorVar="--color-error">Actions de modération</Th>
                        </tr></thead>
                        <tbody>
                        {users.loading && [0,1,2,3,4,5].map(i => <SkeletonRow key={i} cols={5} />)}
                        {users.error && <ErrorRow cols={5} message="Impossible de charger les membres." />}
                        {!users.loading && !users.error && filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-5 py-10 text-center font-unbounded text-sm text-base-content/30">
                                    Aucun membre trouvé
                                </td>
                            </tr>
                        )}
                        {!users.loading && !users.error && filteredUsers.map((u, i) => (
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
                                    <StatusBadge status={STATUT_LABELS[u.statut] ?? "inactif"} />
                                </Td>
                                <Td>
                                    <div className="flex gap-2 flex-wrap">
                                        <ModerationBtn actionType="kick"       onClick={() => openModal(u, "kick")} />
                                        <ModerationBtn actionType="ban"        onClick={() => openModal(u, "ban")} />
                                        <ModerationBtn actionType="shadowban"  onClick={() => openModal(u, "shadowban")} />
                                    </div>
                                </Td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* ── Signalements ── */}
            <Card>
                <CardHeader
                    title={
                        <span className="flex items-center gap-2">
                            <Flag size={14} className="text-error" />
                            Signalements
                            {pendingCount > 0 && (
                                <span className="badge badge-error badge-xs font-unbounded">{pendingCount} en attente</span>
                            )}
                        </span>
                    }
                    action={
                        <div className="flex items-center gap-1.5">
                            {["tous", "EN_ATTENTE", "RESOLU", "REJETE"].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setReportFilter(s)}
                                    className={`btn btn-xs font-unbounded ${
                                        reportFilter === s
                                            ? s === "EN_ATTENTE" ? "btn-warning"
                                                : s === "RESOLU"     ? "btn-success"
                                                    : s === "REJETE"     ? "btn-ghost border border-base-content/20"
                                                        : "btn-primary"
                                            : "btn-ghost border border-base-content/15"
                                    }`}
                                >
                                    {s === "tous" ? "Tous" : s === "EN_ATTENTE" ? "En attente" : s === "RESOLU" ? "Résolus" : "Rejetés"}
                                </button>
                            ))}
                        </div>
                    }
                />
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead><tr>
                            <Th>Contenu signalé</Th>
                            <Th colorVar="--color-secondary">Signalé par</Th>
                            <Th colorVar="--color-warning">Motif</Th>
                            <Th colorVar="--color-secondary">Date</Th>
                            <Th>Statut</Th>
                            <Th colorVar="--color-error">Actions</Th>
                        </tr></thead>
                        <tbody>
                        {reports.loading && [0,1,2,3].map(i => <SkeletonRow key={i} cols={6} />)}
                        {reports.error && <ErrorRow cols={6} message="Impossible de charger les signalements." />}
                        {!reports.loading && !reports.error && filteredReports.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-5 py-10 text-center font-unbounded text-sm text-base-content/30">
                                    Aucun signalement{reportFilter !== "tous" ? " dans cette catégorie" : ""}
                                </td>
                            </tr>
                        )}
                        {!reports.loading && !reports.error && filteredReports.map((r, i) => (
                            <tr key={r.id}>
                                <Td>
                                    <div>
                                        <p className="text-[13px] font-semibold">
                                            {r.typeObjet === "AVIS" ? "Critique" : "Watchlist"} #{r.objetId}
                                        </p>
                                        <p className="text-[11px] mt-0.5 text-base-content/40">
                                            auteur : {r.auteurPseudo}
                                        </p>
                                    </div>
                                </Td>
                                <Td>
                                    <div className="flex items-center gap-2">
                                        <Avatar name={r.signaleurPseudo ?? "?"} index={i} size={24} />
                                        <span className="text-xs font-medium">{r.signaleurPseudo ?? "—"}</span>
                                    </div>
                                </Td>
                                <Td>
                                        <span className={`badge ${MOTIF_BADGE[r.motif] ?? "badge-ghost"} badge-sm font-unbounded text-[10px] whitespace-nowrap`}>
                                            {MOTIF_LABELS[r.motif] ?? r.motif}
                                        </span>
                                </Td>
                                <Td>
                                        <span className="text-xs text-base-content/50">
                                            {formatDate(r.dateSignalement?.split("T")[0])}
                                        </span>
                                </Td>
                                <Td>
                                        <span className={`badge badge-sm font-unbounded text-[10px] ${
                                            STATUT_REPORT_LABELS[r.statut] === "pending"  ? "badge-warning" :
                                                STATUT_REPORT_LABELS[r.statut] === "resolved" ? "badge-success" :
                                                    "badge-ghost"
                                        }`}>
                                            {r.statut === "EN_ATTENTE" ? "En attente" : r.statut === "RESOLU" ? "Résolu" : "Rejeté"}
                                        </span>
                                </Td>
                                <Td>
                                    <div className="flex gap-1">
                                        {/* Voir le contenu signalé */}
                                        <ActionBtn title="Voir le contenu" hoverColorVar="--color-primary">
                                            <Flag size={13} />
                                        </ActionBtn>
                                        {/* Sanctionner l'auteur */}
                                        <ActionBtn title="Sanctionner l'auteur" hoverColorVar="--color-warning">
                                            <Scale size={13} />
                                        </ActionBtn>
                                        {/* Marquer résolu */}
                                        <ActionBtn title="Marquer comme résolu" hoverColorVar="--color-success">
                                            <CheckCheck size={13} />
                                        </ActionBtn>
                                        {/* Rejeter le signalement */}
                                        <ActionBtn title="Rejeter le signalement" hoverColorVar="--color-error">
                                            <Trash2 size={13} />
                                        </ActionBtn>
                                    </div>
                                </Td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <p className="text-center text-[10px] font-black font-unbounded tracking-[0.15em] text-base-content/20 pb-2">
                SCREENCLUB ADMIN · V0.1 · 2026
            </p>

            {/* ── Modale ── */}
            <ActionModal
                target={modalUser}
                actionType={modalType}
                onClose={() => { setModalUser(null); setModalType(null); }}
                onConfirm={handleConfirm}
            />

        </AdminLayout>
    );
}