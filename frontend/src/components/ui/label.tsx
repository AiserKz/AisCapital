export default function Label({
  className,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label className="block text-sm font-medium text-base-content" {...props} />
  );
}
