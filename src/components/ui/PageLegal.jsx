import GridBackground from "@components/layout/GridBackground.jsx";

/**
 * PageLegal — Composant générique pour les pages de conformité légale.
 *
 * Props :
 * @param {string}   title        — Titre principal (ex: "Mentions légales")
 * @param {string}   description  — Courte accroche sous le titre
 * @param {string}   lastUpdated  — Date de mise à jour (ex: "20 mars 2025")
 * @param {Array}    sections     — Tableau de { id?, heading, content (string | JSX) }
 *                                   Génère automatiquement une table des matières.
 * @param {ReactNode} children    — Alternatif à `sections` : JSX libre injecté dans le bloc.
 *
 * Usage avec sections :
 *   <PageLegal
 *     title="Mentions légales"
 *     description="Informations légales relatives à l'exploitation du site."
 *     lastUpdated="20 mars 2025"
 *     sections={[
 *       { heading: "Éditeur du site", content: "..." },
 *       { heading: "Hébergement", content: "..." },
 *     ]}
 *   />
 *
 * Usage avec children (contenu JSX libre) :
 *   <PageLegal title="RGPD" description="...">
 *     <h2>Vos droits</h2>
 *     <p>...</p>
 *   </PageLegal>
 */

function PageLegal({ title = "Page légale", description = "", lastUpdated, sections, children }) {

    const hasSections = Array.isArray(sections) && sections.length > 0;

    // Génère un id slug depuis un heading si non fourni
    const slug = (str) =>
        str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const enriched = hasSections
        ? sections.map((s, i) => ({ ...s, id: s.id ?? `section-${slug(s.heading)}-${i}` }))
        : [];

    return (
        <>
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeLeft {
                    from { opacity: 0; transform: translateX(-20px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes glowPulse {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50%      { opacity: 0.75; transform: scale(1.05); }
                }

                .pl-header   { animation: fadeUp  0.6s cubic-bezier(.22,1,.36,1) 0.1s both; }
                .pl-divider  { animation: fadeUp  0.5s cubic-bezier(.22,1,.36,1) 0.25s both; }
                .pl-toc      { animation: fadeLeft 0.7s cubic-bezier(.22,1,.36,1) 0.3s both; }
                .pl-body     { animation: fadeUp  0.7s cubic-bezier(.22,1,.36,1) 0.4s both; }
                .pl-blob     { animation: glowPulse 6s ease-in-out infinite; }

                /* TOC link active */
                .pl-toc-link {
                    position: relative;
                    transition: color 0.2s, padding-left 0.2s;
                }
                .pl-toc-link::before {
                    content: "";
                    position: absolute;
                    left: -1px;
                    top: 50%;
                    transform: translateY(-50%) scaleY(0);
                    height: 70%;
                    width: 2px;
                    background: oklch(from var(--color-primary) l c h);
                    border-radius: 2px;
                    transition: transform 0.2s cubic-bezier(.22,1,.36,1);
                }
                .pl-toc-link:hover::before { transform: translateY(-50%) scaleY(1); }
                .pl-toc-link:hover { padding-left: 8px; color: oklch(from var(--color-primary) l c h); }

                /* Section headings */
                .pl-section-heading {
                    scroll-margin-top: 5rem;
                }

                /* Legal prose */
                .pl-prose { line-height: 1.85; }
                .pl-prose p  { margin-bottom: 1rem; }
                .pl-prose ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
                .pl-prose a  {
                    color: oklch(from var(--color-primary) l c h);
                    text-decoration: underline;
                    text-underline-offset: 3px;
                }
                .pl-prose a:hover { color: oklch(from var(--color-secondary) l c h); }
            `}</style>

            <section className="relative min-h-screen bg-base-100 overflow-hidden px-4 sm:px-6">

                <GridBackground />

                {/* Blobs décoratifs */}
                <div className="absolute inset-0 pointer-events-none">
                    <div
                        className="pl-blob absolute -top-40 left-1/4 w-96 h-96 rounded-full"
                        style={{ background: "radial-gradient(circle, oklch(from var(--color-primary) l c h / 0.08) 0%, transparent 70%)" }}
                    />
                    <div
                        className="pl-blob absolute bottom-0 right-1/4 w-80 h-80 rounded-full"
                        style={{ background: "radial-gradient(circle, oklch(from var(--color-secondary) l c h / 0.06) 0%, transparent 70%)", animationDelay: "3s" }}
                    />
                </div>

                <div className="relative z-10 w-full max-w-6xl mx-auto py-24 lg:py-32">

                    {/* ── En-tête ── */}
                    <header className="pl-header mb-10 lg:mb-14">

                        {/* Fil d'ariane / label */}
                        <div className="flex items-center gap-2 mb-4">
                            <svg
                                className="w-4 h-4 shrink-0"
                                style={{ color: "oklch(from var(--color-primary) l c h)" }}
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"/>
                            </svg>
                            <span
                                className="text-xs font-unbounded font-black uppercase tracking-widest"
                                style={{ color: "oklch(from var(--color-primary) l c h)" }}
                            >
                                ScreenClub — Légal
                            </span>
                        </div>

                        <h1 className="text-4xl lg:text-6xl font-unbounded font-black text-base-content tracking-tight leading-tight mb-4">
                            {title}
                        </h1>

                        {description && (
                            <p className="text-base lg:text-lg text-base-content/70 max-w-2xl font-medium leading-relaxed">
                                {description}
                            </p>
                        )}

                        {lastUpdated && (
                            <p className="mt-3 text-sm text-base-content/40 font-unbounded">
                                Dernière mise à jour : {lastUpdated}
                            </p>
                        )}
                    </header>

                    {/* ── Séparateur lumineux ── */}
                    <div className="pl-divider mb-10 lg:mb-14">
                        <div
                            className="h-px w-full"
                            style={{
                                background: "linear-gradient(to right, oklch(from var(--color-primary) l c h / 0.6), oklch(from var(--color-secondary) l c h / 0.3), transparent)"
                            }}
                        />
                    </div>

                    {/* ── Layout deux colonnes (TOC + Contenu) ── */}
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">

                        {/* ── Table des matières (sticky) ── */}
                        {hasSections && (
                            <aside className="pl-toc lg:sticky lg:top-24 shrink-0 w-full lg:w-56 xl:w-64">
                                <p
                                    className="text-xs font-unbounded font-black uppercase tracking-widest mb-4"
                                    style={{ color: "oklch(from var(--color-primary) l c h)" }}
                                >
                                    Sommaire
                                </p>
                                <nav>
                                    <ul
                                        className="space-y-1 border-l"
                                        style={{ borderColor: "oklch(from var(--color-base-content) l c h / 0.12)" }}
                                    >
                                        {enriched.map((s) => (
                                            <li key={s.id}>
                                                <a
                                                    href={`#${s.id}`}
                                                    className="pl-toc-link block pl-4 py-1 text-sm text-base-content/50 font-medium"
                                                >
                                                    {s.heading}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>
                            </aside>
                        )}

                        {/* ── Bloc de contenu légal ── */}
                        <main className="pl-body flex-1 min-w-0">
                            <div
                                className="rounded-2xl p-8 lg:p-10 pl-prose text-base-content/80 text-sm lg:text-base"
                                style={{
                                    background: "oklch(from var(--color-base-200) l c h / 0.5)",
                                    border: "1px solid oklch(from var(--color-base-content) l c h / 0.08)",
                                    backdropFilter: "blur(8px)",
                                    boxShadow: "0 4px 40px oklch(0% 0 0 / 0.2)",
                                }}
                            >
                                {hasSections
                                    ? enriched.map((s, i) => (
                                        <article key={s.id} className={i > 0 ? "mt-10 pt-10 border-t" : ""} style={{ borderColor: "oklch(from var(--color-base-content) l c h / 0.08)" }}>
                                            <h2
                                                id={s.id}
                                                className="pl-section-heading text-xl lg:text-2xl font-unbounded font-black text-base-content mb-4"
                                            >
                                                <span
                                                    className="mr-2 text-sm font-unbounded"
                                                    style={{ color: "oklch(from var(--color-primary) l c h)" }}
                                                >
                                                    {String(i + 1).padStart(2, "0")}.
                                                </span>
                                                {s.heading}
                                            </h2>
                                            <div className="pl-prose">
                                                {typeof s.content === "string"
                                                    ? <p>{s.content}</p>
                                                    : s.content
                                                }
                                            </div>
                                        </article>
                                    ))
                                    : <div className="pl-prose">{children}</div>
                                }
                            </div>

                            {/* Footer légal */}
                            <p className="mt-6 text-xs text-base-content/30 text-center font-medium">
                                © {new Date().getFullYear()} ScreenClub — Tous droits réservés.
                            </p>
                        </main>

                    </div>
                </div>
            </section>
        </>
    );
}

export default PageLegal;