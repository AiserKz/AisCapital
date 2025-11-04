const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
};

const ringColorClasses = {
  primary: "ring-primary",
  secondary: "ring-secondary",
  accent: "ring-accent",
  info: "ring-info",
  success: "ring-success",
  warning: "ring-warning",
  error: "ring-error",
};

const size = {
  sm: "w-10 h-10",
  md: "w-12 h-12",
  lg: "w-14 h-14",
  xl: "w-16 h-16",
  "2xl": "w-20 h-20",
  "3xl": "w-24 h-24",
};

export default function AvatarCircle({
  url,
  name,
  className,
  ring = false,
  textSize,
  ringColor = "primary",
}: {
  url?: string;
  name: string;
  className?: string;
  ring?: boolean;
  textSize?: keyof typeof textSizeClasses;
  ringColor?: keyof typeof ringColorClasses;
}) {
  return (
    <div className={`avatar ${size[textSize || "md"]}`}>
      <div
        className={`w-full h-full rounded-full ${className} ${
          ring &&
          `ring-2 ring-offset-2 ring-offset-base-100 ${
            ringColor && ringColorClasses[ringColor]
          }`
        }`}
      >
        {url ? (
          <img src={url} alt={name} />
        ) : (
          <div
            className={`bg-linear-to-br from-blue-500 to-purple-600 text-white absolute w-full h-full flex items-center justify-center rounded-full ${
              textSizeClasses[textSize || "md"]
            }`}
          >
            {name[0]}
          </div>
        )}
      </div>
    </div>
  );
}
