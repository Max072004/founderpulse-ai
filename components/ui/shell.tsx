"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BarChart3, FileText, History, LayoutDashboard, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/brief", label: "Brief", icon: FileText },
  { href: "/cards", label: "Cards", icon: Share2 },
  { href: "/timeline", label: "Timeline", icon: History },
  { href: "/trends", label: "Trends", icon: BarChart3 }
] as const;

export function AppShell({ children, className }: { children: React.ReactNode; className?: string }) {
  const pathname = usePathname();

  return (
    <div className={cn("min-h-screen", className)}>
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 bg-card shadow-soft-border transition group-hover:border-primary/30">
              <Activity className="h-4 w-4 text-primary" />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-semibold tracking-[-0.02em]">FounderPulse</span>
              <span className="text-[10px] text-muted-foreground">AI intelligence</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex h-8 items-center gap-2 rounded-md px-3 text-sm transition",
                    active
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link href="/dashboard">
            <Button size="sm" variant="default">
              <Sparkles className="h-3.5 w-3.5" />
              Open pulse
            </Button>
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
