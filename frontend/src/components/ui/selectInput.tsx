export default function SelectInput({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      className={`select outline-0 transition-colors duration-300 ease-in-out w-full font-medium ${className}`}
      {...props}
    />
  );
}
