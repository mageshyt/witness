"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { CalendarDays, BarChart3, User } from "lucide-react";

const links = [
  { href: "/today", label: "Today", icon: CalendarDays },
  { href: "/metrics", label: "Metrics", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
];

const AUTH_PATHS = ["/login", "/register"];

export function Nav() {
  const pathname = usePathname();
  const { data } = useQuery({
    queryKey: ["streak"],
    queryFn: async () => {
      const res = await fetch("/api/streak");
      if (!res.ok) return { streak: 0 };
      return res.json();
    },
  });
  const streak: number = data?.streak ?? 0;

  if (AUTH_PATHS.some(p => pathname.startsWith(p))) return null;

  return (
    <>
      {/* Top bar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg width="16" height="16" viewBox="0 0 26 26" fill="none">
                <path d="M4 13h4l3-8 4 16 3-8h4" stroke="#0A0A0F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-widest">WITNESS</span>
          </div>

          {/* Desktop nav links — hidden on mobile */}
          <div className="hidden md:flex gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  pathname.startsWith(href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}>
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Streak */}
            {streak > 0 && (
              <div className="flex items-center gap-1 text-sm font-bold">
                <span>🔥</span>
                <span>{streak}</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile bottom tab bar — visible only on mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur md:hidden">
        <div className="flex">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                pathname.startsWith(href)
                  ? "text-primary"
                  : "text-muted-foreground"
              )}>
              <Icon size={20} />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Spacer so content isn't hidden behind bottom tab bar on mobile */}
      <div className="h-16 md:hidden" />
    </>
  );
}
