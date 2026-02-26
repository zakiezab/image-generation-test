import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-lg";
    const variants = {
      primary:
        "bg-primary text-white hover:bg-primary-dark focus-visible:ring-primary",
      secondary:
        "bg-secondary-800 text-white hover:bg-secondary-700 focus-visible:ring-secondary-300",
      outline:
        "border border-secondary/40 bg-secondary-800 text-foreground hover:bg-secondary-800/50 focus-visible:ring-(--gray-400)",
      ghost:
        "text-secondary-100 hover:bg-(--gray-100) focus-visible:ring-(--gray-400)",
    };
    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    };
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
