import { cn } from "./cn";

export default function Pill({
  children,
  muted,
  className,
}: {
  children: React.ReactNode;
  muted?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "vv-pill inline-flex items-center gap-2 px-4 py-2 text-sm",
        muted ? "vv-muted-2" : "vv-muted",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Dot() {
  return <span className="h-2.5 w-2.5 rounded-full vv-accent-dot" />;
}
