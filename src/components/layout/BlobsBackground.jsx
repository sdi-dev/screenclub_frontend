/**
 * BlobsBackground
 *
 * Props :
 *  - fixed    {boolean} — si true, position: fixed sur toute la page (usage dans Home.jsx)
 *                         si false (défaut), position: absolute dans le parent
 *  - progress {number}  — 0..1, avancement du scroll pour animer position/opacité
 *                         ignoré si fixed=false
 */
function BlobsBackground({ fixed = false, progress = 0 }) {
    const lerp = (a, b, t) => a + (b - a) * t;

    const positionClass = fixed ? "fixed" : "absolute";

    if (!fixed) {
        // Comportement original — blobs locaux dans leur section
        return (
            <div className={`${positionClass} inset-0 pointer-events-none`}>
                <div
                    className="cta-blob absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, oklch(from var(--color-primary) l c h / 0.1) 0%, transparent 70%)",
                        filter: "blur(40px)",
                    }}
                />
                <div
                    className="cta-blob absolute -bottom-24 left-0 w-[400px] h-[400px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, oklch(from var(--color-secondary) l c h / 0.07) 0%, transparent 70%)",
                        filter: "blur(40px)",
                        animationDelay: "2s",
                    }}
                />
            </div>
        );
    }

    // Mode fixed — blobs globaux qui traversent toute la page avec le scroll
    return (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
            {/* Blob primary — haut droite */}
            <div style={{
                position: "absolute",
                opacity: lerp(0.55, 0.2, progress),
                top: `${lerp(-8, 20, progress)}%`,
                right: `${lerp(15, 5, progress)}%`,
                width: `${lerp(520, 380, progress)}px`,
                height: `${lerp(520, 380, progress)}px`,
                borderRadius: "50%",
                background: "radial-gradient(circle, oklch(from var(--color-primary) l c h / 0.28) 0%, oklch(from var(--color-primary) l c h / 0.1) 50%, transparent 70%)",
                filter: "blur(50px)",
                transition: "opacity 0.8s ease, top 0.8s ease, right 0.8s ease, width 0.8s ease, height 0.8s ease",
            }} />

            {/* Blob secondary — bas gauche */}
            <div style={{
                position: "absolute",
                opacity: lerp(0.45, 0.18, progress),
                bottom: `${lerp(-6, 5, progress)}%`,
                left: `${lerp(20, 8, progress)}%`,
                width: `${lerp(460, 340, progress)}px`,
                height: `${lerp(460, 340, progress)}px`,
                borderRadius: "50%",
                background: "radial-gradient(circle, oklch(from var(--color-secondary) l c h / 0.24) 0%, oklch(from var(--color-secondary) l c h / 0.08) 50%, transparent 70%)",
                filter: "blur(45px)",
                transition: "opacity 0.8s ease, bottom 0.8s ease, left 0.8s ease, width 0.8s ease, height 0.8s ease",
            }} />

            {/* Blob accent — centre, apparaît en cours de scroll */}
            <div style={{
                position: "absolute",
                opacity: lerp(0, 0.28, Math.min(progress * 2, 1)),
                top: "40%",
                left: "50%",
                width: "380px",
                height: "380px",
                borderRadius: "50%",
                transform: "translate(-50%, -50%)",
                background: "radial-gradient(circle, oklch(from var(--color-accent) l c h / 0.2) 0%, transparent 70%)",
                filter: "blur(60px)",
                transition: "opacity 0.8s ease",
            }} />

            {/* Blob primary petit — haut gauche */}
            <div style={{
                position: "absolute",
                opacity: lerp(0.3, 0.08, progress),
                top: `${lerp(8, 30, progress)}%`,
                left: `${lerp(25, 15, progress)}%`,
                width: "220px",
                height: "220px",
                borderRadius: "50%",
                background: "radial-gradient(circle, oklch(from var(--color-primary) l c h / 0.2) 0%, transparent 70%)",
                filter: "blur(30px)",
                transition: "opacity 0.8s ease, top 0.8s ease, left 0.8s ease",
            }} />
        </div>
    );
}

export default BlobsBackground;