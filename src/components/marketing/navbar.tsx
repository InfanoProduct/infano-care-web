'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useRegion } from '@/hooks/use-region';

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { region, getLocalizedLink } = useRegion();
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  const countries = [
    { code: 'IN', name: 'India', flag: '🇮🇳', iso: 'in' },
    { code: 'US', name: 'United States', flag: '🇺🇸', iso: 'us' },
    { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', iso: 'gb' }
  ] as const;

  const activeCountry = countries.find(c => c.code === region) || countries[0];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOutsideDesktop = desktopDropdownRef.current && !desktopDropdownRef.current.contains(target);
      const clickedOutsideMobile = mobileDropdownRef.current && !mobileDropdownRef.current.contains(target);
      
      if (clickedOutsideDesktop && clickedOutsideMobile) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountryChange = (code: 'IN' | 'US' | 'UK') => {
    setDropdownOpen(false);
    
    // Get actual path from browser to bypass any rewritten state
    let currentPath = pathname;
    if (typeof window !== 'undefined') {
      currentPath = window.location.pathname;
    }

    // Extract base pathname without existing locale prefixes
    let base = currentPath;
    if (currentPath.startsWith('/en-us')) {
      base = currentPath.substring(6) || '/';
    } else if (currentPath.startsWith('/en-uk')) {
      base = currentPath.substring(6) || '/';
    }

    if (!base.startsWith('/')) {
      base = '/' + base;
    }

    let target = base;
    if (code === 'US') {
      target = `/en-us${base === '/' ? '' : base}`;
    } else if (code === 'UK') {
      target = `/en-uk${base === '/' ? '' : base}`;
    }

    window.location.href = target;
  };

  // Clean pathname for matching active state correctly in subpaths
  const cleanPath = pathname.replace(/^\/en-(us|uk)/, '') || '/';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm py-2' : 'bg-transparent py-4'
          }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 flex items-center justify-between gap-4">
          <Link href={getLocalizedLink('/')} className="relative z-50 shrink-0 group w-40 md:w-48 lg:w-52 h-12 md:h-14 lg:h-16 flex items-center -ml-2">
            <Image
              src="/logo/infano-logo-for-light-bg.png"
              alt="Infano"
              fill
              sizes="(max-width: 768px) 160px, (max-width: 1024px) 192px, 208px"
              className="object-contain object-left transition-transform group-hover:scale-105"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-1 bg-white/70 p-1 rounded-full border border-white/80 shadow-lg shadow-slate-200/50 backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = link.href === '/'
                ? cleanPath === '/'
                : cleanPath.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={getLocalizedLink(link.href)}
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
            {/* Custom Country Selector */}
            <div className="relative" ref={desktopDropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-xs font-bold text-slate-700 shadow-sm cursor-pointer"
              >
                <img
                  src={`https://flagcdn.com/w40/${activeCountry.iso}.png`}
                  className="w-4 h-3 object-cover rounded-sm border border-slate-200/50 shrink-0"
                  alt={activeCountry.name}
                />
                <span>{activeCountry.code}</span>
                <ChevronDown size={12} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-xl py-1 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  {countries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => handleCountryChange(country.code)}
                      className={`w-full flex items-center gap-2.5 px-4 py-2 text-left text-xs font-medium transition-colors hover:bg-slate-50 ${region === country.code ? 'text-primary font-bold bg-primary/5' : 'text-slate-600'}`}
                    >
                      <img
                        src={`https://flagcdn.com/w40/${country.iso}.png`}
                        className="w-4.5 h-3.5 object-cover rounded-sm border border-slate-200/50 shrink-0"
                        alt={country.name}
                      />
                      <span>{country.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <Link href={getLocalizedLink('/dashboard')} className="text-[13px] font-bold text-primary hover:text-primary-dark transition-colors whitespace-nowrap hidden 2xl:block">
                Go to Workspace &rarr;
              </Link>
            ) : (
              <Link href={getLocalizedLink('/login')} className="text-[13px] font-bold text-slate-700 hover:text-primary transition-colors whitespace-nowrap hidden 2xl:block">
                Sign In
              </Link>
            )}
            <Link href={getLocalizedLink('/contact')} className="btn-primary text-xs xl:text-[13px] px-4 xl:px-6 py-2 xl:py-2.5 whitespace-nowrap shadow-md hover:shadow-lg transition-all active:scale-95">
              Enrol Your School &rarr;
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="xl:hidden flex items-center gap-3">
            {/* Mobile Country Selector (Compact) */}
            <div className="relative" ref={mobileDropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700"
              >
                <img
                  src={`https://flagcdn.com/w40/${activeCountry.iso}.png`}
                  className="w-4 h-3 object-cover rounded-sm border border-slate-200/50 shrink-0"
                  alt={activeCountry.name}
                />
                <ChevronDown size={10} className="text-slate-400" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-100 rounded-xl shadow-xl py-1 z-50">
                  {countries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => handleCountryChange(country.code)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium hover:bg-slate-50 text-slate-600"
                    >
                      <img
                        src={`https://flagcdn.com/w40/${country.iso}.png`}
                        className="w-4 h-3 object-cover rounded-sm border border-slate-200/50 shrink-0"
                        alt={country.name}
                      />
                      <span>{country.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              className="xl:hidden p-2 text-foreground z-50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu (Rendered outside header to avoid backdrop-filter stacking context bugs) */}
      {
        mobileMenuOpen && (
          <div className="xl:hidden fixed inset-0 z-40 bg-white pt-24 px-6 flex flex-col gap-6 overflow-y-auto">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => {
                const isActive = link.href === '/'
                  ? cleanPath === '/'
                  : cleanPath.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    href={getLocalizedLink(link.href)}
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
              {isAuthenticated ? (
                <Link
                  href={getLocalizedLink('/dashboard')}
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-outline w-full text-center"
                >
                  Go to Workspace &rarr;
                </Link>
              ) : (
                <Link
                  href={getLocalizedLink('/login')}
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-outline w-full text-center"
                >
                  Sign In
                </Link>
              )}
              <Link
                href={getLocalizedLink('/contact')}
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary w-full text-center"
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
