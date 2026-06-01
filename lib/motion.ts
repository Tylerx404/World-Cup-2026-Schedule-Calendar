import { useReducedMotion } from "framer-motion";

export const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: "easeOut" },
  },
};

export const staggerContainer = (staggerChildren = 0.045) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren,
    },
  },
});

export const cardHover = {
  rest: {
    scale: 1,
    boxShadow: "0 1px 1px rgba(0, 0, 0, 0.02), 0 2px 2px rgba(0, 0, 0, 0.06)",
  },
  hover: {
    scale: 1.015,
    boxShadow: "0 4px 8px -2px rgba(0, 0, 0, 0.08), 0 2px 2px rgba(0, 0, 0, 0.06)",
    transition: { duration: 0.12, ease: "easeOut" },
  },
};

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 340, damping: 28, mass: 0.8 },
  },
  exit: {
    opacity: 0,
    scale: 0.985,
    y: 6,
    transition: { duration: 0.14, ease: "easeOut" },
  },
};

export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export function useSafeMotion() {
  const shouldReduce = useReducedMotion();
  return { shouldReduce };
}
