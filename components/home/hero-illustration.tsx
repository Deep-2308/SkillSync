/**
 * Abstract "network graph" illustration for the hero.
 *
 * Pure inline SVG (no image request), themed with brand colors via
 * currentColor-independent stops. Nodes gently pulse; edges are drawn with a
 * soft gradient. Decorative only, hence aria-hidden.
 */
export function HeroIllustration({ className }: { className?: string }) {
  // Node coordinates for a loose constellation.
  const nodes = [
    { cx: 90, cy: 70, r: 10 },
    { cx: 210, cy: 40, r: 7 },
    { cx: 320, cy: 110, r: 12 },
    { cx: 160, cy: 160, r: 9 },
    { cx: 280, cy: 210, r: 8 },
    { cx: 70, cy: 220, r: 7 },
    { cx: 200, cy: 260, r: 11 },
    { cx: 360, cy: 60, r: 6 },
  ];

  // Edges as pairs of node indices.
  const edges: Array<[number, number]> = [
    [0, 1],
    [1, 2],
    [0, 3],
    [3, 4],
    [2, 4],
    [3, 6],
    [5, 3],
    [4, 6],
    [1, 7],
    [7, 2],
  ];

  return (
    <svg
      viewBox="0 0 420 300"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-brand)" />
          <stop offset="100%" stopColor="var(--color-brand-green)" />
        </linearGradient>
        <radialGradient id="nodeGrad">
          <stop offset="0%" stopColor="var(--color-brand-green)" />
          <stop offset="100%" stopColor="var(--color-brand)" />
        </radialGradient>
      </defs>

      {/* Edges */}
      <g stroke="url(#edgeGrad)" strokeWidth="1.5" strokeOpacity="0.5">
        {edges.map(([a, b], i) => {
          const from = nodes[a]!;
          const to = nodes[b]!;
          return (
            <line key={i} x1={from.cx} y1={from.cy} x2={to.cx} y2={to.cy} />
          );
        })}
      </g>

      {/* Nodes — staggered pulse via inline animationDelay */}
      <g fill="url(#nodeGrad)">
        {nodes.map((n, i) => (
          <circle
            key={i}
            cx={n.cx}
            cy={n.cy}
            r={n.r}
            className="animate-float"
            style={{ animationDelay: `${i * 0.4}s`, transformOrigin: "center" }}
          />
        ))}
      </g>
    </svg>
  );
}
