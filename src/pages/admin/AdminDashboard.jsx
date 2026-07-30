import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, EyeOff, Trash2, Star } from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
    fetchAdminStats,
    fetchRecentUsers,
    fetchRecentReports,
    fetchRecentActivity,
} from "@api/adminService.js";
import { useAdminData, formatDate, STATUT_USER_LABELS, STATUT_REPORT_LABELS } from "@api/adminShared.jsx";
import AdminLayout, {
    Avatar, StatusBadge, TypeBadge, ActionBtn,
    Card, CardHeader, Th, Td, SkeletonRow, ErrorRow,
} from "@components/layout/AdminLayout.jsx";

// ─── Mock activité 30 jours — à remplacer par fetchActivityTrend() ───────────

const ACTIVITY_DATA = Array.from({ length: 30 }, (_, i) => {
    const d = new Date("2026-03-06");
    d.setDate(d.getDate() + i);
    const label = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
    // Simulation réaliste : pic le week-end, creux le milieu de semaine
    const dow = d.getDay(); // 0=dim, 6=sam
    const isWeekend = dow === 0 || dow === 6;
    const base = isWeekend ? 1.4 : 1;
    const noise = () => Math.round((Math.random() - 0.5) * 6);
    return {
        label,
        inscriptions: Math.max(1, Math.round(base * (8  + i * 0.3) + noise())),
        avis:         Math.max(1, Math.round(base * (18 + i * 0.5) + noise())),
        watchlists:   Math.max(1, Math.round(base * (12 + i * 0.4) + noise())),
    };
});

// ─── Heatmap data — 7 jours × 24h ────────────────────────────────────────────

