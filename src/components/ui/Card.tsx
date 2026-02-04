export default function Card({
  title,
  kicker,
  right,
  children,
}: {
  title: string;
  kicker?: string;
  right?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="vv-card">
      <div className="px-10 py-8">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            {kicker ? <div className="vv-kicker">{kicker}</div> : null}
            <div className="mt-3 font-[family-name:var(--font-playfair)] text-2xl md:text-3xl leading-[1.1]">
              {title}
            </div>
          </div>
          {right ? <div className="vv-kicker opacity-80">{right}</div> : null}
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
