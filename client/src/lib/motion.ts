import type { Variants } from "framer-motion";

export const augenEase = [0.22, 1, 0.36, 1] as const;
export const augenLetterEase = [0.65, 0, 0.35, 1] as const;

/** @deprecated use augenEase */
export const novuEase = augenEase;
/** @deprecated use augenLetterEase */
export const novuLetterEase = augenLetterEase;

export const viewport = { once: true, margin: "-80px" as const };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: novuEase },
  },
};

export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
};
