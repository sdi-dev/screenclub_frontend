import { useState } from "react";
import GridBackground from "@components/layout/GridBackground.jsx";
import { register } from "@/api/auth.js";

// Même règle que dans AuthModal
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{12,}$/;

const BIRTH_DATE_MAX = new Date(new Date().setFullYear(new Date().getFullYear() - 13))
    .toISOString().split("T")[0];

function CtaForm() {
    const [form, setForm] = useState({
        username: "", email: "", password: "", confirm: "", birthDate: "",
    });
    const [error, setError]     = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setError("");
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    async function handleSubmit() {
        setError("");

        if (!PASSWORD_REGEX.test(form.password)) {
            setError("Le mot de passe doit contenir au moins 12 caractères, une majuscule, une minuscule et un chiffre ou caractère spécial.");
            return;
        }
        if (form.password !== form.confirm) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }
        if (!form.birthDate) {
            setError("La date de naissance est requise.");
            return;
        }

        setLoading(true);
        try {
            await register(form.username, form.email, form.password, form.birthDate);
            setSuccess(true);
            setForm({ username: "", email: "", password: "", confirm: "", birthDate: "" });
        } catch (err) {
            const msg = err?.message || err?.toString?.() || "Une erreur est survenue.";
            setError(typeof msg === "string" && msg.trim() ? msg : "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <style>{`
                @keyframes borderGlow {
                    0%, 100% { box-shadow: 0 0 0px oklch(from var(--color-primary) l c h / 0); }
                    50%      { box-shadow: 0 0 24px oklch(from var(--color-primary) l c h / 0.25); }
                }
                @keyframes successIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .cta-form      { animation: borderGlow 4s ease-in-out infinite; }
                .cta-card-left { animation: borderGlow 4s ease-in-out 2s infinite; }
                .cta-success   { animation: successIn 0.4s cubic-bezier(.22,1,.36,1) both; }
            `}</style>

            <section id="cta" className="relative py-20 px-6 overflow-hidden">

                <GridBackground />

                <h2
                    className="text-4xl font-unbounded lg:text-5xl font-black text-center text-base-content mb-12 tracking-tight"
                    style={{ filter: "drop-shadow(0 0 20px oklch(from var(--color-primary) l c h / 0.25))" }}
                >
                    Rejoindre le{" "}
                    <span
                        className="text-primary"
                        style={{ filter: "drop-shadow(0 0 12px oklch(from var(--color-primary) l c h / 0.7))" }}
                    >
                        club
                    </span>
                </h2>

                <div className="relative z-10 max-w-4xl mx-auto flex flex-col lg:flex-row gap-6">

                    {/* ── Colonne gauche — bénéfices ── */}
                    <div className="flex flex-col gap-3 w-full lg:w-56 shrink-0">
                        <div
                            className="cta-card-left rounded-2xl border border-primary/20 p-5 flex flex-col items-center justify-center gap-2 text-center min-h-28"
                            style={{
                                background: "oklch(from var(--color-base-200) l c h / 0.5)",
                                backdropFilter: "blur(16px)",
                                WebkitBackdropFilter: "blur(16px)",
                            }}
                        >
                            <div className="flex items-center gap-1">
                                <svg
                                    className="relative z-10 w-8 h-8"
                                    style={{ filter: "drop-shadow(0 0 8px oklch(from var(--color-primary) l c h / 0.9))" }}
                                    viewBox="0 0 24 24" fill="currentColor"
                                >
                                    <path fill="oklch(from var(--color-primary) l c h)"
                                          d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" />
                                </svg>
                                <h2 className="text-primary font-unbounded font-bold">ScreenClub</h2>
                            </div>
                            <p className="text-xs text-base-content/50">Pour les fans, par les fans.</p>
                        </div>

                        {[
                            {
                                bg: "oklch(from var(--color-red-500) l c h / 0.12)",
                                glow: "oklch(from var(--color-red-500) l c h / 0.5)",
                                textColor: "oklch(from var(--color-red-500) l c h)",
                                icon: (
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                    </svg>
                                ),
                                label: "Likez vos œuvres favorites",
                            },
                            {
                                bg: "oklch(from var(--color-amber-500) l c h / 0.12)",
                                glow: "oklch(from var(--color-amber-500) l c h / 0.5)",
                                textColor: "oklch(from var(--color-amber-500) l c h)",
                                icon: (
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="9" cy="7" r="4"/><circle cx="17" cy="9" r="3"/>
                                        <path d="M1 21v-2a7 7 0 0 1 11.08-5.72M16 21v-2a5 5 0 0 0-3-4.58"/>
                                    </svg>
                                ),
                                label: "Découvrez une communauté passionnée",
                            },
                            {
                                bg: "oklch(from var(--color-emerald-500) l c h / 0.1)",
                                glow: "oklch(from var(--color-emerald-500) l c h / 0.4)",
                                textColor: "oklch(from var(--color-emerald-500) l c h)",
                                icon: (
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                                        <polyline points="16 7 22 7 22 13"/>
                                    </svg>
                                ),
                                label: "Restez au courant des dernières sorties",
                            },
                        ].map(({ bg, glow, textColor, icon, label }, i) => (
                            <div
                                key={i}
                                className="rounded-2xl border border-base-content/8 p-4 flex items-center gap-3 transition-all duration-300 hover:border-primary/30"
                                style={{
                                    background: "oklch(from var(--color-base-200) l c h / 0.4)",
                                    backdropFilter: "blur(12px)",
                                    WebkitBackdropFilter: "blur(12px)",
                                }}
                            >
                                <div
                                    className="rounded-xl p-2 shrink-0"
                                    style={{ background: bg, color: textColor, filter: `drop-shadow(0 0 6px ${glow})` }}
                                >
                                    {icon}
                                </div>
                                <span className="text-sm text-base-content/70 font-medium leading-tight">{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* ── Formulaire d'inscription ── */}
                    <div
                        className="cta-form flex-1 rounded-2xl border border-primary/25 p-8"
                        style={{
                            background: "oklch(from var(--color-base-200) l c h / 0.4)",
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                        }}
                    >
                        {success ? (
                            /* ── Message de succès ── */
                            <div className="cta-success flex flex-col items-center justify-center gap-4 py-10 text-center">
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center"
                                    style={{
                                        background: "oklch(from var(--color-primary) l c h / 0.15)",
                                        boxShadow: "0 0 32px oklch(from var(--color-primary) l c h / 0.3)",
                                    }}
                                >
                                    <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xl font-black text-base-content mb-1">Bienvenue dans le club !</p>
                                    <p className="text-sm text-base-content/50">
                                        Ton compte a été créé. Tu peux maintenant te connecter.
                                    </p>
                                </div>
                                <button
                                    className="btn btn-primary font-bold uppercase mt-2"
                                    onClick={() => setSuccess(false)}
                                >
                                    Se connecter
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-5">

                                {[
                                    { name: "username",  label: "NOM D'UTILISATEUR",          type: "text",     placeholder: "cinephile42",    hint: "3 à 24 caractères — lettres, chiffres et _ uniquement" },
                                    { name: "email",     label: "ADRESSE EMAIL",               type: "email",    placeholder: "bourvil@email.fr" },
                                    { name: "password",  label: "MOT DE PASSE",                type: "password", placeholder: "••••••••••••",   hint: "12 car. min. — 1 majuscule, 1 minuscule, 1 chiffre ou symbole" },
                                    { name: "confirm",   label: "CONFIRMATION MOT DE PASSE",   type: "password", placeholder: "••••••••••••" },
                                    { name: "birthDate", label: "DATE DE NAISSANCE",           type: "date",     hint: "Tu dois avoir au moins 13 ans pour t'inscrire" },
                                ].map(({ name, label, type, placeholder, hint }) => (
                                    <fieldset key={name} className="fieldset gap-1">
                                        <legend
                                            className="fieldset-legend text-xs font-bold tracking-widest uppercase"
                                            style={{
                                                color: "oklch(from var(--color-primary) l c h)",
                                                filter: "drop-shadow(0 0 6px oklch(from var(--color-primary) l c h / 0.5))",
                                            }}
                                        >
                                            {label}
                                        </legend>
                                        <input
                                            type={type}
                                            name={name}
                                            value={form[name]}
                                            onChange={handleChange}
                                            placeholder={placeholder}
                                            {...(name === "username" ? { minLength: 3, maxLength: 24, pattern: "[a-zA-Z0-9_]+" } : {})}
                                            {...(name === "birthDate" ? { max: BIRTH_DATE_MAX } : {})}
                                            autoComplete={
                                                name === "email"     ? "email"        :
                                                    name === "username"  ? "username"     :
                                                        name === "password"  ? "new-password" :
                                                            name === "confirm"   ? "new-password" :
                                                                name === "birthDate" ? "bday"         : undefined
                                            }
                                            className="input w-full border-base-content/10 focus:border-primary/60 transition-all duration-200"
                                            style={{ background: "oklch(from var(--color-base-300) l c h / 0.7)" }}
                                        />
                                        {hint && (
                                            <p className="text-[11px] text-base-content/35 mt-0.5">{hint}</p>
                                        )}
                                    </fieldset>
                                ))}

                                {/* Erreur */}
                                {error && (
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
                                )}

                                <div className="flex justify-end mt-2">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="btn btn-primary font-bold tracking-widest uppercase text-sm px-8"
                                        style={{ boxShadow: "0 0 20px oklch(from var(--color-primary) l c h / 0.35)" }}
                                    >
                                        {loading
                                            ? <span className="loading loading-spinner loading-sm" />
                                            : "S'inscrire"
                                        }
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}

export default CtaForm;