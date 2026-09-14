import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-pine text-white shadow-[0_6px_16px_rgba(216,78,127,0.2)] hover:bg-pine-dark",
  secondary: "border border-line bg-white text-ink shadow-[0_1px_2px_rgba(74,43,57,0.03)] hover:bg-[#FFF4F8]",
  danger: "bg-rose text-white hover:bg-[#BE3A59]",
  ghost: "text-pine-dark hover:bg-[#FFF1F6]",
};

export function Button({ children, variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: ButtonVariant }) {
  return <button {...props} className={`touch-target inline-flex items-center justify-center rounded-2xl px-4 text-sm font-semibold transition-all active:scale-[0.98] ${variants[variant]} ${className}`}>{children}</button>;
}