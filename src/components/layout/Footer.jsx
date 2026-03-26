import { Link } from "react-router-dom";

function Footer() {
    return (
        <>
            <footer className="footer sm:footer-horizontal text-base-content p-10 backdrop-blur-md bg-base-200! shadow-primary/50">
                <aside>
                    <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                         style={{
                             background: "radial-gradient(ellipse at center, oklch(from var(--color-primary) l c h / 0.1) 0%, transparent 70%)",
                             border: "1px solid oklch(from var(--color-primary) l c h / 0.2)",
                         }}
                    >
                        {/* Halo de fond */}
                        <div
                            className="absolute inset-0 rounded-2xl pointer-events-none"
                            style={{
                                background: "radial-gradient(ellipse at center, oklch(from var(--color-primary) l c h / 0.07) 0%, transparent 70%)"
                            }}
                        />

                        {/* Étoile 4 branches avec glow */}
                        <svg
                            className="relative z-10 w-8 h-8"
                            style={{ filter: "drop-shadow(0 0 8px oklch(from var(--color-primary) l c h / 0.9))" }}
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path
                                className="text-primary"
                                fill="oklch(from var(--color-primary) l c h)"
                                d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"
                            />
                        </svg>
                    </div>

                    <p>
                        <Link to="/" className="text-2xl text-primary font-bold font-unbounded hover:opacity-80 transition-opacity">ScreenClub</Link>
                        <br/>
                        <span className="font-medium">Pour les fans, par les fans.</span>
                    </p>
                </aside>
                <nav>
                    <h6 className="footer-title text-secondary font-unbounded font-semibold">Plan du site</h6>
                    <Link to="/" className="hover:text-secondary duration-150 transition-colors ease-in-out">Accueil</Link>
                    <Link to="/tendances" className="hover:text-secondary duration-150 transition-colors ease-in-out">Tendances</Link>
                    <Link to="/topavis" className="hover:text-secondary duration-150 transition-colors ease-in-out">Avis</Link>
                    <Link to="/topwatchlists" className="hover:text-secondary duration-150 transition-colors ease-in-out">Watchlists</Link>
                </nav>
                <nav>
                    <h6 className="footer-title text-secondary font-unbounded font-semibold">MyScreenClub</h6>
                    <Link to="/profil" className="hover:text-secondary duration-150 transition-colors ease-in-out">Profil</Link>
                    <Link to="/timeline" className="hover:text-secondary duration-150 transition-colors ease-in-out">Fil d'actu</Link>
                    <Link to="/mes-suivis" className="hover:text-secondary duration-150 transition-colors ease-in-out">Mes suivis</Link>
                    <Link to="/parametres" className="hover:text-secondary duration-150 transition-colors ease-in-out">Paramètres</Link>
                </nav>
                <nav>
                    <h6 className="footer-title text-secondary font-unbounded font-semibold">Legal</h6>
                    <Link to="/legal/mentions-legales" className="hover:text-secondary duration-150 transition-colors ease-in-out">Mentions légales</Link>
                    <Link to="/legal/cgu" className="hover:text-secondary duration-150 transition-colors ease-in-out">Conditions d'utilisation</Link>
                    <Link to="/legal/confidentialite" className="hover:text-secondary duration-150 transition-colors ease-in-out">Confidentialité</Link>
                    <Link to="/legal/rgpd" className="hover:text-secondary duration-150 transition-colors ease-in-out">RGPD</Link>
                </nav>
            </footer>
        </>
    )
}

export default Footer;