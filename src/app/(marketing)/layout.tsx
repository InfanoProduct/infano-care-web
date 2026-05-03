"use client";

import { usePathname } from "next/navigation";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { BlogNavbar } from "@/components/blog/BlogNavbar";
import { MarketingFooter } from "@/components/marketing/footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isBlog = pathname?.startsWith('/blog');

  return (
    <div className="flex flex-col min-h-screen">
      <MarketingNavbar />
      <main className="flex-1 w-full pt-20">
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
