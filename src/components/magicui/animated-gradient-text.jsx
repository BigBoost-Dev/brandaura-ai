import { cn } from "../../lib/utils";

export function AnimatedGradientText({ children, className }) {
  return (
    <span
      className={cn(
        "inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent",
        className
      )}
      style={{ "--bg-size": "300%" }}
    >
      {children}
    </span>
  );
}

// Gold gradient variant for Resend-style
export function GoldGradientText({ children, className }) {
  return (
    <span
      className={cn(
        "inline animate-gradient bg-gradient-to-r from-[#d4a574] via-[#f5d799] to-[#d4a574] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent",
        className
      )}
      style={{ "--bg-size": "300%" }}
    >
      {children}
    </span>
  );
}
