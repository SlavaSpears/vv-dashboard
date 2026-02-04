import type { Metadata } from "next";
import "./globals.css";

import Image from "next/image";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";

import SidebarNav from "../components/sidebar-nav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "VV Dashboard",
  description: "VV Control Room — private edition.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))] antialiased">
        <div className="mx-auto w-full max-w-none px-6 lg:px-8 xl:px-10 py-8">
          <div className="grid gap-10 lg:grid-cols-[480px_1fr]">
            {/* Sidebar */}
            <aside className="lg:sticky lg:top-8 self-start">
              {/* Apply real-logo watermark to the sidebar card */}
              <div className="vv-card vv-watermark overflow-hidden">
                {/* Brand block */}
                <div className="px-7 pt-7 pb-6 relative">
                  <div className="flex items-start gap-6">
                    {/* Bigger “coin” container */}
                    <div className="grid place-items-center h-20 w-20 rounded-3xl bg-white shadow-[0_18px_60px_rgba(0,0,0,0.14)] ring-1 ring-black/10">
                      <Image
                        src="/brand/vv-mark.png"
                        alt="VV"
                        width={64}
                        height={64}
                        priority
                        className="opacity-95"
                      />
                    </div>

                    <div className="min-w-0 pt-1">
                      <div className="font-[family-name:var(--font-playfair)] text-[44px] leading-none tracking-[0.02em]">
                        VV Dashboard
                      </div>
                      <div className="mt-3 vv-kicker">Control Room</div>

                      <div className="mt-4 inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full vv-accent-dot" />
                        <span className="text-[11px] tracking-[0.24em] uppercase vv-muted-2">
                          Private Edition
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 vv-rule" />
                </div>

                <div className="px-4 pb-7">
                  <SidebarNav />
                </div>
              </div>
            </aside>

            {/* Main */}
            <div className="min-w-0 flex flex-col min-h-[calc(100vh-64px)]">
              {/* Apply soft real-logo watermark to header card */}
              <header className="vv-card vv-watermark-soft mb-10">
                <div className="px-10 py-8">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0">
                      <div className="vv-kicker">{dateLabel}</div>
                      <div className="mt-3 font-[family-name:var(--font-playfair)] text-5xl sm:text-6xl leading-[1.02]">
                        Control Room
                      </div>
                      <div className="mt-3 text-base vv-muted">
                        Calm briefing. Decide what matters. Execute.
                      </div>
                      <div className="mt-6 vv-rule-brass" />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="vv-pill inline-flex items-center gap-2 px-4 py-2 text-sm vv-muted">
                        <span className="h-2.5 w-2.5 rounded-full vv-accent-dot" />
                        On Track
                      </span>
                      <span className="vv-pill inline-flex items-center px-4 py-2 text-sm vv-muted-2">
                        Private
                      </span>
                      <span className="vv-pill inline-flex items-center px-4 py-2 text-sm vv-muted-2">
                        Local
                      </span>
                    </div>
                  </div>
                </div>
              </header>

              <main className="flex-1 min-h-0">{children}</main>

              <footer className="mt-10 pb-2 text-xs vv-muted-2">
                <div className="flex items-center justify-between">
                  <span className="tracking-[0.18em] uppercase">
                    VV Dashboard
                  </span>
                  <span className="tracking-[0.18em] uppercase">
                    Private Edition
                  </span>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
