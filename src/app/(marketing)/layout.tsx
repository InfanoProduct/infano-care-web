import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
