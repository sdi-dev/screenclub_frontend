import { useState, useMemo } from "react";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Euro, TrendingUp, Users, Heart, Download } from "lucide-react";
import AdminLayout, { Card, CardHeader } from "@components/layout/AdminLayout.jsx";

// ─── Mock data ────────────────────────────────────────────────────────────────
// À remplacer par useAdminData(fetchRevenues) quand le back sera prêt.
// Endpoint prévu : GET /api/admin/revenues?period=week|month|year

const DATA_SEMAINE = [
    { label: "Lun", abonnements: 9,  dons: 4  },
    { label: "Mar", abonnements: 12, dons: 7  },
    { label: "Mer", abonnements: 8,  dons: 2  },
    { label: "Jeu", abonnements: 15, dons: 11 },
    { label: "Ven", abonnements: 18, dons: 9  },
    { label: "Sam", abonnements: 22, dons: 15 },
    { label: "Dim", abonnements: 14, dons: 6  },
];

const DATA_MOIS = [
    { label: "S1",  abonnements: 68,  dons: 32  },
    { label: "S2",  abonnements: 74,  dons: 28  },
    { label: "S3",  abonnements: 91,  dons: 45  },
    { label: "S4",  abonnements: 103, dons: 61  },
];

const DATA_ANNEE = [
    { label: "Jan", abonnements: 210, dons: 95  },
    { label: "Fév", abonnements: 248, dons: 112 },
    { label: "Mar", abonnements: 285, dons: 134 },
    { label: "Avr", abonnements: 260, dons: 108 },
    { label: "Mai", abonnements: 310, dons: 157 },
    { label: "Jun", abonnements: 342, dons: 183 },
    { label: "Jul", abonnements: 298, dons: 142 },
    { label: "Aoû", abonnements: 275, dons: 120 },
    { label: "Sep", abonnements: 330, dons: 165 },
    { label: "Oct", abonnements: 378, dons: 194 },
    { label: "Nov", abonnements: 412, dons: 221 },
    { label: "Déc", abonnements: 445, dons: 248 },
];

