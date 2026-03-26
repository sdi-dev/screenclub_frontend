import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {login, register} from "@/api/auth";

// Regex mot de passe : 12 car. min, 1 maj, 1 min, 1 chiffre ou caractère spécial
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{12,}$/;

function AuthModal({ isOpen, onClose }) {

    const [error, setError]               = useState("");
    const [loading, setLoading]           = useState(false);
    const [mode, setMode]                 = useState("login");
    const [displayedMode, setDisplayedMode] = useState("login");
    const [transitioning, setTransitioning] = useState(false);
    const [form, setForm] = useState({
        identifier: "", // email OU pseudo (connexion)
        email: "",      // email uniquement (inscription)
        password: "",
        username: "",
        confirm: "",
        birthDate: "",
    });
    const timeoutRef = useRef(null);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    async function handleSubmit() {
        setError("");
        setLoading(true);

        try {
            if (displayedMode === "login") {
                await login(form.identifier, form.password);
                onClose();

            } else {
                // Validations inscription côté client
                if (!PASSWORD_REGEX.test(form.password)) {
                    setError("Le mot de passe doit contenir au moins 12 caractères, une majuscule, une minuscule et un chiffre ou caractère spécial.");
                    return;
                }
                if (form.password !== form.confirm) {
                    setError("Les mots de passe ne correspondent pas.");
                    return;
                }
                await register(form.username, form.email, form.password, form.birthDate);
                switchMode("login");
                setError("");
            }
        } catch (err) {
            // Sécurise l'affichage : on vérifie que c'est bien une string
            const msg = err?.message || err?.toString?.() || "Une erreur est survenue.";
            setError(typeof msg === "string" && msg.trim() ? msg : "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (mode === displayedMode) return;
        setError(""); // reset erreur au changement de mode
        setTransitioning(true);
        timeoutRef.current = setTimeout(() => {
            setDisplayedMode(mode);
            setTransitioning(false);
        }, 200);
        return () => clearTimeout(timeoutRef.current);
    }, [mode]);

    const switchMode = (m) => { if (m !== mode) setMode(m); };

    if (!isOpen) return null;

    return createPortal(
        <>
            <style>{`
                @keyframes backdropIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes modalIn {
                    from { opacity: 0; transform: translateY(24px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes formIn {
                    from { opacity: 0; transform: translateX(12px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes formOut {
                    from { opacity: 1; transform: translateX(0); }
                    to   { opacity: 0; transform: translateX(-12px); }
                }
                .auth-backdrop { animation: backdropIn 0.25s ease both; }
                .auth-modal    { animation: modalIn 0.35s cubic-bezier(.22,1,.36,1) both; }
                .form-enter    { animation: formIn  0.22s cubic-bezier(.22,1,.36,1) both; }
                .form-exit     { animation: formOut 0.18s ease both; pointer-events: none; }
            `}</style>

            <div
                className="auth-backdrop fixed inset-0 z-999 flex items-center justify-center p-4"
                style={{ background: "oklch(0% 0 0 / 0.65)" }}
                onClick={onClose}
            >
                <div
                    className="auth-modal relative w-full max-w-md rounded-3xl border border-base-content/10 shadow-2xl overflow-y-auto max-h-[90dvh] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    style={{
                        background: "oklch(from var(--color-base-200) l c h / 0.55)",
                        backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Halo décoratif */}
                    <div
                        className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
                        style={{ background: "radial-gradient(circle, oklch(from var(--color-primary) l c h / 0.12) 0%, transparent 70%)" }}
                    />

                    <div className="relative z-10 p-8">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-base-content tracking-tight">
                                    {displayedMode === "login" ? "Bon retour 👋" : "Rejoins le club 🎬"}
                                </h2>
                                <p className="text-sm text-base-content/50 mt-1">
                                    {displayedMode === "login"
                                        ? "Connecte-toi à ton compte ScreenClub"
                                        : "Crée ton compte en quelques secondes"}
                                </p>
                            </div>
                            <button className="btn btn-ghost btn-sm btn-circle text-base-content/50" onClick={onClose}>✕</button>
                        </div>

                        {/* Toggle */}
                        <div className="flex rounded-xl p-1 mb-8" style={{ background: "oklch(from var(--color-base-300) l c h / 0.6)" }}>
                            {["login", "register"].map((m) => (
                                <button key={m} onClick={() => switchMode(m)}
                                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                                            mode === m ? "bg-primary text-primary-content shadow" : "text-base-content/50 hover:text-base-content"
                                        }`}>
                                    {m === "login" ? "Connexion" : "Inscription"}
                                </button>
                            ))}
                        </div>

                        {/* Formulaire */}
                        <div className={`flex flex-col gap-4 ${transitioning ? "form-exit" : "form-enter"}`}>

                            {/* ── CONNEXION ── */}
                            {displayedMode === "login" && (<>
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend text-base-content/60 text-xs">
                                        Email ou pseudo
                                    </legend>
                                    <input
                                        type="text"
                                        name="identifier"
                                        value={form.identifier}
                                        onChange={handleChange}
                                        placeholder="cinephile42 ou toi@exemple.com"
                                        autoComplete="username"
                                        className="input w-full bg-base-100/40 border-base-content/10 focus:border-primary"
                                        required="true"
                                        aria-required="true"
                                    />
                                </fieldset>

                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend text-base-content/60 text-xs">
                                        Mot de passe
                                    </legend>
                                    <input
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="••••••••••••"
                                        autoComplete="current-password"
                                        className="input w-full bg-base-100/40 border-base-content/10 focus:border-primary"
                                        required="true"
                                        aria-required="true"
                                    />
                                </fieldset>

                                <div className="text-right -mt-1">
                                    <a className="link link-primary text-xs">Mot de passe oublié ?</a>
                                </div>
                            </>)}

                            {/* ── INSCRIPTION ── */}
                            {displayedMode === "register" && (<>
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend text-base-content/60 text-xs">Nom d'utilisateur</legend>
                                    <input
                                        type="text"
                                        name="username"
                                        value={form.username}
                                        onChange={handleChange}
                                        placeholder="cinephile42"
                                        minLength={3}
                                        maxLength={24}
                                        pattern="[a-zA-Z0-9_]+"
                                        autoComplete="username"
                                        className="input w-full bg-base-100/40 border-base-content/10 focus:border-primary"
                                        required="true"
                                        aria-required="true"
                                    />
                                    <p className="label text-base-content/35 text-[11px] mt-1">
                                        3 à 24 caractères — lettres, chiffres et _ uniquement
                                    </p>
                                </fieldset>

                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend text-base-content/60 text-xs">Adresse e-mail</legend>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="toi@exemple.com"
                                        autoComplete="email"
                                        className="input w-full bg-base-100/40 border-base-content/10 focus:border-primary"
                                        required="true"
                                        aria-required="true"
                                    />
                                </fieldset>

                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend text-base-content/60 text-xs">Mot de passe</legend>
                                    <input
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="••••••••••••"
                                        autoComplete="new-password"
                                        className="input w-full bg-base-100/40 border-base-content/10 focus:border-primary"
                                        required="true"
                                        aria-required="true"
                                    />
                                    <p className="label text-base-content/35 text-[11px] mt-1">
                                        12 caractères min. — 1 majuscule, 1 minuscule, 1 chiffre ou symbole
                                    </p>
                                </fieldset>

                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend text-base-content/60 text-xs">Confirmer le mot de passe</legend>
                                    <input
                                        type="password"
                                        name="confirm"
                                        value={form.confirm}
                                        onChange={handleChange}
                                        placeholder="••••••••••••"
                                        autoComplete="new-password"
                                        className="input w-full bg-base-100/40 border-base-content/10 focus:border-primary"
                                        required="true"
                                        aria-required="true"
                                    />
                                    <p className="label text-base-content/35 text-[11px] mt-1">
                                        Doit être identique au mot de passe ci-dessus
                                    </p>
                                </fieldset>

                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend text-base-content/60 text-xs">Date de naissance</legend>
                                    <input
                                        type="date"
                                        name="birthDate"
                                        value={form.birthDate}
                                        onChange={handleChange}
                                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split("T")[0]}
                                        autoComplete="bday"
                                        className="input w-full bg-base-100/40 border-base-content/10 focus:border-primary"
                                        required="true"
                                        aria-required="true"
                                    />
                                    <p className="label text-base-content/35 text-[11px] mt-1">
                                        Tu dois avoir au moins 13 ans pour t'inscrire
                                    </p>
                                </fieldset>
                            </>)}

                            {/* Alerte erreur — glassmorphism */}
                            {error ? (
                                <div
                                    role="alert"
                                    className="flex items-start gap-3 rounded-xl border border-error/25 p-3 text-sm"
                                    style={{
                                        background: "oklch(from var(--color-error) l c h / 0.12)",
                                        backdropFilter: "blur(12px)",
                                        WebkitBackdropFilter: "blur(12px)",
                                    }}
                                >
                                    <svg className="w-4 h-4 shrink-0 mt-0.5 text-error" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                    </svg>
                                    <span className="text-error/90">{error}</span>
                                </div>
                            ) : null}

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="btn btn-primary btn-block mt-2 shadow-lg"
                            >
                                {loading
                                    ? <span className="loading loading-spinner loading-sm" />
                                    : displayedMode === "login" ? "Se connecter" : "Créer mon compte"
                                }
                            </button>
                        </div>

                        {/* Footer */}
                        <p className="text-center text-xs text-base-content/30 mt-6">
                            {displayedMode === "login" ? "Pas encore de compte ? " : "Déjà un compte ? "}
                            <button
                                className="link link-primary font-semibold"
                                onClick={() => switchMode(mode === "login" ? "register" : "login")}
                            >
                                {displayedMode === "login" ? "S'inscrire" : "Se connecter"}
                            </button>
                        </p>

                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}

export default AuthModal;