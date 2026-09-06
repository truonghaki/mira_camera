import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-pine text-white hover:bg-pine-dark",
  secondary: "border border-line bg-white text-ink hover:bg-[#FFF4F8]",
  danger: "bg-rose text-white hover:bg-[#BE3A59]",
  ghost: "text-pine-dark hover:bg-[#FFF1F6]",
};

export function Button({ children, variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: ButtonVariant }) {
  return <button {...props} className={`touch-target inline-flex items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors ${variants[variant]} ${className}`}>{children}</button>;
}