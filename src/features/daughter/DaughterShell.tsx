'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Home, Compass, Star, Calendar, BookOpen, LogOut, Users } from 'lucide-react';

interface DaughterShellProps {
  children: React.ReactNode;
  gigiTip?: string;
}

export function DaughterShell({
  children,
  gigiTip = 'Drink water and stretch a little today. Your body will thank you!'
}: DaughterShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: Home, matchExact: true },
    { href: '/dashboard/journey', label: 'Journey', icon: Compass },
    { href: '/dashboard/badges', label: 'Badges', icon: Star },
    { href: '/dashboard/diary', label: 'Diary', icon: Calendar },
    { href: '/dashboard/journal', label: 'Journal', icon: BookOpen },
  ];

  const isActive = (item: { href: string; matchExact?: boolean }) => {
    if (item.matchExact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  return (
    <div className="min-h-screen bg-[#FFFAF6] text-[#3D2C4A] font-['Noto_Sans',sans-serif]">
      <div className="flex flex-wrap items-start max-w-[1280px] mx-auto pb-20 lg:pb-8">
        {/* Left Rail (Desktop) */}
        <nav
          aria-label="Her menu"
          className="hidden lg:flex flex-col gap-1.5 w-[220px] p-6 shrink-0 sticky top-0"
        >
          {/* Logo */}
          <div className="px-2 pb-5">
            <Link href="/dashboard" className="relative h-14 w-44 block hover:opacity-90 transition-opacity">
              <Image
                src="/logo/infano-logo-for-light-bg.png"
                alt="Infano"
                fill
                sizes="176px"
                className="object-contain object-left"
                priority
              />
            </Link>
          </div>

          {/* Nav Links */}
          {navItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 min-h-[48px] px-3.5 rounded-2xl transition-colors ${
                  active
                    ? 'font-bold bg-[#FDEFF0] text-[#A8365A]'
                    : 'font-semibold text-[#3D2C4A] hover:bg-white'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Gigi's Tip */}
          <div className="mt-6 bg-[#FFF4C7] rounded-[20px] p-4 text-xs leading-relaxed text-[#3D2C4A] shadow-xs">
            <strong className="block text-sm font-bold mb-1 text-[#7A5A0C]">Gigi&apos;s tip</strong>
            {gigiTip}
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 flex flex-col gap-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Her menu"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#F1E4E8] flex justify-around p-1.5 shadow-lg"
      >
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center gap-0.5 text-[11px] py-1.5 px-2.5 rounded-xl transition-colors ${
                active ? 'font-bold bg-[#FDEFF0] text-[#A8365A]' : 'font-semibold text-[#3D2C4A]'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <Link
          href="/dashboard/picker"
          className="flex flex-col items-center gap-0.5 text-[11px] font-semibold text-[#3D2C4A] py-1.5 px-2.5 rounded-xl"
        >
          <Users size={18} />
          <span>Profiles</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 text-[11px] font-semibold text-[#6E5B7A] hover:text-[#A8365A] py-1.5 px-2.5 cursor-pointer transition-colors"
          aria-label="Log out"
        >
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      </nav>
    </div>
  );
}

