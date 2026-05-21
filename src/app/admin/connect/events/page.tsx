'use client';

import { Ticket, Plus, Loader2 } from 'lucide-react';

export default function EventManagement() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="admin-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Event <span className="text-primary">Management</span></h1>
          <p className="text-muted-foreground mt-1">Schedule and manage community workshops and events</p>
        </div>
        <button className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
          <Plus size={20} />
          <span>Schedule Event</span>
        </button>
      </div>

      <div className="glass-card p-12 rounded-[2.5rem] border-primary/5 flex flex-col items-center justify-center text-center space-y-4 min-h-[40vh]">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center animate-pulse">
          <Ticket size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-black">Events under construction</h2>
          <p className="text-muted-foreground font-medium mt-2 max-w-md mx-auto">
            The event scheduling system is currently being integrated with the global calendar. 
          </p>
        </div>
      </div>
    </div>
  );
}
