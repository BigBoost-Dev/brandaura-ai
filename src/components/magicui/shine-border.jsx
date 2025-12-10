import { cn } from "../../lib/utils";

export function ShineBorder({
  borderRadius = 8,
  borderWidth = 1,
  duration = 14,
  color = ["#A07CFE", "#FE8FB5", "#FFBE7B"],
  className,
  children,
}) {
  return (
    <div
      style={{
        "--border-radius": `${borderRadius}px`,
      }}
      className={cn(
        "relative grid place-items-center rounded-[--border-radius] bg-white/5 p-px text-white",
        className
      )}
    >
      <div
        style={{
          "--border-width": `${borderWidth}px`,
          "--border-radius": `${borderRadius}px`,
          "--duration": `${duration}s`,
          "--mask-linear-gradient": `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          "--background-radial-gradient": `radial-gradient(transparent,transparent, ${color.join(",")},transparent,transparent)`,
        }}
        className={cn(
          "before:bg-shine-size before:absolute before:inset-0 before:aspect-square before:size-full before:rounded-[--border-radius] before:p-[--border-width] before:will-change-[background-position] before:content-[''] before:![-webkit-mask-composite:xor] before:[background-image:--background-radial-gradient] before:[background-size:300%_300%] before:[mask:--mask-linear-gradient] before:![mask-composite:exclude] motion-safe:before:animate-shine"
        )}
      />
      <div className="relative z-10 w-full rounded-[calc(var(--border-radius)-1px)] bg-neutral-950">
        {children}
      </div>
    </div>
  );
}