const ABONNEMENT_PRICE = 3; // €/mois

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n) {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

// Tooltip custom — utilise les couleurs du thème DaisyUI
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div
            className="rounded-xl px-4 py-3 text-xs font-sans shadow-2xl flex flex-col gap-1.5"
            style={{
                background: "oklch(from var(--color-base-200) l c h / 0.97)",
                border: "1px solid oklch(from var(--color-base-content) l c h / 0.12)",
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
                    <span className="font-bold text-base-content ml-4">
                        {p.dataKey === "abonnements"
                            ? `${p.value} abonnés`
                            : fmt(p.value)}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ─── Stat card simple ─────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, bar, text }) {
    return (
        <div className="sc-stat bg-base-200 rounded-box overflow-hidden relative cursor-default border border-primary/10 transition-[transform,box-shadow] duration-180 p-[22px_24px]">
            <div className={`absolute top-0 left-0 right-0 h-0.75 ${bar}`} />
            <div className="flex items-start justify-between gap-2">
                <p className={`text-[10px] font-black font-unbounded tracking-widest uppercase mb-2.5 ${text}`}>{label}</p>
                <span className={`opacity-20 ${text}`}><Icon size={18} /></span>
            </div>
            <p className={`text-[30px] font-black font-unbounded leading-none mb-2.5 tracking-[-0.04em] ${text}`}>{value}</p>
            <span className="text-[11px] text-base-content/40">{sub}</span>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PERIODS = [
    { key: "semaine", label: "Semaine",    data: DATA_SEMAINE },
    { key: "mois",    label: "Mois",       data: DATA_MOIS    },
    { key: "annee",   label: "Année",      data: DATA_ANNEE   },
];

export default function AdminRevenuePage() {
    const [period, setPeriod] = useState("mois");

    const currentData = PERIODS.find(p => p.key === period)?.data ?? DATA_MOIS;

    const stats = useMemo(() => {
        const totalAbonnes = currentData.reduce((s, d) => s + d.abonnements, 0);
        const totalDons    = currentData.reduce((s, d) => s + d.dons, 0);
        const revAbonnes   = totalAbonnes * ABONNEMENT_PRICE;
        const total        = revAbonnes + totalDons;
        return { totalAbonnes, totalDons, revAbonnes, total };
    }, [currentData]);

    // Données pour le pie chart répartition
    const pieData = [
        { name: "Abonnements", value: stats.revAbonnes },
        { name: "Dons",        value: stats.totalDons  },
    ];

    // Données revenus (€) pour l'area chart
    const revenueData = currentData.map(d => ({
        label:        d.label,
        abonnements:  d.abonnements * ABONNEMENT_PRICE,
        dons:         d.dons,
    }));

    return (
        <AdminLayout activeId="revenue">
            <style>{`
                .recharts-cartesian-grid line { stroke: oklch(from var(--color-base-content) l c h / 0.08); }
                .recharts-text { fill: oklch(from var(--color-base-content) l c h / 0.45); font-family: system-ui; font-size: 11px; }
                .recharts-legend-item-text { color: oklch(from var(--color-base-content) l c h / 0.6) !important; font-size: 12px; }
            `}</style>

            {/* ── En-tête ── */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-xl font-black font-unbounded tracking-tight text-base-content">Revenus</h2>
                    <p className="text-xs text-base-content/45 mt-0.5">
                        Abonnements Tipeee (3 €/mois) · Dons ponctuels — données de démonstration
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Filtre période */}
                    <div className="flex gap-1">
                        {PERIODS.map(p => (
                            <button
                                key={p.key}
                                onClick={() => setPeriod(p.key)}
                                className={`btn btn-xs font-unbounded ${period === p.key ? "btn-primary" : "btn-ghost border border-base-content/15"}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <button className="btn btn-ghost btn-sm font-unbounded gap-1.5 border border-base-content/15" title="Exporter (bientôt)">
                        <Download size={13} /> Export
                    </button>
                </div>
            </div>

            {/* ── Stat cards ── */}
            <div className="stats-grid">
                <StatCard
                    label="Total revenus"
                    value={fmt(stats.total)}
                    sub={`sur la ${period}`}
                    icon={Euro}
                    bar="bg-primary"
                    text="text-primary"
                />
                <StatCard
                    label="Abonnements"
                    value={fmt(stats.revAbonnes)}
                    sub={`${stats.totalAbonnes} abonnés × 3 €`}
                    icon={Users}
                    bar="bg-secondary"
                    text="text-secondary"
                />
                <StatCard
                    label="Dons ponctuels"
                    value={fmt(stats.totalDons)}
                    sub={`sur la ${period}`}
                    icon={Heart}
                    bar="bg-accent"
                    text="text-accent"
                />
                <StatCard
                    label="Croissance"
                    value={`+${Math.round((stats.total / (stats.total * 0.88) - 1) * 100)}%`}
                    sub="vs période préc."
                    icon={TrendingUp}
                    bar="bg-success"
                    text="text-success"
                />
            </div>

            {/* ── Area chart — évolution revenus ── */}
            <Card>
                <CardHeader title="Évolution des revenus (€)" />
                <div className="p-6">
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={revenueData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradAbonnements" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="oklch(from var(--color-primary) l c h)"   stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="oklch(from var(--color-primary) l c h)"   stopOpacity={0}   />
                                </linearGradient>
                                <linearGradient id="gradDons" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="oklch(from var(--color-accent) l c h)"    stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="oklch(from var(--color-accent) l c h)"    stopOpacity={0}   />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="label" tickLine={false} axisLine={false} dy={8} />
                            <YAxis tickLine={false} axisLine={false} tickFormatter={v => `${v}€`} width={48} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" iconSize={8} />
                            <Area
                                type="monotone"
                                dataKey="abonnements"
                                name="Abonnements"
                                stroke="oklch(from var(--color-primary) l c h)"
                                strokeWidth={2}
                                fill="url(#gradAbonnements)"
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 0 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="dons"
                                name="Dons"
                                stroke="oklch(from var(--color-accent) l c h)"
                                strokeWidth={2}
                                fill="url(#gradDons)"
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 0 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* ── Bar chart + Pie chart ── */}
            <div className="two-col">

                {/* Bar chart — abonnés */}
                <Card>
                    <CardHeader title="Abonnés actifs" />
                    <div className="p-6">
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={currentData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barSize={period === "annee" ? 18 : 28}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" tickLine={false} axisLine={false} dy={8} />
                                <YAxis tickLine={false} axisLine={false} width={32} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    dataKey="abonnements"
                                    name="abonnements"
                                    fill="oklch(from var(--color-secondary) l c h)"
                                    radius={[4, 4, 0, 0]}
                                    fillOpacity={0.85}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Pie chart — répartition */}
                <Card>
                    <CardHeader title="Répartition des revenus" />
                    <div className="p-6 flex flex-col items-center gap-4">
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={52}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    <Cell fill="oklch(from var(--color-primary) l c h)" fillOpacity={0.9} />
                                    <Cell fill="oklch(from var(--color-accent) l c h)"  fillOpacity={0.9} />
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Légende manuelle sous le donut */}
                        <div className="flex gap-6 text-xs">
                            {pieData.map((entry, i) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <span
                                        className="w-3 h-3 rounded-full shrink-0"
                                        style={{ background: i === 0
                                                ? "oklch(from var(--color-primary) l c h)"
                                                : "oklch(from var(--color-accent) l c h)" }}
                                    />
                                    <span className="text-base-content/60">{entry.name}</span>
                                    <span className="font-bold text-base-content">{fmt(entry.value)}</span>
                                    <span className="text-base-content/35">
                                        ({Math.round(entry.value / stats.total * 100)}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            {/* ── Tableau détail ── */}
            <Card>
                <CardHeader title="Détail par période" />
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                        <tr>
                            <th className="px-5 py-3 text-left text-[10px] font-black font-unbounded tracking-widest uppercase whitespace-nowrap bg-base-200/60 border-b border-primary/10 text-primary/85">
                                Période
                            </th>
                            <th className="px-5 py-3 text-left text-[10px] font-black font-unbounded tracking-widest uppercase whitespace-nowrap bg-base-200/60 border-b border-primary/10" style={{ color: "oklch(from var(--color-secondary) l c h / 0.85)" }}>
                                Abonnés
                            </th>
                            <th className="px-5 py-3 text-left text-[10px] font-black font-unbounded tracking-widest uppercase whitespace-nowrap bg-base-200/60 border-b border-primary/10" style={{ color: "oklch(from var(--color-secondary) l c h / 0.85)" }}>
                                Rev. abonnements
                            </th>
                            <th className="px-5 py-3 text-left text-[10px] font-black font-unbounded tracking-widest uppercase whitespace-nowrap bg-base-200/60 border-b border-primary/10" style={{ color: "oklch(from var(--color-accent) l c h / 0.85)" }}>
                                Dons
                            </th>
                            <th className="px-5 py-3 text-left text-[10px] font-black font-unbounded tracking-widest uppercase whitespace-nowrap bg-base-200/60 border-b border-primary/10 text-primary/85">
                                Total
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentData.map((row, i) => {
                            const revAbo = row.abonnements * ABONNEMENT_PRICE;
                            const total  = revAbo + row.dons;
                            return (
                                <tr key={i}>
                                    <td className="px-5 py-3 text-sm font-black font-unbounded text-base-content/70">{row.label}</td>
                                    <td className="px-5 py-3 text-sm">
                                            <span className="flex items-center gap-1.5">
                                                <Users size={11} className="text-secondary/60" />
                                                <span className="font-semibold text-secondary">{row.abonnements}</span>
                                            </span>
                                    </td>
                                    <td className="px-5 py-3 text-sm font-semibold text-base-content/70">{fmt(revAbo)}</td>
                                    <td className="px-5 py-3 text-sm">
                                            <span className="flex items-center gap-1.5">
                                                <Heart size={11} className="text-accent/60" />
                                                <span className="font-semibold text-accent">{fmt(row.dons)}</span>
                                            </span>
                                    </td>
                                    <td className="px-5 py-3 text-sm font-black text-primary">{fmt(total)}</td>
                                </tr>
                            );
                        })}
                        {/* Ligne total */}
                        <tr style={{ borderTop: "2px solid oklch(from var(--color-primary) l c h / 0.15)" }}>
                            <td className="px-5 py-3 text-[11px] font-black font-unbounded uppercase tracking-widest text-base-content/40">Total</td>
                            <td className="px-5 py-3 text-sm font-black text-secondary">{stats.totalAbonnes}</td>
                            <td className="px-5 py-3 text-sm font-black text-base-content/70">{fmt(stats.revAbonnes)}</td>
                            <td className="px-5 py-3 text-sm font-black text-accent">{fmt(stats.totalDons)}</td>
                            <td className="px-5 py-3 text-sm font-black text-primary">{fmt(stats.total)}</td>
                        </tr>
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