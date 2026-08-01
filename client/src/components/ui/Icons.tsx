type IconProps = {
  className?: string;
  title?: string;
};

export function HeartIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`reaction-icon ${className}`}
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M12 20.25s-6.75-4.08-9.15-8.1C1.2 9.3 2.1 5.85 5.25 4.8c1.8-.6 3.75.15 4.95 1.65C11.4 4.95 13.35 4.2 15.15 4.8c3.15 1.05 4.05 4.5 2.4 7.35-2.4 4.02-9.15 8.1-9.15 8.1Z"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeartIconFilled({ className = "", title }: IconProps) {
  return (
    <svg
      className={`reaction-icon ${className}`}
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M12 20.25s-6.75-4.08-9.15-8.1C1.2 9.3 2.1 5.85 5.25 4.8c1.8-.6 3.75.15 4.95 1.65C11.4 4.95 13.35 4.2 15.15 4.8c3.15 1.05 4.05 4.5 2.4 7.35-2.4 4.02-9.15 8.1-9.15 8.1Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CommentIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`reaction-icon ${className}`}
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M6.75 18.75 4.5 21V7.5A2.25 2.25 0 0 1 6.75 5.25h10.5A2.25 2.25 0 0 1 19.5 7.5v9A2.25 2.25 0 0 1 17.25 18.75H6.75Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8.25 10.5h7.5M8.25 13.5h4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
