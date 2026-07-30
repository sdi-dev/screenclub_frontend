import { useState, useEffect } from "react";
import BlobsBackground from "@components/layout/BlobsBackground.jsx";
import GridBackground from "@components/layout/GridBackground.jsx";
import { getUser } from "@/api/auth.js";
import { fetchAuth } from "@/api/fetchAuth.js";
import { useTheme } from "@/hooks/useTheme.js";

// ─── Hook utilisateur (même logique que Header) ───────────────────────────────
function useCurrentUser() {
    const [user, setUser] = useState(() => getUser());

    const loadFresh = async () => {
        const base = getUser();
        if (!base) return;
        setUser(base);
        try {
            const fresh = await fetchAuth("/api/users/me");
            setUser((prev) => ({ ...prev, ...fresh }));
        } catch { /* silencieux */ }
    };

    useEffect(() => {
        loadFresh();
        const onUpdate = () => { const b = getUser(); if (b) loadFresh(); else setUser(null); };
        window.addEventListener("storage",        onUpdate);
        window.addEventListener("profileUpdated", onUpdate);
        return () => {
            window.removeEventListener("storage",        onUpdate);
            window.removeEventListener("profileUpdated", onUpdate);
        };
    }, []);

    const FALLBACK = "https://placehold.co/120x120/252729/orange?text=?&font=montserrat";
    return { user, avatarUrl: user?.avatar ?? FALLBACK };
}

// ─── Icônes inline ────────────────────────────────────────────────────────────
const Icon = ({ path, size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"
         strokeLinejoin="round" className={className}>
        <path d={path} />
    </svg>
);

const icons = {
    lock:    "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4",
    eye:     "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    eyeOff:  "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22",
    palette: "M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5M8.5 8.5v.01M16 15.5v.01M12 12v.01M11 17v.01M7 14v.01",
    trash:   "M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
    check:   "M20 6L9 17l-5-5",
    alert:   "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
    zap:     "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
};

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { id: "compte",          label: "Compte",          icon: "lock"    },
    { id: "apparence",       label: "Apparence",       icon: "palette" },
    { id: "confidentialite", label: "Confidentialité", icon: "eye"     },
    { id: "danger",          label: "Zone de danger",  icon: "trash", danger: true },
];

// ─── Composants utilitaires ───────────────────────────────────────────────────
function SectionTitle({ icon, title, subtitle }) {
    return (
        <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
                <span className="text-primary"><Icon path={icons[icon]} size={22} /></span>
                <h2 className="text-xl font-unbounded font-black text-base-content tracking-tight">{title}</h2>
            </div>
            {subtitle && <p className="text-base-content/50 text-sm ml-9">{subtitle}</p>}
            <div className="mt-4 h-px bg-gradient-to-r from-primary/30 via-secondary/20 to-transparent" />
        </div>
    );
}

function Field({ label, hint, children }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 py-5 border-b border-base-content/5 last:border-0">
            <div className="sm:w-44 shrink-0">
                <span className="text-sm font-bold text-base-content/70">{label}</span>
                {hint && <p className="text-xs text-base-content/35 mt-0.5 leading-tight">{hint}</p>}
            </div>
            <div className="flex-1">{children}</div>
        </div>
    );
}

function Input({ type = "text", defaultValue, placeholder, disabled }) {
    return (
        <input type={type} defaultValue={defaultValue} placeholder={placeholder} disabled={disabled}
               className={`input input-bordered w-full text-sm bg-base-200/60 focus:border-primary transition-colors
                ${disabled ? "opacity-40 cursor-not-allowed select-none" : ""}`}
        />
    );
}

