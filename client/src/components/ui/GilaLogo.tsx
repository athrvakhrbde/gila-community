type Props = {
  className?: string;
};

/** Original gila wordmark asset — custom letterforms, not replaceable with SVG `<text>`. */
export function GilaLogo({ className = "h-[18px] w-auto" }: Props) {
  return (
    <img
      src="/gila-logo.png"
      alt="gila"
      width={72}
      height={28}
      className={`logo-mark block w-fit max-w-none shrink-0 ${className}`.trim()}
    />
  );
}
