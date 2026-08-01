import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { augenEase, viewport } from "../../lib/motion";

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 0.9, ease: augenEase, delay }}
    >
      {children}
    </motion.div>
  );
}

export function RevealStagger({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: augenEase } },
      }}
    >
      {children}
    </motion.div>
  );
}
