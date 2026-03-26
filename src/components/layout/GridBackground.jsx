function GridBackground({ opacity = 0.04, size = 60 }) {
    return (
        <div
            className="absolute inset-0 pointer-events-none"
            style={{
                opacity,
                backgroundImage: `
                    linear-gradient(oklch(from var(--color-base-content) l c h) 1px, transparent 1px),
                    linear-gradient(90deg, oklch(from var(--color-base-content) l c h) 1px, transparent 1px)
                `,
                backgroundSize: `${size}px ${size}px`,
            }}
        />
    );
}

export default GridBackground;