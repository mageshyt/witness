"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/today",   label: "Today",   icon: "⚡" },
  { href: "/metrics", label: "Metrics", icon: "📈" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg width="16" height="16" viewBox="0 0 26 26" fill="none">
              <path d="M4 13h4l3-8 4 16 3-8h4" stroke="#0A0A0F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-sm font-bold tracking-widest">WITNESS</span>
        </div>
        <div className="flex gap-1">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname.startsWith(l.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}>
              <span>{l.icon}</span>{l.label}
            </Link>
          ))}
        </div>
        <button onClick={handleLogout} className="text-xs text-muted-foreground hover:text-foreground">
          Sign out
        </button>
      </div>
    </nav>
  );
}
