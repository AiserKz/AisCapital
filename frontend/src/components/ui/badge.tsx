import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "error"
    | "ghost"
    | "accent";
  asChild?: boolean;
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "badge-default",
  primary: "badge-primary",
  secondary: "badge-secondary",
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-error",
  info: "badge-info",
  error: "badge-error",
  ghost: "badge-ghost",
  accent: "badge-accent",
};

function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Component = asChild ? React.Fragment : "span";
  const _variant = variantClasses[variant || "default"];
  return (
    <Component className={`badge ${_variant} ${className || ""}`} {...props} />
  );
}

export { Badge };
