'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Check, X, User } from 'lucide-react';
import { ParentService, ParentLink, DbNotification } from '@/services/parent.service';
import { ProgramsService } from '@/services/programs.service';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'react-hot-toast';

function formatRelativeTime(dateInput: string | Date | number): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (isNaN(diffMs) || diffMs < 0) {
    return 'just now';
  }

  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function NotificationBell() {
  const { user } = useAuthStore();
  const [links, setLinks] = useState<ParentLink[]>([]);
  const [dbNotifications, setDbNotifications] = useState<DbNotification[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [prefs, setPrefs] = useState({
    inactivityAlert: true,
    upcomingSessions: true,
    weeklyPrompt: true,
    newResource: true,
    pushEnabled: false,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    if (!user) {
      setLinks([]);
      setDbNotifications([]);
      return;
    }
    try {
      const [linksData, alertsData] = await Promise.all([
        ParentService.getLinks(),
        ParentService.getNotifications()
      ]);
      setLinks(linksData);
      setDbNotifications(alertsData);
    } catch (err: any) {
      if (err?.message !== 'Unauthorized') {
        console.error('Failed to fetch notifications data', err);
      }
    }
  };

  const fetchEnrollments = async () => {
    if (!user) {
      setEnrollments([]);
      return;
    }
    try {
      const res = await ProgramsService.getUserEnrollments();
      if (res && res.success && Array.isArray(res.data)) {
        setEnrollments(res.data);
      }
    } catch (err: any) {
      if (err?.message !== 'Unauthorized') {
        console.error('Failed to fetch user enrollments', err);
      }
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
    fetchEnrollments();

    // Optional: poll every minute
    const interval = setInterval(() => {
      fetchData();
      fetchEnrollments();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadPrefsAndData = () => {
      if (user?.id) {
        const storedPrefs = localStorage.getItem(`notificationPreferences_${user.id}`);
        if (storedPrefs) {
          try {
            setPrefs(JSON.parse(storedPrefs));
          } catch (e) {
            console.error('Failed to parse notifications storage', e);
          }
        }
      }
      fetchData();
      fetchEnrollments();
    };

    loadPrefsAndData();

    window.addEventListener('notification-preferences-updated', loadPrefsAndData);
    window.addEventListener('storage', loadPrefsAndData);

    return () => {
      window.removeEventListener('notification-preferences-updated', loadPrefsAndData);
      window.removeEventListener('storage', loadPrefsAndData);
    };
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await ParentService.acceptInvite(id);
      await fetchData();
      toast.success('Linking request accepted!');
      window.dispatchEvent(new Event('notification-preferences-updated'));
    } catch (err) {
      console.error('Failed to accept invite', err);
      toast.error('Failed to accept invite');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await ParentService.cancelInvite(id); // Using cancel endpoint to reject
      await fetchData();
      toast.success('Linking request declined.');
      window.dispatchEvent(new Event('notification-preferences-updated'));
    } catch (err) {
      console.error('Failed to reject invite', err);
      toast.error('Failed to decline invite');
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      // Optimistic update
      setDbNotifications(prev => prev.filter(a => a.id !== id));
      await ParentService.dismissNotification(id);
    } catch (err) {
      console.error('Failed to dismiss notification', err);
      toast.error('Failed to dismiss notification');
      fetchData();
    }
  };

  const handleClearAll = async () => {
    if (pendingRequests.length === 0 && activeAlerts.length === 0) {
      toast.error('No notifications to clear.');
      return;
    }

    // Clear linking requests locally and on server
    const idsToCancel = pendingRequests.map(r => r.id);
    if (idsToCancel.length > 0) {
      setLinks(prev => prev.map(link => idsToCancel.includes(link.id) ? { ...link, status: 'CANCELLED' as const } : link));
      for (const id of idsToCancel) {
        try {
          await ParentService.cancelInvite(id);
        } catch (err) {
          console.error('Failed to cancel invite', id, err);
        }
      }
    }

    // Clear db notifications locally and on server
    if (activeAlerts.length > 0) {
      const dbIdsToDismiss = activeAlerts.map(a => a.id);
      setDbNotifications(prev => prev.filter(a => !dbIdsToDismiss.includes(a.id)));
      try {
        await ParentService.clearAllNotifications();
      } catch (err) {
        console.error('Failed to clear notifications', err);
      }
    }

    toast.success('All notifications cleared!');
    fetchData();
  };

  // Only show pending requests where the current user is NOT the sender (i.e. they are receiving the request)
  const pendingRequests = links.filter(link => link.status === 'PENDING' && link.senderId !== user?.id);

  const isTeen = user?.role === 'TEEN';
  const isLinked = links.some(link => link.status === 'LINKED');

  // Filter real database-backed alerts based on rules
  const activeAlerts = dbNotifications.filter(alert => {
    // 1. Settings filter: if switch is disabled, hide it
    if (alert.type === 'inactivityAlert' && !prefs.inactivityAlert) return false;
    if (alert.type === 'upcomingSessions' && !prefs.upcomingSessions) return false;
    if (alert.type === 'weeklyPrompt' && !prefs.weeklyPrompt) return false;
    if (alert.type === 'newResource' && !prefs.newResource) return false;

    // 2. Inactivity alert check: only for parent dashboard, and parent must be linked to their daughter
    if (alert.type === 'inactivityAlert') {
      if (isTeen || !isLinked) return false;
    }

    // 3. Weekly prompt and library resource checks: if teen is unlinked, do not show parent notifications
    if (alert.type === 'weeklyPrompt' || alert.type === 'newResource') {
      if (isTeen && !isLinked) return false;
    }

    // 4. Expert session reminders: only show if the alert body matches a program the user is enrolled in.
    // Session notifications are generated per-user on the backend (userId === callerUserId),
    // so we just verify the program title in the notification matches one of the user's own enrollments.
    if (alert.type === 'upcomingSessions') {
      if (enrollments.length === 0) return false;

      const isEnrolledProgram = enrollments.some(enr => {
        if (!enr.program?.title) return false;
        const titleLower = enr.program.title.toLowerCase();
        return alert.body.toLowerCase().includes(titleLower);
      });

      if (!isEnrolledProgram) return false;
    }

    return true;
  });

  const totalCount = pendingRequests.length + activeAlerts.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 text-slate-400 hover:text-primary bg-slate-50 border border-slate-100 hover:bg-primary/5 rounded-2xl transition-all shadow-sm active:scale-95 relative"
      >
        <Bell size={18} />
        {totalCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-bold text-slate-855 text-xs">notifications</h3>
            <div className="flex gap-2.5">
              {totalCount > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-[10px] text-rose-500 hover:text-rose-705 font-bold uppercase tracking-wider transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsSidebarOpen(true);
                }}
                className="text-[10px] text-primary hover:text-primary-dark font-bold uppercase tracking-wider transition-colors"
              >
                View All
              </button>
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {pendingRequests.length === 0 && activeAlerts.length === 0 ? (
              <div className="p-6 text-center text-xs font-semibold text-slate-400">
                no new notifications
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {pendingRequests.map(req => {
                  const senderName = req.sender?.profile?.displayName || 'Someone';
                  const senderPhone = req.sender?.phone || '';

                  return (
                    <div key={req.id} className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                          <User size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-[9px] font-bold text-primary capitalize">linking request</p>
                            <span className="text-[9px] text-slate-400 shrink-0">{formatRelativeTime(req.createdAt)}</span>
                          </div>
                          <p className="text-xs font-medium text-slate-850 leading-tight mt-1">
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

                {activeAlerts.map(alert => (
                  <div key={alert.id} className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                        <Bell size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <p className="text-[10px] font-bold text-slate-400 capitalize truncate">{alert.title}</p>
                            <span className="text-[9px] text-slate-400 shrink-0">•</span>
                            <span className="text-[9px] text-slate-400 shrink-0">{formatRelativeTime(alert.sentAt)}</span>
                          </div>
                          <button
                            onClick={() => handleDismiss(alert.id)}
                            className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-655 transition-all shrink-0 ml-1"
                            title="dismiss"
                          >
                            <X size={10} />
                          </button>
                        </div>
                        <p className="text-xs font-medium text-slate-600 leading-snug mt-1">
                          {alert.body}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right Sidebar Drawer for Notifications */}
      {isSidebarOpen && mounted && createPortal(
        <>
          {/* Backdrop Overlay */}
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[190] cursor-pointer"
          />

          {/* Sidebar Panel */}
          <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-white z-[200] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm">all notifications</span>
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                  {totalCount}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {totalCount > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-[10px] text-rose-500 hover:text-rose-705 font-bold uppercase tracking-wider transition-colors mr-2"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-505 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {pendingRequests.length === 0 && activeAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center space-y-2">
                  <Bell size={28} className="opacity-20" />
                  <p className="text-xs font-semibold">no pending notifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map(req => {
                    const senderName = req.sender?.profile?.displayName || 'Someone';
                    const senderPhone = req.sender?.phone || '';

                    return (
                      <div key={req.id} className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-205 transition-colors shadow-xs">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                            <User size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-[9px] font-bold text-primary capitalize">linking request</p>
                              <span className="text-[9px] text-slate-400 shrink-0">{formatRelativeTime(req.createdAt)}</span>
                            </div>
                            <p className="text-xs font-medium text-slate-850 leading-tight mt-1">
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
                                className="flex-1 py-1.5 bg-slate-105 text-slate-655 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-1 border border-slate-200"
                              >
                                <X size={12} /> Decline
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {activeAlerts.map(alert => (
                    <div key={alert.id} className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-205 transition-colors shadow-xs">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                          <Bell size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <p className="text-[10px] font-bold text-slate-400 capitalize truncate">{alert.title}</p>
                              <span className="text-[9px] text-slate-400 shrink-0">•</span>
                              <span className="text-[9px] text-slate-400 shrink-0">{formatRelativeTime(alert.sentAt)}</span>
                            </div>
                            <button
                              onClick={() => handleDismiss(alert.id)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-655 transition-all shrink-0 ml-1"
                              title="dismiss"
                            >
                              <X size={12} />
                            </button>
                          </div>
                          <p className="text-xs font-medium text-slate-600 leading-snug mt-1">
                            {alert.body}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
