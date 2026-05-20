'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Ecosystem', href: '/ecosystem' },
  { name: 'Schools', href: '/schools' },
  { name: 'Parents', href: '/parents' },
  { name: 'Circle', href: '/the-support-circle' },
  { name: 'Book', href: '/gigi-the-awkward-age-book' },
  // { name: 'Impact', href: '/impact' },
  { name: 'Blog', href: '/blog' },
  { name: 'About', href: '/about' },
];

export function MarketingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm py-2' : 'bg-transparent py-4'
          }`}
      >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 flex items-center justify-between gap-4">
        <Link href="/" className="relative z-50 shrink-0 group w-40 md:w-48 lg:w-52 h-12 md:h-14 lg:h-16 flex items-center -ml-2">
          <Image
            src="/logo/infano-logo-for-light-bg.png"
            alt="Infano"
            fill
            className="object-contain object-left transition-transform group-hover:scale-105"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex items-center gap-1 bg-white/70 p-1 rounded-full border border-white/80 shadow-lg shadow-slate-200/50 backdrop-blur-md">
          {navLinks.map((link) => {
            const isActive = link.href === '/'
              ? pathname === '/'
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-xs xl:text-[13px] px-3 xl:px-4 py-2 rounded-full transition-all duration-200 whitespace-nowrap ${isActive
                  ? 'bg-primary text-white font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-primary font-medium hover:bg-white/60'
                  }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden xl:flex items-center gap-3 xl:gap-6 shrink-0">
          <Link href="/parents" className="text-[13px] font-bold text-slate-700 hover:text-primary transition-colors whitespace-nowrap hidden 2xl:block">
            I'm a Parent — Get Access
          </Link>
          <Link href="/contact" className="btn-primary text-xs xl:text-[13px] px-4 xl:px-6 py-2 xl:py-2.5 whitespace-nowrap shadow-md hover:shadow-lg transition-all active:scale-95">
            Enrol Your School &rarr;
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="xl:hidden p-2 text-foreground z-50"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>

      {/* Mobile Menu (Rendered outside header to avoid backdrop-filter stacking context bugs) */ }
  {
    mobileMenuOpen && (
      <div className="xl:hidden fixed inset-0 z-40 bg-white pt-24 px-6 flex flex-col gap-6 overflow-y-auto">
        <nav className="flex flex-col gap-4">
          {navLinks.map((link) => {
            const isActive = link.href === '/'
              ? pathname === '/'
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-lg font-medium pb-2 border-b border-border ${isActive ? 'text-primary' : 'text-foreground'
                  }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-col gap-4 mt-6 pb-12">
          <Link
            href="/parents"
            onClick={() => setMobileMenuOpen(false)}
            className="btn-outline w-full"
          >
            I'm a Parent — Get Access
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="btn-primary w-full"
          >
            Enrol Your School &rarr;
          </Link>
        </div>
      </div>
    )
  }
    </>
  );
}
