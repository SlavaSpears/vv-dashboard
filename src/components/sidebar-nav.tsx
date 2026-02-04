"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { label: string; href: string; kicker?: string };

const NAV: Item[] = [
  { label: "Control Room", href: "/", kicker: "Daily Briefing" },
  { label: "Events", href: "/meetings", kicker: "Meetings / Calls" },
  { label: "Tasks", href: "/tasks", kicker: "Next / Doing" },
  { label: "Goals", href: "/goals", kicker: "Quarterly" },
  { label: "People", href: "/people", kicker: "Network" },
  { label: "Intelligence", href: "/intelligence", kicker: "Notes" },
  { label: "Settings", href: "/settings", kicker: "Integrations" },
];

function cn(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

export default function SidebarNav() {
  const pathname = usePathname();

  const CORE = [
    { label: "Control Room", href: "/", kicker: "Daily Briefing" },
    { label: "AI Terminal", href: "/ai-terminal", kicker: "Assistant" },
    { label: "Backlog", href: "/backlog", kicker: "Master List" },
    { label: "Next Actions", href: "/next-actions", kicker: "Inbox / Queue" },
    { label: "Events", href: "/events", kicker: "Meetings / Calls" },
  ];

  const STRATEGY = [
    { label: "Tasks", href: "/tasks", kicker: "Long-term" }, 
    { label: "Goals", href: "/goals", kicker: "Quarterly" },
    { label: "Intelligence", href: "/intelligence", kicker: "Notes" },
  ];

  const SYSTEM = [
    { label: "People", href: "/people", kicker: "Network" },
    { label: "Settings", href: "/settings", kicker: "Integrations" },
  ];

  function NavGroup({ items, variant }: { items: Item[], variant: "core" | "strategy" | "system" }) {
    return (
      <div className="space-y-1">
        {items.map((item) => {
          // Unique key based on label + href
          const key = item.label + item.href; 
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href ||
                (pathname?.startsWith(item.href + "/") ?? false);
          
          const isCore = variant === "core";
          const isSystem = variant === "system";

          return (
            <Link
              key={key}
              href={item.href}
              className={cn(
                "vv-focus group flex items-center justify-between gap-3 rounded-xl px-3 py-2 transition border border-transparent",
                "hover:border-[rgba(0,0,0,0.10)] hover:bg-[rgba(255,255,255,0.55)]",
                active && "border-[rgba(0,0,0,0.10)] bg-[rgba(255,255,255,0.72)]",
                isSystem && "py-1.5" // Compact for system
              )}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full transition",
                      active ? "vv-accent-dot" : "bg-[rgba(0,0,0,0.20)] group-hover:bg-[rgba(0,0,0,0.35)]",
                      isCore ? "h-2 w-2" : "h-1.5 w-1.5" // Larger dot for core
                    )}
                  />
                  <span
                    className={cn(
                      "truncate",
                      active ? "" : "vv-muted",
                      isCore ? "text-base font-medium text-black/90" : "text-sm", // Bolder core
                      isSystem && "text-xs" // Smaller system
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <nav className="space-y-8">
      {/* CORE */}
      <div className="space-y-3">
         <div className="px-3 text-[11px] tracking-[0.2em] font-medium text-black/40 uppercase">Core</div>
         <NavGroup items={CORE} variant="core" />
      </div>

      {/* STRATEGY */}
      <div className="space-y-3">
         <div className="px-3 text-[11px] tracking-[0.2em] font-medium text-black/40 uppercase">Strategy</div>
         <NavGroup items={STRATEGY} variant="strategy" />
      </div>

       {/* SYSTEM */}
       <div className="space-y-3">
         <div className="px-3 text-[11px] tracking-[0.2em] font-medium text-black/40 uppercase">System</div>
         <NavGroup items={SYSTEM} variant="system" />
      </div>
    </nav>
  );
}
