import { useState } from "react";
import GridBackground from "@components/layout/GridBackground.jsx";
import BlobsBackground from "@components/layout/BlobsBackground.jsx";
import ReviewCard from "@components/ui/media/ReviewCard.jsx";
import { Heart, TrendingUp, Calendar, Flame } from "lucide-react";

// ─── Données vides — branchement API à venir ───────────────────────────────
// TODO: useQuery({ queryKey: ['top-avis', 'week'], queryFn: () => fetch('/api/avis/top?period=week&limit=10').then(r => r.json()) })
const TOP_AVIS = []; // sera remplacé par les données API

// ─── Semaine courante (sera fournie par l'API ou calculée côté client) ──────
function getCurrentWeekLabel() {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + 1);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (d) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
    return `${fmt(start)} — ${fmt(end)} ${end.getFullYear()}`;
}

// ─── Médaille podium ──────────────────────────────────────────────────────
function RankMedal({ rank }) {
    const medals = {
        1: { emoji: "🥇", color: "oklch(from var(--color-warning) l c h)" },
        2: { emoji: "🥈", color: "oklch(from var(--color-base-content) l c h / 0.5)" },
        3: { emoji: "🥉", color: "oklch(from var(--color-accent) l c h)" },
    };
    const m = medals[rank];
    if (!m) return null;
    return (
        <span className="text-lg leading-none" title={`#${rank}`}>{m.emoji}</span>
    );
}

// ─── Numéro de rang — display oversized ──────────────────────────────────
function RankNumber({ rank, featured = false }) {
    return (
        <span
            className="font-unbounded font-black select-none leading-none tabular-nums"
            style={{
                fontSize: featured ? "clamp(5rem, 12vw, 9rem)" : "clamp(3rem, 6vw, 5rem)",
                color: "oklch(from var(--color-base-content) l c h / 0.06)",
                letterSpacing: "-0.04em",
                lineHeight: 1,
            }}
        >
            {String(rank).padStart(2, "0")}
        </span>
    );
}

// ─── Card Featured — rang #1 ──────────────────────────────────────────────
function FeaturedCard({ review, rank }) {
    return (
        <div
            className="relative overflow-hidden rounded-2xl"
            style={{
                background: "oklch(from var(--color-base-200) l c h / 0.75)",
                border: "1px solid oklch(from var(--color-primary) l c h / 0.25)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 0 0 1px oklch(from var(--color-primary) l c h / 0.08), 0 24px 64px oklch(0% 0 0 / 0.35), 0 0 80px oklch(from var(--color-primary) l c h / 0.08)",
            }}
        >
            {/* Glow ambiant derrière */}
            <div className="absolute inset-0 pointer-events-none"
                 style={{ background: "radial-gradient(ellipse at 20% 50%, oklch(from var(--color-primary) l c h / 0.1) 0%, transparent 60%)" }} />

            {/* Numéro géant en fond */}
            <div className="absolute -bottom-4 -right-4 pointer-events-none select-none">
                <RankNumber rank={rank} featured />
            </div>

            <div className="relative p-6 lg:p-8">
                {/* Label winner */}
                <div className="flex items-center gap-3 mb-6">
                    <span className="flex items-center gap-2 text-[10px] font-black font-unbounded uppercase tracking-widest px-3 py-1.5 rounded-full"
                          style={{
                              background: "oklch(from var(--color-warning) l c h / 0.15)",
                              color: "oklch(from var(--color-warning) l c h)",
                              border: "1px solid oklch(from var(--color-warning) l c h / 0.3)",
                          }}>
                        <Flame size={10} />
                        Meilleur avis de la semaine
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-base-content/40">
                        <Heart size={11} className="fill-current text-error/60" />
                        <span className="font-bold">{review.likeCount}</span> likes
                    </span>
                </div>

                {/* ReviewCard intégré */}
                <ReviewCard review={review} index={0} />
            </div>
        </div>
    );
}

// ─── Card Podium — rangs #2 et #3 ────────────────────────────────────────
function PodiumCard({ review, rank }) {
    return (
        <div
            className="relative overflow-hidden rounded-xl flex flex-col"
            style={{
                background: "oklch(from var(--color-base-200) l c h / 0.6)",
                border: "1px solid oklch(from var(--color-base-content) l c h / 0.1)",
                backdropFilter: "blur(14px)",
            }}
        >
            {/* Numéro en fond */}
            <div className="absolute -bottom-2 -right-2 pointer-events-none select-none">
                <RankNumber rank={rank} />
            </div>

            <div className="relative p-5">
                <div className="flex items-center gap-2 mb-4">
                    <RankMedal rank={rank} />
                    <span className="text-[10px] font-black font-unbounded uppercase tracking-widest text-base-content/35">
                        #{rank}
                    </span>
                    <span className="ml-auto flex items-center gap-1 text-xs text-base-content/35">
                        <Heart size={10} className="fill-current text-error/50" />
                        <span className="font-bold">{review.likeCount}</span>
                    </span>
                </div>
                <ReviewCard review={review} index={rank - 1} />
            </div>
        </div>
    );
}

