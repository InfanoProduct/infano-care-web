'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, User } from 'lucide-react';
import { ParentService, ParentLink } from '@/services/parent.service';
import { useAuthStore } from '@/store/auth-store';

export function NotificationBell() {
  const { user } = useAuthStore();
  const [links, setLinks] = useState<ParentLink[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLinks();
    
    // Optional: poll every minute
    const interval = setInterval(fetchLinks, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchLinks = async () => {
    try {
      const data = await ParentService.getLinks();
      setLinks(data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await ParentService.acceptInvite(id);
      fetchLinks();
      // Optional: Show success toast
    } catch (err) {
      console.error('Failed to accept invite', err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await ParentService.cancelInvite(id); // Using cancel endpoint to reject
      fetchLinks();
    } catch (err) {
      console.error('Failed to reject invite', err);
    }
  };

  // Only show pending requests where the current user is NOT the sender (i.e. they are receiving the request)
  const pendingRequests = links.filter(link => link.status === 'PENDING' && link.senderId !== user?.id);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 text-slate-400 hover:text-primary bg-slate-50 border border-slate-100 hover:bg-primary/5 rounded-2xl transition-all shadow-sm active:scale-95 relative"
      >
        <Bell size={18} />
        {pendingRequests.length > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Notifications</h3>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {pendingRequests.length === 0 ? (
              <div className="p-6 text-center text-sm font-medium text-slate-400">
                No new notifications
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {pendingRequests.map(req => {
                  // If current user is teen, sender is parent. If user is parent, sender is teen.
                  const senderName = req.sender?.profile?.displayName || 'Someone';
                  const senderPhone = req.sender?.phone || '';
                  
                  return (
                    <div key={req.id} className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                          <User size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-800 leading-tight">
                            <span className="font-bold">{senderName}</span> {senderPhone && <span className="text-slate-500">({senderPhone})</span>} wants to link accounts with you.
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            <button 
                              onClick={() => handleAccept(req.id)}
                              className="flex-1 py-1.5 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-1"
                            >
                              <Check size={12} /> Accept
                            </button>
                            <button 
                              onClick={() => handleReject(req.id)}
                              className="flex-1 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
                            >
                              <X size={12} /> Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
