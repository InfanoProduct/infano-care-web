'use client';

import { Navbar } from "@/components/common/navbar";
import { BlogNavbar } from "@/components/blog/BlogNavbar";
import { usePathname } from "next/navigation";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isBlog = pathname?.startsWith('/blog');

  return (
    <>
      {isBlog ? <BlogNavbar /> : <Navbar />}
      <main className={`flex-1 ${isBlog ? '' : 'p-4 md:p-6 max-w-7xl mx-auto w-full'}`}>
        {children}
      </main>
    </>
  );
}