function Toggle({ defaultChecked = false, label, disabled = false }) {
    const [on, setOn] = useState(defaultChecked);
    return (
        <label className={`flex items-center gap-3 select-none ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}>
            <input type="checkbox" className="toggle toggle-primary toggle-sm"
                   checked={on} disabled={disabled} onChange={() => !disabled && setOn(!on)} />
            {label && <span className="text-sm text-base-content/70">{label}</span>}
        </label>
    );
}

function SaveButton({ label = "Enregistrer" }) {
    const [saved, setSaved] = useState(false);
    return (
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
                className={`btn btn-sm font-bold uppercase tracking-wider transition-all duration-300 ${saved ? "btn-success" : "btn-primary"}`}>
            {saved ? <><Icon path={icons.check} size={14} className="mr-1" />Sauvegardé</> : label}
        </button>
    );
}

// ─── Section Compte ───────────────────────────────────────────────────────────
function SectionCompte() {
    const [showNew,     setShowNew]     = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <div>
            <SectionTitle icon="lock" title="Compte" subtitle="Identifiants et sécurité" />

            {/* Email — grisé, non modifiable */}
            <Field label="Adresse email" hint="Non modifiable">
                <div className="relative">
                    <Input type="email" defaultValue="alex@example.com" disabled />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-base-content/25 uppercase tracking-wider pointer-events-none">
                        Fixe
                    </span>
                </div>
            </Field>

            {/* Pseudo — grisé, non modifiable */}
            <Field label="Nom d'utilisateur" hint="Non modifiable">
                <div className="relative">
                    <Input defaultValue="screenfan42" disabled />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-base-content/25 uppercase tracking-wider pointer-events-none">
                        Fixe
                    </span>
                </div>
                <p className="text-xs text-base-content/30 mt-1.5">
                    screenclub.app/<span className="text-base-content/40">screenfan42</span>
                </p>
            </Field>

            {/* Changer de mot de passe */}
            <Field label="Mot de passe">
                <div className="space-y-2.5">
                    <p className="text-xs font-unbounded font-black text-primary/60 uppercase tracking-widest pb-1">
                        Changer de mot de passe
                    </p>

                    {/* Nouveau mdp */}
                    <div className="relative">
                        <input
                            type={showNew ? "text" : "password"}
                            placeholder="Nouveau mot de passe"
                            className="input input-bordered w-full text-sm bg-base-200/60 focus:border-primary transition-colors pr-10"
                        />
                        <button type="button" onClick={() => setShowNew(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content/70 transition-colors">
                            <Icon path={showNew ? icons.eyeOff : icons.eye} size={15} />
                        </button>
                    </div>

                    {/* Confirmer mdp */}
                    <div className="relative">
                        <input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Confirmer le mot de passe"
                            className="input input-bordered w-full text-sm bg-base-200/60 focus:border-primary transition-colors pr-10"
                        />
                        <button type="button" onClick={() => setShowConfirm(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content/70 transition-colors">
                            <Icon path={showConfirm ? icons.eyeOff : icons.eye} size={15} />
                        </button>
                    </div>
                </div>
            </Field>

            {/* 2FA — grisée, bientôt disponible */}
            <Field label="Double authentification">
                <div className="opacity-40 cursor-not-allowed select-none">
                    <Toggle defaultChecked={false} disabled label="Activer la 2FA" />
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                    <Icon path={icons.zap} size={11} className="text-base-content/30" />
                    <span className="text-xs text-base-content/30">Fonctionnalité à venir — pas encore disponible.</span>
                </div>
            </Field>

            <div className="mt-6 flex justify-end">
                <SaveButton label="Enregistrer" />
            </div>
        </div>
    );
}

// ─── Section Apparence — branchée sur useTheme (même hook que le Header) ──────
function SectionApparence() {
    const { theme, setTheme, themes } = useTheme();

    return (
        <div>
            <SectionTitle icon="palette" title="Apparence" subtitle="Personnalisez votre expérience visuelle" />

            <Field label="Thème de couleur">
                <div className="flex flex-wrap gap-3">
                    {themes.map(t => {
                        const active = theme === t.value;
                        return (
                            <button key={t.value} onClick={() => setTheme(t.value)}
                                    className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200
                                    ${active
                                        ? "border-primary"
                                        : "border-base-content/10 hover:border-base-content/25"
                                    }`}
                                    style={active ? { boxShadow: `0 4px 20px ${t.color}50` } : {}}>
                                {/* Cercle couleur */}
                                <div className="w-10 h-10 rounded-full transition-all duration-200"
                                     style={{
                                         background: t.color,
                                         boxShadow: active ? `0 0 18px ${t.color}99` : "none",
                                     }}
                                />
                                <span className={`text-xs font-bold transition-colors ${active ? "text-primary" : "text-base-content/60"}`}>
                                    {t.label}
                                </span>
                                {/* Badge coche */}
                                {active && (
                                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                        <Icon path={icons.check} size={9} className="text-primary-content" />
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
                <p className="text-xs text-base-content/35 mt-3">
                    Le thème s'applique immédiatement sur toute la plateforme.
                </p>
            </Field>
        </div>
    );
}

// ─── Section Confidentialité ──────────────────────────────────────────────────
function SectionConfidentialite() {
    return (
        <div>
            <SectionTitle icon="eye" title="Confidentialité" subtitle="Contrôlez qui peut voir vos activités" />

            <Field label="Compte public" hint="Visible par tous les utilisateurs">
                <Toggle defaultChecked={true} />
            </Field>

            <Field label="Activité récente" hint="Notes, commentaires, watchlists">
                <select className="select select-bordered w-full text-sm bg-base-200/60 focus:border-primary">
                    <option>Tout le monde</option>
                    <option>Mes abonnés</option>
                    <option>Moi uniquement</option>
                </select>
            </Field>

            <Field label="Watchlists" hint="Vos listes de films à voir">
                <select className="select select-bordered w-full text-sm bg-base-200/60 focus:border-primary">
                    <option>Tout le monde</option>
                    <option>Mes abonnés</option>
                    <option>Moi uniquement</option>
                </select>
            </Field>

            <Field label="Masquer les spoilers" hint="Dans vos critiques et commentaires">
                <Toggle defaultChecked={false} label="Toujours masquer par défaut" />
            </Field>

            <Field label="Apparaître dans les recherches" hint="Votre profil est trouvable">
                <Toggle defaultChecked={true} />
            </Field>

            <Field label="Partage des statistiques" hint="Inclus dans les top membres">
                <Toggle defaultChecked={true} label="Partager mes stats avec la communauté" />
            </Field>

            <div className="mt-6 flex justify-end">
                <SaveButton label="Enregistrer" />
            </div>
        </div>
    );
}

// ─── Modal de confirmation générique ─────────────────────────────────────────
function ConfirmModal({ open, onClose, title, description, confirmWord, buttonLabel, btnClass }) {
    const [text, setText] = useState("");
    if (!open) return null;
    const match = text === confirmWord;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setText(""); onClose(); }} />
            <div className="relative z-10 w-full max-w-md rounded-2xl bg-base-100 border border-error/30 p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-error"><Icon path={icons.alert} size={22} /></span>
                    <h3 className="font-unbounded font-black text-base-content">{title}</h3>
                </div>
                <p className="text-sm text-base-content/60 mb-4">
                    {description}{" "}
                    Tapez <span className="text-error font-mono font-bold">{confirmWord}</span> pour confirmer.
                </p>
                <input type="text" value={text} onChange={e => setText(e.target.value)}
                       placeholder={confirmWord}
                       className="input input-bordered input-error w-full text-sm mb-4 bg-base-200/60"
                />
                <div className="flex gap-3 justify-end">
                    <button className="btn btn-sm btn-ghost uppercase font-bold"
                            onClick={() => { setText(""); onClose(); }}>
                        Annuler
                    </button>
                    <button className={`btn btn-sm uppercase font-black ${btnClass}`}
                            disabled={!match}
                            onClick={() => { setText(""); onClose(); }}>
                        {buttonLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Section Zone de danger ───────────────────────────────────────────────────
function SectionDanger() {
    const [modal, setModal] = useState(null);

    const items = [
        {
            id: "contributions",
            cardBorder: "border-warning/20",
            cardBg:     "bg-warning/5",
            labelColor: "text-base-content/80",
            btnClass:   "btn-warning btn-outline",
            label:      "Supprimer toutes mes contributions",
            desc:       "Supprime définitivement tous vos avis, watchlists et likes. Votre compte reste actif.",
            // modal
            title:       "Supprimer mes contributions",
            description: "Tous vos avis, watchlists et likes seront supprimés de manière permanente. Votre compte restera actif.",
            confirmWord: "supprimer",
            buttonLabel: "Supprimer mes contributions",
            modalBtn:    "btn-warning",
            actionLabel: "Supprimer",
        },
        {
            id: "desactiver",
            cardBorder: "border-warning/20",
            cardBg:     "bg-warning/5",
            labelColor: "text-base-content/80",
            btnClass:   "btn-warning btn-outline",
            label:      "Désactiver le compte",
            desc:       "Votre profil devient invisible. Vous pouvez le réactiver à tout moment en vous reconnectant.",
            // modal
            title:       "Désactiver le compte",
            description: "Votre profil sera masqué de la plateforme jusqu'à votre prochaine connexion.",
            confirmWord: "désactiver",
            buttonLabel: "Désactiver",
            modalBtn:    "btn-warning",
            actionLabel: "Désactiver",
        },
        {
            id: "supprimer",
            cardBorder: "border-error/20",
            cardBg:     "bg-error/5",
            labelColor: "text-error/90",
            btnClass:   "btn-error btn-outline",
            label:      "Supprimer le compte",
            desc:       "Suppression définitive de votre compte et de toutes vos données. Action irréversible.",
            // modal
            title:       "Supprimer le compte",
            description: "Votre compte, vos critiques, notes et watchlists seront supprimés pour toujours.",
            confirmWord: "supprimer",
            buttonLabel: "Supprimer définitivement",
            modalBtn:    "btn-error",
            actionLabel: "Supprimer",
        },
    ];

    const active = items.find(i => i.id === modal);

    return (
        <div>
            <SectionTitle icon="trash" title="Zone de danger" subtitle="Actions irréversibles" />

            <div className="space-y-4">
                {items.map(item => (
                    <div key={item.id}
                         className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border ${item.cardBorder} ${item.cardBg}`}>
                        <div>
                            <p className={`text-sm font-bold ${item.labelColor}`}>{item.label}</p>
                            <p className="text-xs text-base-content/40 mt-0.5">{item.desc}</p>
                        </div>
                        <button className={`btn btn-sm uppercase font-black shrink-0 ${item.btnClass}`}
                                onClick={() => setModal(item.id)}>
                            {item.actionLabel}
                        </button>
                    </div>
                ))}
            </div>

            {active && (
                <ConfirmModal
                    open={!!modal}
                    onClose={() => setModal(null)}
                    title={active.title}
                    description={active.description}
                    confirmWord={active.confirmWord}
                    buttonLabel={active.buttonLabel}
                    btnClass={active.modalBtn}
                />
            )}
        </div>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────────
function Parametres() {
    const [active, setActive] = useState("compte");
    const { user, avatarUrl } = useCurrentUser();

    const SECTIONS = {
        compte:          <SectionCompte />,
        apparence:       <SectionApparence />,
        confidentialite: <SectionConfidentialite />,
        danger:          <SectionDanger />,
    };

    return (
        <div className="relative bg-base-100 min-h-screen">
            <BlobsBackground fixed progress={0.2} />

            <div className="relative" style={{ zIndex: 1 }}>
                {/* Breadcrumb */}
                <header className="border-b border-base-content/8 bg-base-100/80 backdrop-blur-md sticky top-0 z-20">
                    <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <svg className="w-6 h-6" viewBox="0 0 24 24"
                                 fill="oklch(from var(--color-primary) l c h)"
                                 style={{ filter: "drop-shadow(0 0 8px oklch(from var(--color-primary) l c h / 0.7))" }}>
                                <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"/>
                            </svg>
                            <span className="font-unbounded font-black text-base-content text-lg tracking-tight">ScreenClub</span>
                        </div>
                        <span className="text-base-content/20">/</span>
                        <span className="text-sm font-bold text-base-content/50 uppercase tracking-widest">Paramètres</span>
                    </div>
                </header>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* Sidebar */}
                        <aside className="lg:w-56 shrink-0">
                            {/* Mini carte utilisateur */}
                            <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-xl bg-base-200/40 border border-base-content/8">
                                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0"
                                     style={{ boxShadow: "0 0 0 2px oklch(from var(--color-primary) l c h / 0.5)" }}>
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-unbounded font-black text-base-content truncate">
                                        {user?.username ?? "—"}
                                    </p>
                                    <p className="text-xs text-base-content/35 truncate">{user?.email ?? "—"}</p>
                                </div>
                            </div>

                            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 sticky top-20">
                                {NAV_ITEMS.map(item => (
                                    <button key={item.id} onClick={() => setActive(item.id)}
                                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold
                                            transition-all duration-200 whitespace-nowrap
                                            ${active === item.id
                                                ? item.danger
                                                    ? "bg-error/10 text-error border border-error/20"
                                                    : "bg-primary/10 text-primary border border-primary/20"
                                                : item.danger
                                                    ? "text-error/50 hover:bg-error/5 hover:text-error/80 border border-transparent"
                                                    : "text-base-content/50 hover:bg-base-content/5 hover:text-base-content/80 border border-transparent"
                                            }`}>
                                        <Icon path={icons[item.icon]} size={15} />
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </aside>

                        {/* Contenu */}
                        <main className="flex-1 min-w-0">
                            <div className="relative rounded-2xl bg-base-100/60 backdrop-blur-sm border border-base-content/8 p-6 sm:p-8">
                                <GridBackground opacity={0.02} size={50} />
                                <div className="relative z-10">
                                    {SECTIONS[active]}
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Parametres;