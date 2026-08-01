const LETTER_EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

export function AnimatedText({
  text,
  group = "hover",
}: {
  text: string;
  group?: "hover" | "nav" | "btn";
}) {
  const hoverClass =
    group === "nav"
      ? "group-hover/nav:-translate-y-full"
      : group === "btn"
        ? "group-hover/btn:-translate-y-full"
        : "group-hover:-translate-y-full";

  return (
    <span className="inline-flex" aria-label={text}>
      {text.split("").map((char, i) => (
        <span
          key={`${char}-${i}`}
          className="relative inline-block h-[1em] overflow-hidden align-bottom"
          aria-hidden="true"
        >
          <span
            className={`inline-block transition-transform ${hoverClass}`}
            style={{
              transitionDelay: `${i * 22}ms`,
              transitionDuration: "500ms",
              transitionTimingFunction: LETTER_EASE,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
          <span
            className={`absolute left-0 top-full inline-block transition-transform ${hoverClass}`}
            style={{
              transitionDelay: `${i * 22}ms`,
              transitionDuration: "500ms",
              transitionTimingFunction: LETTER_EASE,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        </span>
      ))}
    </span>
  );
}
