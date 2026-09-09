'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRegion, Region, REGION_CONFIGS } from '@/hooks/use-region';
import { Globe, ChevronDown, Check } from 'lucide-react';

const REGIONS_LIST: { region: Region; label: string; currency: string; symbol: string; flag: string }[] = [
  { region: 'IN', label: 'India', currency: 'INR', symbol: '₹', flag: '🇮🇳' },
  { region: 'US', label: 'United States', currency: 'USD', symbol: '$', flag: '🇺🇸' },
  { region: 'UK', label: 'United Kingdom', currency: 'GBP', symbol: '£', flag: '🇬🇧' },
];

interface CurrencySelectorProps {
  variant?: 'compact' | 'pill' | 'select';
  className?: string;
}

export function CurrencySelector({ variant = 'pill', className = '' }: CurrencySelectorProps) {
  const { region, changeRegion } = useRegion();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeConfig = REGIONS_LIST.find((r) => r.region === region) || REGIONS_LIST[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (r: Region) => {
    changeRegion(r);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60 transition-all active:scale-95 shadow-sm"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Select currency / region"
      >
        <span className="text-sm leading-none">{activeConfig.flag}</span>
        <span>{activeConfig.currency} ({activeConfig.symbol})</span>
        <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
            Currency / Region
          </div>
          {REGIONS_LIST.map((item) => {
            const isSelected = item.region === region;
            return (
              <button
                key={item.region}
                onClick={() => handleSelect(item.region)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
                  isSelected ? 'bg-primary/10 text-primary font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{item.flag}</span>
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 font-semibold">{item.currency}</span>
                  {isSelected && <Check size={14} className="text-primary ml-1" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
