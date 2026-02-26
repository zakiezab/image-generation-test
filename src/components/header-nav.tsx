"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Hero Visual" },
  { href: "/storyline", label: "Storyline Studio" },
];

export function HeaderNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-secondary/20 bg-background">
      <div className="mx-auto max-w-(--max-w-container) px-4 py-4 md:px-16 2xl:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-display text-lg font-semibold text-foreground transition-colors hover:text-primary"
          >
            Mobiz
          </Link>
          <nav className="flex gap-1">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ${
                  pathname === href
                    ? "bg-primary-100 text-primary"
                    : "text-secondary-100 hover:bg-(--gray-100) hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
