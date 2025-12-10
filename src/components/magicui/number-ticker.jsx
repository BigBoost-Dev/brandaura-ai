import { useEffect, useRef, useState } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { cn } from "../../lib/utils";

export function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hasAnimated, setHasAnimated] = useState(false);

  const springValue = useSpring(direction === "down" ? value : 0, {
    bounce: 0,
    duration: 2000,
  });

  const displayValue = useTransform(springValue, (current) =>
    Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(current)
  );

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setTimeout(() => {
        springValue.set(direction === "down" ? 0 : value);
        setHasAnimated(true);
      }, delay * 1000);
    }
  }, [isInView, hasAnimated, springValue, value, direction, delay]);

  return (
    <motion.span
      ref={ref}
      className={cn(
        "inline-block tabular-nums tracking-tight",
        className
      )}
    >
      {displayValue}
    </motion.span>
  );
}
