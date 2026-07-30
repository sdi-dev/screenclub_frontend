import { useState, useMemo } from "react";
import {
    Search, X, RefreshCw, AlertTriangle, Info,
    AlertCircle, Bug, Filter, Download,
} from "lucide-react";
import AdminLayout, {
    Card, CardHeader, Th, Td, SkeletonRow, ErrorRow,
} from "@components/layout/AdminLayout.jsx";

// ─── Constantes ───────────────────────────────────────────────────────────────

/**
 * Niveaux de log SLF4J.
 * Ordre de sévérité croissante : TRACE → DEBUG → INFO → WARN → ERROR.
 */
const LOG_LEVELS = ["TRACE", "DEBUG", "INFO", "WARN", "ERROR"];

const LEVEL_CONFIG = {
    TRACE: { badge: "badge-ghost",   icon: Bug,           color: "--color-base-content" },
    DEBUG: { badge: "badge-info",    icon: Bug,           color: "--color-info"         },
    INFO:  { badge: "badge-success", icon: Info,          color: "--color-success"      },
    WARN:  { badge: "badge-warning", icon: AlertTriangle, color: "--color-warning"      },
    ERROR: { badge: "badge-error",   icon: AlertCircle,   color: "--color-error"        },
};

/**
 * Structure attendue de chaque document MongoDB (collection `logs`).
 * Mappée depuis l'appender Logback → MongoDB (ex: logback-mongodb-appender).
 *
 * {
 *   _id:        string,       // ObjectId MongoDB
 *   timestamp:  string,       // ISO 8601
 *   level:      "TRACE"|"DEBUG"|"INFO"|"WARN"|"ERROR",
 *   logger:     string,       // ex: "com.screenclub.service.UserService"
 *   message:    string,
 *   thread:     string,       // ex: "http-nio-8080-exec-3"
 *   exception?: string,       // stacktrace si présente
 * }
 *
 * Endpoint prévu : GET /api/admin/logs?level=&logger=&search=&page=&size=
 * Spring controller + MongoRepository<LogEntry, String> à implémenter.
 */

// ─── Mock data (à remplacer par useAdminData(fetchLogs) quand le back sera prêt) ──

const MOCK_LOGS = [
    {
        _id: "6650a1b2c3d4e5f6a7b8c9d0",
        timestamp: "2026-04-04T10:23:41.123Z",
        level: "ERROR",
        logger: "com.screenclub.service.AuthService",
        message: "Échec de l'authentification pour l'utilisateur 'goat42' — token expiré",
        thread: "http-nio-8080-exec-2",
        exception: "io.jsonwebtoken.ExpiredJwtException: JWT expired at 2026-04-04T10:20:00Z",
    },
    {
        _id: "6650a1b2c3d4e5f6a7b8c9d1",
        timestamp: "2026-04-04T10:22:15.004Z",
        level: "WARN",
        logger: "com.screenclub.service.TmdbService",
        message: "Rate limit TMDb atteint — retry dans 5s (tentative 2/3)",
        thread: "scheduling-1",
        exception: null,
    },
    {
        _id: "6650a1b2c3d4e5f6a7b8c9d2",
        timestamp: "2026-04-04T10:21:08.774Z",
        level: "INFO",
        logger: "com.screenclub.service.UserService",
        message: "Nouvel utilisateur inscrit : id=1042, pseudo='camillevernet'",
        thread: "http-nio-8080-exec-7",
        exception: null,
    },
    {
        _id: "6650a1b2c3d4e5f6a7b8c9d3",
        timestamp: "2026-04-04T10:20:55.001Z",
        level: "DEBUG",
        logger: "com.screenclub.repository.ReviewRepository",
        message: "Query exécutée en 42ms : findTop10ByOrderByCreatedAtDesc",
        thread: "http-nio-8080-exec-1",
        exception: null,
    },
    {
        _id: "6650a1b2c3d4e5f6a7b8c9d4",
        timestamp: "2026-04-04T10:19:30.512Z",
        level: "ERROR",
        logger: "com.screenclub.service.AdminService",
        message: "Tentative d'accès non autorisé au dashboard admin — userId=988",
        thread: "http-nio-8080-exec-5",
        exception: "org.springframework.security.access.AccessDeniedException: Access is denied",
    },
    {
        _id: "6650a1b2c3d4e5f6a7b8c9d5",
        timestamp: "2026-04-04T10:18:10.221Z",
        level: "INFO",
        logger: "com.screenclub.scheduler.TmdbSyncJob",
        message: "Synchronisation TMDb terminée — 124 films mis à jour",
        thread: "scheduling-1",
        exception: null,
    },
    {
        _id: "6650a1b2c3d4e5f6a7b8c9d6",
        timestamp: "2026-04-04T10:17:00.003Z",
        level: "TRACE",
        logger: "com.screenclub.security.JwtFilter",
        message: "Token JWT validé pour userId=1042",
        thread: "http-nio-8080-exec-3",
        exception: null,
    },
];

