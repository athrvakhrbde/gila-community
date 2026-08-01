import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

type Shared = {
  children: string;
  active?: boolean;
  className?: string;
};

type AsAnchor = Shared &
  AnchorHTMLAttributes<HTMLAnchorElement> & { as?: "a" };
type AsButton = Shared &
  ButtonHTMLAttributes<HTMLButtonElement> & { as: "button" };

function PillLabel({ children }: { children: string }) {
  return (
    <>
      <span className="block transition-transform duration-300 ease-augen group-hover/pill:-translate-y-5">
        {children}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-augen translate-y-5 group-hover/pill:translate-y-0"
      >
        {children}
      </span>
    </>
  );
}

export function ExplorePill(props: AsAnchor | AsButton) {
  const { children, active = false, className = "" } = props;
  const base = active ? "pill-filled" : "pill-outline";
  const cls =
    `${base} group/pill relative overflow-hidden ${className}`.trim();

  if (props.as === "button") {
    const { as: _as, children: _c, active: _a, className: _cl, ...rest } = props;
    return (
      <button type="button" className={cls} {...rest}>
        <PillLabel>{children}</PillLabel>
      </button>
    );
  }

  const { as: _as, children: _c, active: _a, className: _cl, ...rest } = props;
  return (
    <a className={cls} {...rest}>
      <PillLabel>{children}</PillLabel>
    </a>
  );
}
