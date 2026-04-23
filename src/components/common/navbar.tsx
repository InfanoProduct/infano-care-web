'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Bell, User, Settings, LogOut } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';

export function Navbar() {
  const { toggleTheme, theme } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync theme with document class
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme, mounted]);

  return (
    <nav className="sticky top-0 z-50 glass-card mx-4 mt-4 mb-2 rounded-2xl px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 p-2 rounded-xl">
          <div className="w-6 h-6 bg-primary rounded-lg" />
        </div>
        <span className="font-bold text-xl tracking-tight text-foreground">
          Infano<span className="text-primary">Care</span>
        </span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Dashboard</Link>
        <Link href="/patients" className="hover:text-primary transition-colors">Patients</Link>
        <Link href="/appointments" className="hover:text-primary transition-colors">Appointments</Link>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={toggleTheme}
          className="p-2 hover:bg-secondary rounded-xl transition-colors"
        >
          {!mounted ? '🌙' : theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button className="p-2 hover:bg-secondary rounded-xl transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
        </button>
        <div className="h-8 w-px bg-border mx-2" />
        <div className="flex items-center gap-3 pl-2">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary font-bold">
            JD
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold leading-none">John Doe</p>
            <p className="text-xs text-muted-foreground mt-1">Administrator</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
