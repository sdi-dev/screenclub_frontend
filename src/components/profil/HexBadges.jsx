import {useState} from "react";

export default function HexBadge({ emoji, tooltip, gradient, glow }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div className="relative shrink-0"
             onMouseEnter={() => setHovered(true)}
             onMouseLeave={() => setHovered(false)}>
            <div
                className="w-8 h-9 sm:w-9 sm:h-10 flex items-center justify-center text-base sm:text-lg cursor-default transition-transform duration-200"
                style={{
                    background: gradient,
                    clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                    boxShadow: hovered ? `0 0 14px ${glow}` : "none",
                    transform: hovered ? "scale(1.12)" : "scale(1)",
                    filter: hovered ? `drop-shadow(0 0 6px ${glow})` : "none",
                }}>
                {emoji}
            </div>
            {hovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
                     style={{ whiteSpace: "nowrap" }}>
                    <div className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-white max-w-45 text-center"
                         style={{
                             background: "oklch(from var(--color-base-300) l c h / 0.95)",
                             border: "1px solid oklch(from var(--color-primary) l c h / 0.3)",
                             boxShadow: "0 4px 16px oklch(0% 0 0 / 0.5)",
                             whiteSpace: "normal",
                         }}>
                        {tooltip}
                    </div>
                    <div className="w-2 h-2 mx-auto -mt-1 rotate-45"
                         style={{ background: "oklch(from var(--color-base-300) l c h / 0.95)" }} />
                </div>
            )}
        </div>
    );
}