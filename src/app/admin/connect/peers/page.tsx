'use client';

import { UserCheck, Plus, Loader2 } from 'lucide-react';

export default function PeerManagement() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground italic">Peer <span className="text-primary">Management</span></h1>
          <p className="text-muted-foreground mt-1">Oversee peer mentors and line matching sessions</p>
        </div>
        <button className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
          <Plus size={20} />
          <span>Onboard Mentor</span>
        </button>
      </div>

      <div className="glass-card p-12 rounded-[2.5rem] border-primary/5 flex flex-col items-center justify-center text-center space-y-4 min-h-[40vh]">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center animate-pulse">
          <UserCheck size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-black italic">Peer module under construction</h2>
          <p className="text-muted-foreground font-medium mt-2 max-w-md mx-auto">
            The peer-to-peer support management system is being initialized. Real-time matching logs will appear here soon.
          </p>
        </div>
      </div>
    </div>
  );
}