const DAYS    = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const HOURS   = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}h`);

const HEATMAP_DATA = DAYS.map((day, di) => ({
    day,
    hours: HOURS.map((_, hi) => {
        const isWeekend = di >= 5;
        const isPeak    = (hi >= 19 && hi <= 23) || (hi >= 12 && hi <= 14);
        const isDead    = hi >= 2 && hi <= 7;
        const val = isDead   ? Math.round(Math.random() * 4)
            : isPeak   ? Math.round(60 + Math.random() * 40 + (isWeekend ? 20 : 0))
                : isWeekend? Math.round(30 + Math.random() * 30)
                    : Math.round(15 + Math.random() * 25);
        return val;
    }),
}));

// ─── Tooltip custom ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div
            className="rounded-xl px-4 py-3 text-xs shadow-2xl flex flex-col gap-1.5"
            style={{
                background:    "oklch(from var(--color-base-200) l c h / 0.97)",
                border:        "1px solid oklch(from var(--color-base-content) l c h / 0.12)",
                backdropFilter: "blur(8px)",
            }}
        >
            <p className="font-black font-unbounded text-[10px] uppercase tracking-widest text-base-content/50 mb-1">{label}</p>
            {payload.map((p, i) => (
                <div key={i} className="flex items-center gap-2 justify-between">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                        <span className="text-base-content/70 capitalize">{p.name}</span>
                    </span>
                    <span className="font-bold text-base-content ml-4">{p.value}</span>
                </div>
            ))}
        </div>
    );
}

const MOTIF_LABELS = {
    PROPOS_HAINEUX:      "Propos haineux",
    HARCELEMENT:         "Harcèlement",
    SPAM:                "Spam",
    DESINFORMATION:      "Désinformation",
    CONTENU_INAPPROPRIE: "Contenu inapproprié",
    AUTRE:               "Autre",
};

const STAT_CARDS_DEF = [
    { key: "totalMembres",          label: "Membres",      sub: "au total",   bar: "bg-primary",   text: "text-primary"   },
    { key: "totalCritiques",        label: "Critiques",    sub: "au total",   bar: "bg-secondary", text: "text-secondary" },
    { key: "totalWatchlists",       label: "Watchlists",   sub: "au total",   bar: "bg-accent",    text: "text-accent"    },
    { key: "signalementsEnAttente", label: "Signalements", sub: "en attente", bar: "bg-error",     text: "text-error"     },
];

export default function AdminDashboard() {
    const navigate = useNavigate();

    const stats    = useAdminData(fetchAdminStats);
    const users    = useAdminData(fetchRecentUsers);
    const reports  = useAdminData(fetchRecentReports);
    const activity = useAdminData(fetchRecentActivity);

    const statsError = stats.error; const usersError = users.error;
    const reportsError = reports.error; const activityError = activity.error;
    useEffect(() => {
        if ([statsError, usersError, reportsError, activityError].some(e => e === "SESSION_EXPIRED"))
            navigate("/");
    }, [statsError, usersError, reportsError, activityError, navigate]);

    const pendingCount = reports.data?.filter(r => r.statut === "EN_ATTENTE").length ?? 0;

    return (
        <AdminLayout activeId="dashboard" pendingCount={pendingCount}>

            {/* ── Stats ── */}
            <div className="stats-grid">
                {STAT_CARDS_DEF.map((s, i) => (
                    <div key={i} className="sc-stat bg-base-200 rounded-box overflow-hidden relative cursor-default border border-primary/10 transition-[transform,box-shadow] duration-180 p-[22px_24px]">
                        <div className={`absolute top-0 left-0 right-0 h-0.75 ${s.bar}`} />
                        <p className={`text-[10px] font-black font-unbounded tracking-widest uppercase mb-2.5 ${s.text}`}>{s.label}</p>
                        {stats.loading ? (
                            <div className="h-8 w-3/5 rounded animate-[sc-pulse_1.4s_ease-in-out_infinite] bg-base-content/8 mb-2.5" />
                        ) : stats.error ? (
                            <p className="text-sm text-error/70 mb-2.5">—</p>
                        ) : (
                            <p className={`text-[30px] font-black font-unbounded leading-none mb-2.5 tracking-[-0.04em] ${s.text}`}>
                                {stats.data?.[s.key]?.toLocaleString("fr-FR")}
                            </p>
                        )}
                        <span className="text-[11px] text-base-content/40">{s.sub}</span>
                    </div>
                ))}
            </div>

            {/* ── Graphiques ── */}
            <div className="two-col">

                {/* Activité 30 jours — Line chart */}
                <Card>
                    <CardHeader title="Activité — 30 derniers jours" />
                    <div className="px-4 pt-4 pb-2">
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={ACTIVITY_DATA} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false}
                                               stroke="oklch(from var(--color-base-content) l c h / 0.07)" />
                                <XAxis
                                    dataKey="label"
                                    tickLine={false} axisLine={false} dy={6}
                                    interval={4}
                                    tick={{ fill: "oklch(from var(--color-base-content) l c h / 0.4)", fontSize: 10 }}
                                />
                                <YAxis
                                    tickLine={false} axisLine={false} width={28}
                                    tick={{ fill: "oklch(from var(--color-base-content) l c h / 0.4)", fontSize: 10 }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    iconType="circle" iconSize={7}
                                    wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                                />
                                <Line type="monotone" dataKey="inscriptions" name="Inscriptions"
                                      stroke="oklch(from var(--color-primary) l c h)"
                                      strokeWidth={2} dot={false}
                                      activeDot={{ r: 3, strokeWidth: 0 }} />
                                <Line type="monotone" dataKey="avis" name="Avis"
                                      stroke="oklch(from var(--color-secondary) l c h)"
                                      strokeWidth={2} dot={false}
                                      activeDot={{ r: 3, strokeWidth: 0 }} />
                                <Line type="monotone" dataKey="watchlists" name="Watchlists"
                                      stroke="oklch(from var(--color-accent) l c h)"
                                      strokeWidth={2} dot={false}
                                      activeDot={{ r: 3, strokeWidth: 0 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Heatmap hebdomadaire */}
                <Card>
                    <CardHeader title="Trafic — par heure cette semaine" />
                    <div className="px-5 pt-4 pb-5 overflow-x-auto">
                        {/* Légende heure */}
                        <div className="flex gap-px mb-1 ml-8">
                            {HOURS.filter((_, i) => i % 3 === 0).map(h => (
                                <div key={h} className="text-[9px] text-base-content/30 font-mono w-[calc((100%-2rem)/8)] text-center">
                                    {h}
                                </div>
                            ))}
                        </div>
                        {/* Grille heatmap */}
                        {HEATMAP_DATA.map(({ day, hours }) => {
                            const max = Math.max(...HEATMAP_DATA.flatMap(d => d.hours));
                            return (
                                <div key={day} className="flex items-center gap-1 mb-1">
                                    <span className="text-[10px] text-base-content/40 font-unbounded w-7 shrink-0 text-right pr-1">
                                        {day}
                                    </span>
                                    <div className="flex gap-px flex-1">
                                        {hours.map((val, hi) => {
                                            const intensity = val / max;
                                            return (
                                                <div
                                                    key={hi}
                                                    title={`${day} ${HOURS[hi]} — ${val} actions`}
                                                    className="flex-1 h-4 rounded-[2px] cursor-default transition-opacity duration-100 hover:opacity-70"
                                                    style={{
                                                        background: intensity < 0.05
                                                            ? "oklch(from var(--color-base-300) l c h)"
                                                            : `oklch(from var(--color-primary) l c h / ${0.12 + intensity * 0.88})`,
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                        {/* Légende intensité */}
                        <div className="flex items-center gap-2 mt-3 justify-end">
                            <span className="text-[9px] text-base-content/30">Peu</span>
                            {[0.1, 0.3, 0.5, 0.7, 0.9].map(v => (
                                <div key={v} className="w-3 h-3 rounded-[2px]"
                                     style={{ background: `oklch(from var(--color-primary) l c h / ${0.12 + v * 0.88})` }} />
                            ))}
                            <span className="text-[9px] text-base-content/30">Beaucoup</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* ── Membres + Signalements ── */}
            <div className="two-col">
                <Card>
                    <CardHeader title="Derniers membres" action="Voir tout →" />
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead><tr>
                                <Th>Pseudo</Th>
                                <Th colorVar="--color-secondary">Inscription</Th>
                                <Th>Statut</Th>
                            </tr></thead>
                            <tbody>
                            {users.loading && [0,1,2,3,4].map(i => <SkeletonRow key={i} cols={3} />)}
                            {users.error && <ErrorRow cols={3} message="Impossible de charger les membres." />}
                            {!users.loading && !users.error && users.data?.map((u, i) => (
                                <tr key={u.id}>
                                    <Td>
                                        <div className="flex items-center gap-2.5">
                                            <Avatar name={u.pseudo} index={i} />
                                            <div>
                                                <p className="text-[13px] font-semibold">{u.pseudo}</p>
                                                <p className="text-[11px] mt-0.5 text-base-content/40">{u.email}</p>
                                            </div>
                                        </div>
                                    </Td>
                                    <Td><span className="text-xs text-base-content/55">{formatDate(u.inscription)}</span></Td>
                                    <Td><StatusBadge status={STATUT_USER_LABELS[u.statut] ?? "inactif"} /></Td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Card>
                    <CardHeader title="Signalements récents" action="Voir tout →" />
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead><tr>
                                <Th>Contenu</Th>
                                <Th colorVar="--color-secondary">Motif</Th>
                                <Th>Statut</Th>
                            </tr></thead>
                            <tbody>
                            {reports.loading && [0,1,2].map(i => <SkeletonRow key={i} cols={3} />)}
                            {reports.error && <ErrorRow cols={3} message="Impossible de charger les signalements." />}
                            {!reports.loading && !reports.error && reports.data?.map(r => (
                                <tr key={r.id}>
                                    <Td>
                                        <p className="text-[13px] font-semibold">
                                            {r.typeObjet === "AVIS" ? "Critique" : "Watchlist"} #{r.objetId}
                                        </p>
                                        <p className="text-[11px] mt-0.5 text-base-content/40">
                                            par {r.auteurPseudo} · {formatDate(r.dateSignalement?.split("T")[0])}
                                        </p>
                                    </Td>
                                    <Td><span className="text-xs text-base-content/55">{MOTIF_LABELS[r.motif] ?? r.motif}</span></Td>
                                    <Td><StatusBadge status={STATUT_REPORT_LABELS[r.statut] ?? "pending"} /></Td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* ── Avis & Watchlists ── */}
            <Card>
                <CardHeader title="Derniers avis & watchlists" action="Voir tout →" />
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead><tr>
                            <Th>Titre</Th>
                            <Th colorVar="--color-secondary">Type</Th>
                            <Th>Auteur</Th>
                            <Th colorVar="--color-secondary">Date</Th>
                            <Th>Note</Th>
                            <Th colorVar="--color-secondary">Actions</Th>
                        </tr></thead>
                        <tbody>
                        {activity.loading && [0,1,2,3,4].map(i => <SkeletonRow key={i} cols={6} />)}
                        {activity.error && <ErrorRow cols={6} message="Impossible de charger l'activité récente." />}
                        {!activity.loading && !activity.error && activity.data?.map((a, i) => (
                            <tr key={i}>
                                <Td><span className="text-[13px] font-semibold">{a.titre}</span></Td>
                                <Td><TypeBadge type={a.type} /></Td>
                                <Td>
                                    <div className="flex items-center gap-2.5">
                                        <Avatar name={a.auteur} index={i} />
                                        <span className="text-xs font-medium">{a.auteur}</span>
                                    </div>
                                </Td>
                                <Td><span className="text-xs text-base-content/50">{formatDate(a.date)}</span></Td>
                                <Td>
                                    {a.note
                                        ? <span className="flex items-center gap-1 text-sm font-black font-unbounded text-primary"><Star size={13} /> {a.note}</span>
                                        : <span className="text-[13px] text-base-content/20">—</span>
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

            <p className="text-center text-[10px] font-black font-unbounded tracking-[0.15em] text-base-content/20 pb-2">
                SCREENCLUB ADMIN · V0.1 · 2026
            </p>

        </AdminLayout>
    );
}