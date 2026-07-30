import { useState } from "react";
import { Heart } from "lucide-react";
import { toggleLikeAvis } from "@api/Avis";
import { StarRatingSmall } from "@components/ui/media/MediaInfoComponents.jsx";
import koalaFallback from "@images/koala_win7.png";

// Palettes cycliques : chaque avis pioche dans une couleur DaisyUI différente
const CARD_ACCENTS = [
    {
        border:   "border-l-primary",
        ring:     "ring-primary/40",
        dot:      "bg-primary",
        readMore: "text-primary/70 hover:text-primary",
        badge:    "bg-primary/10 text-primary border-primary/20",
        glowVar:  "--color-primary",
    },
    {
        border:   "border-l-secondary",
        ring:     "ring-secondary/40",
        dot:      "bg-secondary",
        readMore: "text-secondary/70 hover:text-secondary",
        badge:    "bg-secondary/10 text-secondary border-secondary/20",
        glowVar:  "--color-secondary",
    },
    {
        border:   "border-l-accent",
        ring:     "ring-accent/40",
        dot:      "bg-accent",
        readMore: "text-accent/70 hover:text-accent",
        badge:    "bg-accent/10 text-accent border-accent/20",
        glowVar:  "--color-accent",
    },
    {
        border:   "border-l-info",
        ring:     "ring-info/40",
        dot:      "bg-info",
        readMore: "text-info/70 hover:text-info",
        badge:    "bg-info/10 text-info border-info/20",
        glowVar:  "--color-info",
    },
];

const IconFlag = () => (
    <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-hidden="true"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18M3 7l9-4 9 4v8l-9 4-9-4V7z" />
    </svg>
);

/**
 * Carte d'avis ScreenClub — colorée selon l'index pour varier visuellement.
 *
 * @param {Object}    props
 * @param {Object}    props.review    — { id, user, avatar, date, rating, text, likeCount }
 * @param {number}    [props.index]   — position dans la liste, pour cycler les couleurs
 * @param {Function}  [props.onReport] — si fourni, affiche le bouton signalement
 */
export default function ReviewCard({ review, index = 0, onReport }) {
    const [expanded,  setExpanded]  = useState(false);
    const [liked,     setLiked]     = useState(false);
    const [likeCount, setLikeCount] = useState(review.likeCount ?? 0);

    const accent  = CARD_ACCENTS[index % CARD_ACCENTS.length];
    const isLong  = review.text?.length > 300;

    const ratingColor =
        review.rating == null ? "" :
            review.rating >= 4    ? "text-success" :
                review.rating >= 3    ? "text-warning"  : "text-error";

    const handleLike = async () => {
        const wasLiked = liked;
        setLiked(!wasLiked);
        setLikeCount((c) => wasLiked ? c - 1 : c + 1);
        try {
            await toggleLikeAvis(review.id);
        } catch {
            setLiked(wasLiked);
            setLikeCount((c) => wasLiked ? c + 1 : c - 1);
        }
    };

    return (
        <div
            className={`relative rounded-box overflow-hidden border border-base-300 border-l-4 ${accent.border} bg-base-200 hover:border-opacity-80 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg`}
            style={{ background: `linear-gradient(135deg, oklch(from var(${accent.glowVar}) l c h / 0.07) 0%, transparent 55%)` }}
        >
            <div className="p-5 flex flex-col gap-3">

                {/* En-tête : avatar + pseudo + date + note */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="avatar">
                            <div className={`w-10 rounded-full ring-2 ${accent.ring} ring-offset-1 ring-offset-base-200`}>
                                <img
                                    src={review.avatar}
                                    alt={review.user}
                                    onError={(e) => { e.target.src = koalaFallback; }}
                                />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-base-content leading-tight">{review.user}</p>
                            <p className="text-[10px] text-base-content/40 font-unbounded mt-0.5">{review.date}</p>
                        </div>
                    </div>

                    {/* Badge note */}
                    {review.rating != null && (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${accent.badge}`}>
                            <span className={`font-unbounded font-black text-sm ${ratingColor}`}>
                                {review.rating}
                            </span>
                            <StarRatingSmall value={review.rating} />
                        </div>
                    )}
                </div>

                {/* Séparateur décoratif */}
                <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${accent.dot}`} />
                    <div className="flex-1 h-px bg-base-300" />
                </div>

                {/* Corps du texte */}
                {review.text ? (
                    <p className="text-sm text-base-content/75 leading-relaxed">
                        {isLong && !expanded ? `${review.text.slice(0, 300)}…` : review.text}
                    </p>
                ) : (
                    <p className="text-xs text-base-content/30 italic font-unbounded">Aucun commentaire.</p>
                )}

                {/* Pied : lire la suite + signalement + like */}
                <div className="flex items-center justify-between mt-1">
                    {isLong ? (
                        <button
                            onClick={() => setExpanded((e) => !e)}
                            className={`text-xs font-unbounded transition-colors ${accent.readMore}`}
                        >
                            {expanded ? "↑ Voir moins" : "Lire la suite →"}
                        </button>
                    ) : (
                        <span />
                    )}

                    <div className="flex items-center gap-3">
                        {onReport && (
                            <button
                                onClick={onReport}
                                className="flex items-center gap-1 text-xs text-base-content/25 hover:text-warning transition-colors"
                                title="Signaler cet avis"
                                aria-label="Signaler cet avis"
                            >
                                <IconFlag />
                            </button>
                        )}

                        <button
                            onClick={handleLike}
                            className="flex items-center gap-1.5 text-xs text-base-content/40 hover:text-error transition-colors group"
                            title={liked ? "Retirer le like" : "Liker cet avis"}
                            aria-label={liked ? "Retirer le like" : "Liker cet avis"}
                        >
                            <Heart
                                className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${
                                    liked ? "fill-error text-error" : "fill-none"
                                }`}
                            />
                            {likeCount > 0 && (
                                <span className={liked ? "text-error" : ""}>{likeCount}</span>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}