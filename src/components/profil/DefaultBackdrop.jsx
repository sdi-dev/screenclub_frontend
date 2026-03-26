/**
 * DefaultBackdrop
 * Backdrop par défaut — dégradé propre avec une légère texture de lignes diagonales.
 *
 * À placer dans : src/components/profile/DefaultBackdrop.jsx
 */
export default function DefaultBackdrop() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            viewBox="0 0 1400 400"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="db-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%"   stopColor="oklch(from var(--color-primary)   l c h)" stopOpacity="0.35" />
                    <stop offset="50%"  stopColor="oklch(from var(--color-base-300)  l c h)" stopOpacity="1"    />
                    <stop offset="100%" stopColor="oklch(from var(--color-secondary) l c h)" stopOpacity="0.25" />
                </linearGradient>

                <pattern id="db-lines" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                    <line x1="0" y1="0" x2="0" y2="40"
                          stroke="oklch(from var(--color-base-content) l c h)"
                          strokeOpacity="0.04"
                          strokeWidth="1"
                    />
                </pattern>
            </defs>

            {/* Fond base */}
            <rect width="1400" height="400" fill="oklch(from var(--color-base-300) l c h)" />

            {/* Dégradé */}
            <rect width="1400" height="400" fill="url(#db-grad)" />

            {/* Lignes diagonales */}
            <rect width="1400" height="400" fill="url(#db-lines)" />
        </svg>
    );
}