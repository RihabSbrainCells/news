import { flagEmoji } from "../lib/countries";

const GRADIENTS = [
  "linear-gradient(135deg, #d6452a, #f59e0b)",
  "linear-gradient(135deg, #2563eb, #d6452a)",
  "linear-gradient(135deg, #1a1714, #d6452a)",
  "linear-gradient(135deg, #f59e0b, #2563eb)",
];

function gradientFor(seed) {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

// Most articles won't have a real cover photo yet — a flat blank space
// reads as broken, so this renders a deterministic gradient + flag
// instead. Swapped automatically once `src` is set on the article.
export default function CoverImage({ src, alt = "", country, className }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} />;
  }
  return (
    <div
      className={`${className || ""} cover-fallback`.trim()}
      style={{ background: gradientFor(country || "x") }}
      aria-hidden="true"
    >
      <span className="cover-fallback__flag">{flagEmoji(country)}</span>
    </div>
  );
}
