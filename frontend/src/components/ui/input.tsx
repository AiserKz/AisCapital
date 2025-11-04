export default function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      className={`input input-bordered w-full ${className} focus:outline-none transition-colors duration-300 ease-in-out`}
      type={type}
      {...props}
    />
  );
}
