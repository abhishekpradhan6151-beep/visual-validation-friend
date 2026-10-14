import { Link } from "@tanstack/react-router";
import { FolderOpen, Home, Settings } from "lucide-react";
import { Wordmark } from "./Logo";

const ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/creations", label: "My Creations", icon: FolderOpen },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppNav() {
  return (
    <>
      {/* Desktop / tablet: slim top bar */}
      <header className="sticky top-0 z-40 hidden md:block">
        <div className="mx-auto mt-3 flex max-w-5xl items-center justify-between rounded-2xl glass px-4 py-2.5">
          <Link to="/" aria-label="FRAME home" className="press rounded-md">
            <Wordmark />
          </Link>
          <nav aria-label="Main" className="flex items-center gap-1">
            {ITEMS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/" }}
                className="press inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground data-[status=active]:bg-accent data-[status=active]:text-foreground"
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile: top wordmark + floating bottom nav */}
      <header className="flex justify-center pt-5 md:hidden">
        <Link to="/" aria-label="FRAME home">
          <Wordmark />
        </Link>
      </header>
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-[min(92%,22rem)] items-center justify-around rounded-full glass px-2 py-1.5 md:hidden"
        style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
      >
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            aria-label={label}
            activeOptions={{ exact: to === "/" }}
            className="press flex flex-1 flex-col items-center gap-0.5 rounded-full px-3 py-1.5 text-[10px] font-medium text-muted-foreground data-[status=active]:bg-accent data-[status=active]:text-foreground"
          >
            <Icon className="size-[18px]" aria-hidden="true" />
            {label === "My Creations" ? "Creations" : label}
          </Link>
        ))}
      </nav>
    </>
  );
}
