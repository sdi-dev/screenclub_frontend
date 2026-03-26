// ─────────────────────────────────────────────────────────────────────────────
// FavoriButton.jsx  —  bouton cœur à importer dans MediaInfo
// ─────────────────────────────────────────────────────────────────────────────
// Intégration dans MediaInfo.jsx :
//
//   import FavoriButton from "@components/ui/FavoriButton.jsx";
//
//   // Dans le JSX, là où tu places les boutons d'action (ex : à côté du titre
//   // ou dans la barre d'actions) :
//   <FavoriButton
//       utilisateurId={utilisateurId}   // récupéré depuis ton context/auth
//       tmdbId={id}                     // prop reçue par MediaInfo
//       tmdbType={type}                 // prop reçue par MediaInfo
//   />
// ─────────────────────────────────────────────────────────────────────────────

import { Heart } from "lucide-react";
import { useMediaLike } from "@hooks/useMediaLike.js";

/**
 * @param {number|null} utilisateurId  ID de l'utilisateur connecté
 * @param {number}      tmdbId         ID TMDB du média
 * @param {string}      tmdbType       "movie" | "tv"
 * @param {"sm"|"md"|"lg"} [size]      Taille du bouton (défaut : "md")
 */
export default function FavoriButton({ utilisateurId, tmdbId, tmdbType, size = "md" }) {
    const { favori, loading, checked, toggle } = useMediaLike(utilisateurId, tmdbId, tmdbType);

    // Tailles
    const sizes = {
        sm: { btn: "w-8 h-8",   icon: 14 },
        md: { btn: "w-10 h-10", icon: 18 },
        lg: { btn: "w-12 h-12", icon: 22 },
    };
    const { btn, icon } = sizes[size] ?? sizes.md;

    // Si non connecté : on affiche le bouton mais désactivé avec tooltip
    const disabled = !utilisateurId || loading || !checked;

    return (
        <div className="relative group/fav">
            <button
                onClick={toggle}
                disabled={disabled}
                aria-label={favori ? "Retirer des favoris" : "Ajouter aux favoris"}
                className={`
                    ${btn}
                    flex items-center justify-center
                    rounded-full transition-all duration-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60
                    ${disabled && !loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
                style={{
                    background: favori
                        ? "oklch(from var(--color-error) l c h / 0.15)"
                        : "oklch(from var(--color-base-300) l c h / 0.80)",
                    border: favori
                        ? "1.5px solid oklch(from var(--color-error) l c h / 0.55)"
                        : "1.5px solid oklch(from var(--color-base-content) l c h / 0.15)",
                    backdropFilter: "blur(8px)",
                    boxShadow: favori
                        ? "0 0 18px oklch(from var(--color-error) l c h / 0.35)"
                        : "none",
                }}
            >
                {loading ? (
                    /* Spinner minimaliste */
                    <span
                        className="block rounded-full border-2 border-t-transparent animate-spin"
                        style={{
                            width:  icon * 0.75,
                            height: icon * 0.75,
                            borderColor: "oklch(from var(--color-error) l c h / 0.6)",
                            borderTopColor: "transparent",
                        }}
                    />
                ) : (
                    <Heart
                        size={icon}
                        strokeWidth={2}
                        className="transition-all duration-200"
                        style={{
                            fill:   favori ? "oklch(from var(--color-error) l c h)" : "transparent",
                            color:  favori
                                ? "oklch(from var(--color-error) l c h)"
                                : "oklch(from var(--color-base-content) l c h / 0.55)",
                            transform: favori ? "scale(1.15)" : "scale(1)",
                            filter: favori
                                ? "drop-shadow(0 0 6px oklch(from var(--color-error) l c h / 0.7))"
                                : "none",
                        }}
                    />
                )}
            </button>

            {/* Tooltip */}
            {checked && (
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
                                opacity-0 group-hover/fav:opacity-100 transition-opacity duration-150"
                     style={{ whiteSpace: "nowrap" }}>
                    <div className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-base-content/90"
                         style={{
                             background: "oklch(from var(--color-base-300) l c h / 0.95)",
                             border: "1px solid oklch(from var(--color-primary) l c h / 0.25)",
                             boxShadow: "0 4px 16px oklch(0% 0 0 / 0.4)",
                         }}>
                        {!utilisateurId
                            ? "Connecte-toi pour ajouter aux favoris"
                            : favori
                                ? "Retirer des favoris"
                                : "Ajouter aux favoris"}
                    </div>
                    <div className="w-2 h-2 mx-auto -mt-1 rotate-45"
                         style={{ background: "oklch(from var(--color-base-300) l c h / 0.95)" }} />
                </div>
            )}
        </div>
    );
}