// ─── Sous-composants ──────────────────────────────────────────────────────────

function LevelBadge({ level }) {
    const cfg  = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.INFO;
    const Icon = cfg.icon;
    return (
        <span className={`badge ${cfg.badge} badge-sm font-unbounded text-[10px] gap-1 whitespace-nowrap`}>
            <Icon size={9} />
            {level}
        </span>
    );
}

function LogRow({ log, isExpanded, onToggle }) {
    const cfg = LEVEL_CONFIG[log.level] ?? LEVEL_CONFIG.INFO;
    const time = new Date(log.timestamp).toLocaleTimeString("fr-FR", {
        hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
    const date = new Date(log.timestamp).toLocaleDateString("fr-FR");

    return (
        <>
            <tr
                className="cursor-pointer"
                onClick={onToggle}
                style={isExpanded ? { background: `oklch(from var(${cfg.color}) l c h / 0.06)` } : {}}
            >
                <Td>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-mono font-semibold text-base-content/70">{time}</span>
                        <span className="text-[10px] text-base-content/35">{date}</span>
                    </div>
                </Td>
                <Td><LevelBadge level={log.level} /></Td>
                <Td>
                    <span className="text-[11px] font-mono text-base-content/50 truncate block max-w-[180px]" title={log.logger}>
                        {log.logger.split(".").pop()}
                    </span>
                </Td>
                <Td>
                    <p className="text-xs text-base-content/80 line-clamp-1">{log.message}</p>
                </Td>
                <Td>
                    <span className="text-[10px] font-mono text-base-content/35">{log.thread}</span>
                </Td>
                <Td>
                    {log.exception && (
                        <span className="badge badge-error badge-xs font-unbounded">stack</span>
                    )}
                </Td>
            </tr>
            {/* Ligne détail expandée */}
            {isExpanded && (
                <tr>
                    <td colSpan={6} className="px-5 pb-4 pt-0">
                        <div
                            className="rounded-lg p-4 flex flex-col gap-3 text-xs font-mono"
                            style={{ background: "oklch(from var(--color-base-300) l c h / 0.6)", border: `1px solid oklch(from var(${cfg.color}) l c h / 0.2)` }}
                        >
                            <div>
                                <span className="text-base-content/40 font-sans font-bold uppercase tracking-widest text-[10px]">Logger complet</span>
                                <p className="mt-1 text-base-content/70">{log.logger}</p>
                            </div>
                            <div>
                                <span className="text-base-content/40 font-sans font-bold uppercase tracking-widest text-[10px]">Message</span>
                                <p className="mt-1 text-base-content/80">{log.message}</p>
                            </div>
                            {log.exception && (
                                <div>
                                    <span className="text-base-content/40 font-sans font-bold uppercase tracking-widest text-[10px]">Stack trace</span>
                                    <pre className="mt-1 text-error/80 whitespace-pre-wrap break-all leading-relaxed text-[11px] bg-error/5 rounded p-3">{log.exception}</pre>
                                </div>
                            )}
                            <div className="flex gap-6 text-base-content/40 font-sans text-[10px]">
                                <span>Thread : <span className="font-mono text-base-content/60">{log.thread}</span></span>
                                <span>ID : <span className="font-mono text-base-content/60">{log._id}</span></span>
                                <span>Timestamp : <span className="font-mono text-base-content/60">{log.timestamp}</span></span>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminLogsPage() {
    const [search,      setSearch]      = useState("");
    const [levelFilter, setLevelFilter] = useState("tous");
    const [expandedId,  setExpandedId]  = useState(null);

    // TODO — remplacer MOCK_LOGS par : const logs = useAdminData(fetchLogs);
    // et binder les filtres sur les query params de l'API
    const logs   = { data: MOCK_LOGS, loading: false, error: null };
    const isReal = false; // passer à true quand le back sera prêt

    const filtered = useMemo(() => {
        return logs.data.filter(log => {
            const matchLevel  = levelFilter === "tous" || log.level === levelFilter;
            const matchSearch = !search
                || log.message.toLowerCase().includes(search.toLowerCase())
                || log.logger.toLowerCase().includes(search.toLowerCase());
            return matchLevel && matchSearch;
        });
    }, [logs.data, search, levelFilter]);

    const errorCount = logs.data.filter(l => l.level === "ERROR").length;
    const warnCount  = logs.data.filter(l => l.level === "WARN").length;

    return (
        <AdminLayout activeId="logs">

            {/* ── En-tête ── */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-xl font-black font-unbounded tracking-tight text-base-content">
                        Logs système
                    </h2>
                    <p className="text-xs text-base-content/45 mt-0.5">
                        SLF4J / Logback → MongoDB — collection <span className="font-mono">logs</span>
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Export (placeholder) */}
                    <button className="btn btn-ghost btn-sm font-unbounded gap-1.5 border border-base-content/15" title="Exporter les logs (bientôt)">
                        <Download size={13} /> Export
                    </button>
                    {/* Rafraîchir (placeholder) */}
                    <button className="btn btn-ghost btn-sm btn-circle" title="Rafraîchir">
                        <RefreshCw size={14} />
                    </button>
                </div>
            </div>

            {/* ── Bandeau "données mock" ── */}
            {!isReal && (
                <div role="alert" className="alert alert-info text-xs py-2.5 px-4">
                    <Info size={14} className="shrink-0" />
                    <span>
                        <span className="font-bold">Données de démonstration.</span> Le backend SLF4J → MongoDB n'est pas encore configuré.
                        Brancher <span className="font-mono">fetchLogs</span> dans <span className="font-mono">adminService.js</span> sur
                        <span className="font-mono"> GET /api/admin/logs</span> pour activer les données réelles.
                    </span>
                </div>
            )}

            {/* ── Compteurs rapides ── */}
            <div className="flex gap-3 flex-wrap">
                {[
                    { label: "Total",  value: logs.data.length, color: "--color-base-content" },
                    { label: "Errors", value: errorCount,       color: "--color-error" },
                    { label: "Warns",  value: warnCount,        color: "--color-warning" },
                ].map(s => (
                    <div
                        key={s.label}
                        className="px-4 py-2.5 rounded-lg flex items-center gap-3 bg-base-200 border border-primary/10"
                    >
                        <span className="text-[10px] font-black font-unbounded uppercase tracking-widest text-base-content/45">{s.label}</span>
                        <span className="text-lg font-black font-unbounded" style={{ color: `oklch(from var(${s.color}) l c h)` }}>{s.value}</span>
                    </div>
                ))}
            </div>

            {/* ── Filtres ── */}
            <div className="flex items-center gap-2 flex-wrap">
                <Filter size={13} className="text-base-content/40 shrink-0" />

                {/* Filtre niveau */}
                {["tous", ...LOG_LEVELS].map(lvl => (
                    <button
                        key={lvl}
                        onClick={() => setLevelFilter(lvl)}
                        className={`btn btn-xs font-unbounded ${
                            levelFilter === lvl
                                ? lvl === "tous" ? "btn-primary" : `badge ${LEVEL_CONFIG[lvl]?.badge ?? "badge-ghost"} border-0 rounded-lg px-3 py-1 h-auto`
                                : "btn-ghost border border-base-content/15"
                        }`}
                    >
                        {lvl === "tous" ? "Tous" : lvl}
                    </button>
                ))}

                {/* Recherche message / logger */}
                <label className="input input-xs input-bordered flex items-center gap-2 w-52 ml-auto">
                    <Search size={12} className="text-base-content/40 shrink-0" />
                    <input
                        type="text"
                        placeholder="Message, logger…"
                        className="grow font-sans"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="cursor-pointer text-base-content/30 hover:text-base-content/60">
                            <X size={11} />
                        </button>
                    )}
                </label>
            </div>

            {/* ── Tableau ── */}
            <Card>
                <CardHeader
                    title={`${filtered.length} entrée${filtered.length > 1 ? "s" : ""}${levelFilter !== "tous" ? ` · ${levelFilter}` : ""}${search ? ` · "${search}"` : ""}`}
                    action="Cliquer une ligne pour voir les détails"
                />
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead><tr>
                            <Th>Horodatage</Th>
                            <Th colorVar="--color-secondary">Niveau</Th>
                            <Th>Logger</Th>
                            <Th colorVar="--color-secondary">Message</Th>
                            <Th>Thread</Th>
                            <Th colorVar="--color-error">Stack</Th>
                        </tr></thead>
                        <tbody>
                        {logs.loading && [0,1,2,3,4].map(i => <SkeletonRow key={i} cols={6} />)}
                        {logs.error && <ErrorRow cols={6} message="Impossible de charger les logs." />}
                        {!logs.loading && !logs.error && filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-5 py-10 text-center font-unbounded text-sm text-base-content/30">
                                    Aucun log correspondant
                                </td>
                            </tr>
                        )}
                        {!logs.loading && !logs.error && filtered.map(log => (
                            <LogRow
                                key={log._id}
                                log={log}
                                isExpanded={expandedId === log._id}
                                onToggle={() => setExpandedId(prev => prev === log._id ? null : log._id)}
                            />
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