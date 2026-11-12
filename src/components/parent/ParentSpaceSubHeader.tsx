"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function ParentSpaceSubHeader() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard/orders", label: "Orders" },
    { href: "/dashboard/settings", label: "Settings" },
    { href: "/dashboard/help", label: "Help" },
  ];

  return (
    <header className="bg-white border-b border-[#F1E4E8] sticky top-0 z-20">
      <div className="max-w-[1080px] mx-auto px-4 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
        <Link
          href="/dashboard/parent"
          className="inline-flex items-center gap-2 min-h-[44px] text-[#3D2C4A] hover:text-[#A8365A] font-semibold text-[15px] transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Parent space</span>
        </Link>

        <nav aria-label="Parent menu" className="flex items-center gap-1.5 text-[15px] font-semibold">
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`min-h-[40px] px-3.5 inline-flex items-center rounded-full transition-colors ${
                  active
                    ? "bg-[#3D2C4A] text-white"
                    : "text-[#3D2C4A] hover:bg-[#FFFAF6]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

