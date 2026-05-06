"use client";

import { ArrowRight, Shield, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export function PeerLineHeroAction() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Link 
        href="/peerline-onboarding"
        className="btn-primary text-xl px-12 py-6 rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center gap-3 animate-in fade-in zoom-in duration-500"
      >
        <Shield size={28} />
        Become a Peer Mentor <ArrowRight size={24} />
      </Link>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-2">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-primary" /> Multi-Step Training
        </span>
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-primary" /> Automated Certification
        </span>
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-primary" /> Reward Tiers
        </span>
      </div>
    </div>
  );
}
