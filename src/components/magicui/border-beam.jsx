import { cn } from "../../lib/utils";

export const BorderBeam = ({
  className,
  size = 200,
  duration = 15,
  borderWidth = 2,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  delay = 0,
}) => {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden",
        className
      )}
    >
      {/* Animated gradient border */}
      <div 
        className="absolute inset-[-2px] rounded-[inherit]"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${colorFrom}, ${colorTo}, transparent)`,
          animation: `spin ${duration}s linear infinite`,
          animationDelay: `${delay}s`,
        }}
      />
      {/* Inner mask to show only border */}
      <div 
        className="absolute rounded-[inherit] bg-[#09090b]"
        style={{
          inset: `${borderWidth}px`,
        }}
      />
    </div>
  );
};
