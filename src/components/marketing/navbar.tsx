'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useRegion } from '@/hooks/use-region';
import { ShopService } from '@/services/shop.service';
import { motion } from 'framer-motion';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Ecosystem', href: '/ecosystem' },
  { name: 'Schools', href: '/schools' },
  { name: 'Parents', href: '/parents' },
  { name: 'Circle', href: '/the-support-circle' },
  { name: 'Book', href: '/gigi-the-awkward-age-book' },
  // { name: 'Impact', href: '/impact' },
  { name: 'Blog', href: '/blog' },
  { name: 'Webinar', href: '/webinar/decoding-her-silence' },
  { name: 'About', href: '/about' },
];

export function MarketingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { region, getLocalizedLink } = useRegion();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Clean pathname for matching active state correctly in subpaths
  const cleanPath = pathname.replace(/^\/en-(us|uk)/, '') || '/';
  const isWebinarPage = cleanPath.startsWith('/webinar');
  const isWebinarSuccessPage = cleanPath.startsWith('/webinar/success');

  const handleRegisterClick = () => {
    window.dispatchEvent(new CustomEvent('open-webinar-registration'));
  };

  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [webinarDate, setWebinarDate] = useState<string | null>(null);

  useEffect(() => {
    if (!isWebinarPage) return;

    const parts = cleanPath.split('/');
    const slug = parts[2] || 'active';

    ShopService.getWebinarBySlug(slug)
      .then((data) => {
        if (data && data.date) {
          setWebinarDate(data.date);
        }
      })
      .catch((err) => {
        if (err.message !== 'Webinar not found') {
          console.error("Error fetching webinar details in Navbar:", err);
        }
      });
  }, [cleanPath, isWebinarPage]);

  useEffect(() => {
    if (!webinarDate) return;

    const calculateTimeLeft = () => {
      const loopDurationMs = 5 * 60 * 60 * 1000; // 5 hours in milliseconds
      const difference = loopDurationMs - (new Date().getTime() % loopDurationMs);
      return {
        days: 0,
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [webinarDate]);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.01),0_10px_20px_-2px_rgba(0,0,0,0.005)] py-2"
      >
        {/* Top brand line indicator */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-linear-to-r from-primary via-primary-light to-accent" />

        <div className="max-w-360 mx-auto px-6 md:px-12 lg:px-24 flex items-center justify-between gap-4">
          {/* Left Column: Logo */}
          <div className="flex-1 flex items-center justify-start">
            <Link href={getLocalizedLink('/')} className="relative z-50 shrink-0 group w-40 md:w-48 lg:w-52 h-12 md:h-14 lg:h-16 flex items-center -ml-2">
              <Image
                src="/logo/infano-logo-for-light-bg.png"
                alt="Infano"
                fill
                sizes="(max-width: 768px) 160px, (max-width: 1024px) 192px, 208px"
                className="object-contain object-left transition-transform group-hover:scale-102 lg:translate-y-0.5"
                priority
              />
            </Link>
          </div>

          {isWebinarPage ? (
            <div className="flex items-center gap-4 md:gap-6 ml-auto">
              {!isWebinarSuccessPage && (
                <button
                  onClick={handleRegisterClick}
                  className="btn-primary text-xs md:text-[13px] px-5 md:px-7 py-2 md:py-2.5 whitespace-nowrap shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer border-none font-bold"
                >
                  Register Now
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Center Column: Desktop Navigation (perfectly centered relative to viewport) */}
              <div className="flex-initial hidden xl:flex justify-center">
                <nav className="flex items-center gap-1 bg-white/80 p-1 rounded-full border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur-md">
                  {navLinks.map((link) => {
                    const isActive = link.href === '/'
                      ? cleanPath === '/'
                      : cleanPath.startsWith(link.href);
                    return (
                      <Link
                        key={link.name}
                        href={getLocalizedLink(link.href)}
                        className={`relative inline-flex items-center justify-center text-xs xl:text-[13px] px-4 py-2 rounded-full transition-all duration-300 whitespace-nowrap z-10 ${isActive
                          ? 'text-white font-bold'
                          : 'text-slate-600 hover:text-primary font-medium hover:bg-slate-50/60'
                          }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="active-pill"
                            className="absolute inset-0 bg-primary rounded-full -z-10 shadow-sm"
                            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                          />
                        )}
                        {link.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Right Column: Desktop CTAs & Mobile Toggle */}
              <div className="flex-1 flex items-center justify-end gap-4">
                {/* Desktop CTAs */}
                <div className="hidden xl:flex items-center gap-3 xl:gap-6">
                  {isAuthenticated ? (
                    <Link
                      href={getLocalizedLink('/dashboard')}
                      className="text-xs xl:text-[13px] px-6 py-2.5 rounded-full bg-linear-to-r from-primary to-primary-light text-white font-bold transition-all duration-300 whitespace-nowrap shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.03] hover:-translate-y-px active:scale-[0.97] border-none"
                    >
                      Go to Workspace &rarr;
                    </Link>
                  ) : (
                    <Link
                      href={getLocalizedLink('/login')}
                      className="text-xs xl:text-[13px] px-6 py-2.5 rounded-full bg-linear-to-r from-primary to-primary-light text-white font-bold transition-all duration-300 whitespace-nowrap shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.03] hover:-translate-y-px active:scale-[0.97] border-none"
                    >
                      Login
                    </Link>
                  )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="xl:hidden flex items-center">
                  <button
                    className="p-2 text-foreground z-50"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                </div>
              </div>
            </>
          )}
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
                  className="btn-primary w-full text-center"
                >
                  Go to Workspace &rarr;
                </Link>
              ) : (
                <Link
                  href={getLocalizedLink('/login')}
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full text-center"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )
      }
    </>
  );
}
