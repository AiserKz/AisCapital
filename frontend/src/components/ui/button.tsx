const buttonVariants = {
  default: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  link: "btn-link",
  info: "btn-info",
  success: "btn-success",
  warning: "btn-warning",
  danger: "btn-danger",
  error: "btn-error",
  accent: "btn-accent",
};

const sizes = {
  small: "btn-sm",
  medium: "btn-md",
  large: "btn-lg",
};

interface ButtonProps extends React.ComponentProps<"button"> {
  className?: string;
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof sizes;
  asChild?: boolean;
}

export default function Button({
  className,
  variant = "default",
  size = "medium",
  asChild,
  ...props
}: ButtonProps) {
  const Comp = asChild ? "span" : "button";
  const _variant =
    variant in buttonVariants
      ? variant
      : ("default" as keyof typeof buttonVariants);
  const _size = size in sizes ? size : ("medium" as keyof typeof sizes);

  return (
    <Comp
      className={`btn ${buttonVariants[_variant]} ${sizes[_size]} ${
        className || ""
      }`}
      {...props}
    />
  );
}
