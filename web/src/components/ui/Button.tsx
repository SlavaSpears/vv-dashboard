import { cn } from "./cn";

export default function Button({
  children,
  ghost,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  ghost?: boolean;
}) {
  return (
    <button
      {...props}
      className={cn(
        ghost ? "vv-btn-ghost" : "vv-btn",
        "px-5 py-3 text-sm vv-focus",
        className
      )}
    >
      {children}
    </button>
  );
}
