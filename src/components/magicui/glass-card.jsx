import { cn } from "../../lib/utils";

// Resend-style glassmorphism card with dashed border and top glow
export function GlassCard({ children, className, glowColor = "rgba(255,255,255,0.1)" }) {
  return (
    <div 
      className={cn(
        "relative rounded-2xl overflow-hidden",
        className
      )}
    >
      {/* Dashed border */}
      <div className="absolute inset-0 rounded-2xl border border-dashed border-white/[0.15]" />
      
      {/* Top glow gradient */}
      <div 
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)`
        }}
      />
      
      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}

// Variant with solid subtle border (for buttons)
export function GlassButton({ children, className, as: Component = "button", ...props }) {
  return (
    <Component 
      className={cn(
        "relative rounded-xl overflow-hidden border border-white/[0.15] bg-transparent",
        "hover:border-white/[0.25] hover:bg-white/[0.02] transition-all duration-300",
        className
      )}
      {...props}
    >
      {/* Top glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {children}
    </Component>
  );
}
