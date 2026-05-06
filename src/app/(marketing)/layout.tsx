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
  const isDashboard = pathname?.startsWith('/peerline/dashboard');
  const isPortal = isDashboard;

  return (
    <div className="flex flex-col min-h-screen">
      {!isPortal && <MarketingNavbar />}
      <main className={`flex-1 w-full ${!isPortal ? 'pt-20' : ''}`}>
        {children}
      </main>
      {!isPortal && <MarketingFooter />}
    </div>
  );
}