// ─── Ligne compacte — rangs #4–#10 ────────────────────────────────────────
function CompactRow({ review, rank }) {
    const [open, setOpen] = useState(false);

    return (
        <div
            className="group relative overflow-hidden rounded-xl transition-all duration-300"
            style={{
                background: open
                    ? "oklch(from var(--color-base-200) l c h / 0.7)"
                    : "oklch(from var(--color-base-200) l c h / 0.35)",
                border: "1px solid oklch(from var(--color-base-content) l c h / 0.08)",
                backdropFilter: "blur(8px)",
            }}
        >
            {/* Barre de rang colorée à gauche */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
                 style={{ background: "oklch(from var(--color-primary) l c h / 0.3)" }} />

            {/* Ligne cliquable */}
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left cursor-pointer"
            >
                {/* Numéro */}
                <span className="font-unbounded font-black tabular-nums shrink-0 w-8 text-right"
                      style={{
                          fontSize: "1.5rem",
                          color: "oklch(from var(--color-base-content) l c h / 0.12)",
                          letterSpacing: "-0.04em",
                      }}>
                    {rank}
                </span>

                {/* Avatar */}
                <div className="avatar shrink-0">
                    <div className="w-9 rounded-full ring-1 ring-base-content/15">
                        <img src={review.avatar} alt={review.user}
                             onError={e => { e.target.src = "https://placehold.co/40x40/252729/orange?text=?&font=montserrat"; }} />
                    </div>
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-base-content truncate">{review.user}</p>
                    <p className="text-xs text-base-content/40 truncate mt-0.5 leading-snug">
                        {review.text?.slice(0, 80)}…
                    </p>
                </div>

                {/* Likes + note + toggle */}
                <div className="flex items-center gap-3 shrink-0">
                    <span className="flex items-center gap-1 text-xs text-base-content/35">
                        <Heart size={10} className="fill-current text-error/50" />
                        <span className="font-bold">{review.likeCount}</span>
                    </span>
                    {review.rating != null && (
                        <span className="font-unbounded font-black text-xs px-2 py-1 rounded-lg"
                              style={{
                                  background: "oklch(from var(--color-primary) l c h / 0.12)",
                                  color: "oklch(from var(--color-primary) l c h)",
                              }}>
                            {review.rating}
                        </span>
                    )}
                    <span className="text-base-content/25 text-xs transition-transform duration-200"
                          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
                        ▾
                    </span>
                </div>
            </button>

            {/* Expand — ReviewCard complet */}
            {open && (
                <div className="px-5 pb-5 pt-1 border-t border-base-content/[0.06]">
                    <ReviewCard review={review} index={rank - 1} />
                </div>
            )}
        </div>
    );
}

// ─── Empty state ───────────────────────────────────────────────────────────
function EmptyTopAvis() {
    return (
        <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="relative mb-8">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl"
                     style={{
                         background: "oklch(from var(--color-primary) l c h / 0.08)",
                         border: "1px solid oklch(from var(--color-primary) l c h / 0.18)",
                         boxShadow: "0 0 48px oklch(from var(--color-primary) l c h / 0.08)",
                     }}>
                    🏆
                </div>
                {/* Satellites */}
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                     style={{ background: "oklch(from var(--color-warning) l c h / 0.15)", border: "1px solid oklch(from var(--color-warning) l c h / 0.3)" }}>
                    ⭐
                </div>
                <div className="absolute -bottom-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs"
                     style={{ background: "oklch(from var(--color-secondary) l c h / 0.15)", border: "1px solid oklch(from var(--color-secondary) l c h / 0.3)" }}>
                    ❤️
                </div>
            </div>

            <p className="font-black font-unbounded text-base text-base-content mb-3">
                Pas encore d'avis cette semaine
            </p>
            <p className="text-sm text-base-content/40 max-w-sm leading-relaxed mb-8">
                Le classement se remplit au fil des likes. Revenez en cours de semaine — ou soyez le premier à noter quelque chose.
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
                <button className="btn btn-primary font-black font-unbounded uppercase tracking-widest text-xs"
                        style={{ boxShadow: "0 0 18px oklch(from var(--color-primary) l c h / 0.3)" }}>
                    Explorer le catalogue →
                </button>
                <button className="btn btn-ghost font-unbounded font-black uppercase tracking-widest text-xs"
                        style={{ border: "1px solid oklch(from var(--color-base-content) l c h / 0.12)" }}>
                    Voir les avis récents
                </button>
            </div>
        </div>
    );
}

// ─── Page principale ───────────────────────────────────────────────────────
export default function TopAvis() {
    const weekLabel = getCurrentWeekLabel();

    const featured  = TOP_AVIS[0]       ?? null;
    const podium    = TOP_AVIS.slice(1, 3);
    const rest      = TOP_AVIS.slice(3, 10);
    const isEmpty   = TOP_AVIS.length === 0;

    return (
        <>
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(18px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .ta-hero   { animation: fadeUp 0.55s cubic-bezier(.22,1,.36,1) 0.05s both; }
                .ta-feat   { animation: fadeUp 0.6s  cubic-bezier(.22,1,.36,1) 0.18s both; }
                .ta-podium { animation: fadeUp 0.6s  cubic-bezier(.22,1,.36,1) 0.30s both; }
                .ta-list   { animation: fadeUp 0.6s  cubic-bezier(.22,1,.36,1) 0.42s both; }
            `}</style>

            <div className="relative min-h-screen" style={{ background: "var(--color-base-100)" }}>
                <BlobsBackground fixed={false} />
                <GridBackground opacity={0.035} size={60} />

                <div className="relative z-10 max-w-4xl mx-auto px-4 pb-20">

                    {/* ── Hero header ───────────────────────────────────────── */}
                    <header className="ta-hero pt-16 pb-12">
                        <div className="flex items-start justify-between flex-wrap gap-4">
                            <div>
                                {/* Label éditorial */}
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp size={13} style={{ color: "oklch(from var(--color-primary) l c h)" }} />
                                    <span className="text-[10px] font-black font-unbounded uppercase tracking-[0.2em]"
                                          style={{ color: "oklch(from var(--color-primary) l c h)" }}>
                                        Classement hebdomadaire
                                    </span>
                                </div>

                                {/* Titre */}
                                <h1 className="font-unbounded font-black text-base-content leading-[1.05] mb-3"
                                    style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", letterSpacing: "-0.03em" }}>
                                    Top{" "}
                                    <span style={{
                                        color: "oklch(from var(--color-primary) l c h)",
                                        filter: "drop-shadow(0 0 12px oklch(from var(--color-primary) l c h / 0.5))",
                                    }}>
                                        Avis
                                    </span>
                                </h1>

                                {/* Sous-titre semaine */}
                                <p className="flex items-center gap-2 text-xs text-base-content/40 font-medium">
                                    <Calendar size={11} />
                                    {weekLabel}
                                </p>
                            </div>

                            {/* Compteur total */}
                            {!isEmpty && (
                                <div className="text-right shrink-0"
                                     style={{
                                         background: "oklch(from var(--color-base-200) l c h / 0.6)",
                                         border: "1px solid oklch(from var(--color-base-content) l c h / 0.1)",
                                         backdropFilter: "blur(10px)",
                                         borderRadius: "0.75rem",
                                         padding: "0.75rem 1.25rem",
                                     }}>
                                    <p className="font-unbounded font-black text-2xl text-base-content"
                                       style={{ filter: "drop-shadow(0 0 8px oklch(from var(--color-primary) l c h / 0.3))" }}>
                                        {TOP_AVIS.length}
                                    </p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/35 font-unbounded mt-0.5">
                                        avis classés
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Ligne décorative */}
                        <div className="mt-8 h-px"
                             style={{ background: "linear-gradient(90deg, oklch(from var(--color-primary) l c h / 0.4) 0%, transparent 70%)" }} />
                    </header>

                    {/* ── Contenu ───────────────────────────────────────────── */}
                    {isEmpty ? (
                        <EmptyTopAvis />
                    ) : (
                        <div className="flex flex-col gap-8">

                            {/* #1 — Featured */}
                            {featured && (
                                <div className="ta-feat">
                                    <FeaturedCard review={featured} rank={1} />
                                </div>
                            )}

                            {/* #2–#3 — Podium */}
                            {podium.length > 0 && (
                                <div className="ta-podium grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {podium.map((review, i) => (
                                        <PodiumCard key={review.id} review={review} rank={i + 2} />
                                    ))}
                                </div>
                            )}

                            {/* Séparateur entre podium et liste */}
                            {rest.length > 0 && (
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-px"
                                         style={{ background: "oklch(from var(--color-base-content) l c h / 0.08)" }} />
                                    <span className="text-[10px] font-black font-unbounded uppercase tracking-widest text-base-content/25">
                                        Suite du classement
                                    </span>
                                    <div className="flex-1 h-px"
                                         style={{ background: "oklch(from var(--color-base-content) l c h / 0.08)" }} />
                                </div>
                            )}

                            {/* #4–#10 — Liste compacte */}
                            {rest.length > 0 && (
                                <div className="ta-list flex flex-col gap-2">
                                    {rest.map((review, i) => (
                                        <CompactRow key={review.id} review={review} rank={i + 4} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}