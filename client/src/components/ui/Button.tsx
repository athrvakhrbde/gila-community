import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { AnimatedText } from "./AnimatedText";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

type Base = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
  animated?: boolean;
};
type AsButton = Base & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AsLink = Base & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

const sizes: Record<Size, string> = {
  sm: "px-4 text-sm",
  md: "px-6 text-sm",
  lg: "px-8 text-base",
};

const variants: Record<Variant, string> = {
  primary: "btn-primary group/btn",
  secondary: "btn-secondary group/btn",
  ghost: "btn-ghost",
};

function Label({ animated, children }: { animated?: boolean; children: ReactNode }) {
  if (animated && typeof children === "string") {
    return <AnimatedText text={children} group="btn" />;
  }
  return <>{children}</>;
}

export function Button(props: AsButton | AsLink) {
  const {
    variant = "primary",
    size = "md",
    children,
    className = "",
    // Letter-swap animation is a marketing flourish; off by default for readable product CTAs
    animated = false,
    ...rest
  } = props;
  const cls = `${variants[variant]} ${sizes[size]} ${animated && variant === "primary" ? "is-animated" : ""} ${className}`.trim();
  const label = <Label animated={animated}>{children}</Label>;

  if ("href" in props && props.href) {
    const { href, ...linkRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
    if (href.startsWith("/") && !href.startsWith("//")) {
      return (
        <Link to={href} className={cls} {...linkRest}>
          {label}
        </Link>
      );
    }
    return (
      <a href={href} className={cls} {...linkRest}>
        {label}
      </a>
    );
  }

  const { type = "button", ...btnRest } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={type} className={cls} {...btnRest}>
      {label}
    </button>
  );
}
