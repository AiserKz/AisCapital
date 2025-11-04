const variantClasses = {
  default: "toggle-primary",
  secondary: "toggle-secondary",
  accent: "toggle-accent",
  info: "toggle-info",
  success: "toggle-success",
  warning: "toggle-warning",
  error: "toggle-error",
};

const sizes = {
  small: "toggle-sm",
  medium: "toggle-md",
  large: "toggle-lg",
};

export default function Switch({
  checked,
  variant = "default",
  size = "medium",
  className,
  onCheckedChange,
}: {
  checked: boolean;
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizes;
  className?: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      className={`toggle ${variantClasses[variant]} ${sizes[size]} bg-base-100   ${className}`}
    />
  );
}
