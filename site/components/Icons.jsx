// Shared inline SVG icons. Stroke-based and sized in `em` units so they
// inherit color/size from CSS instead of needing per-platform emoji fonts.
function Stroke({ className, ...props }) {
  return (
    <svg
      className={className}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

export function IconGlobe({ className }) {
  return (
    <Stroke className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c3 3.2 3 14.8 0 18" />
      <path d="M12 3c-3 3.2-3 14.8 0 18" />
    </Stroke>
  );
}

export function IconMenu({ className }) {
  return (
    <Stroke className={className}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </Stroke>
  );
}

export function IconSearch({ className }) {
  return (
    <Stroke className={className}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L20 20" />
    </Stroke>
  );
}

export function IconArrowRight({ className }) {
  return (
    <Stroke className={className}>
      <path d="M4 12h16" />
      <path d="M13 5l7 7-7 7" />
    </Stroke>
  );
}

export function IconTrendingUp({ className }) {
  return (
    <Stroke className={className}>
      <path d="M3 17l6-6 4 4 8-9" />
      <path d="M15 6h6v6" />
    </Stroke>
  );
}

export function IconDot({ className }) {
  return (
    <svg
      className={className}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}
