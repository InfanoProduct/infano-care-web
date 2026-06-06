'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { User, Bell, Camera, Loader2, Save, HelpCircle, Link2, ShieldAlert, Sparkles, Send, BookOpen, Calendar, X, Edit3 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'faq'>('profile');
  
  // Profile editing mode
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    displayName: user?.profile?.displayName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Sync state if user data is fetched post-mount by the layout
  useEffect(() => {
    if (!editMode) {
      setFormData({
        displayName: user?.profile?.displayName || '',
        email: user?.email || '',
        phone: user?.phone || '',
      });
    }
  }, [user, editMode]);

  // Avatar upload and circular cropping states
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropImgRef = useRef<HTMLImageElement>(null);

  // Notification states
  const [notifications, setNotifications] = useState({
    inactivityAlert: true,
    upcomingSessions: true,
    weeklyPrompt: true,
    newResource: true,
    pushEnabled: false,
  });

  // Load avatar and notification settings on mount
  useEffect(() => {
    if (user?.id) {
      const storedPhoto = localStorage.getItem(`profileAvatar_${user.id}`);
      if (storedPhoto) {
        setProfilePhoto(storedPhoto);
      }
      const storedPrefs = localStorage.getItem(`notificationPreferences_${user.id}`);
      if (storedPrefs) {
        try {
          setNotifications(JSON.parse(storedPrefs));
        } catch (e) {
          console.error('Failed to parse notifications storage', e);
        }
      }
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      if (user?.id) {
        localStorage.setItem(`notificationPreferences_${user.id}`, JSON.stringify(updated));

        // If enabling an alert, remove its ID from the dismissed list so it reappears
        if (updated[key]) {
          const storedDismissed = localStorage.getItem(`dismissedNotifications_${user.id}`);
          if (storedDismissed) {
            try {
              const dismissedList = JSON.parse(storedDismissed);
              let mockId = '';
              if (key === 'inactivityAlert') mockId = 'mock-inactivity';
              else if (key === 'weeklyPrompt') mockId = 'mock-prompt';
              else if (key === 'newResource') mockId = 'mock-resource';

              if (mockId) {
                const filtered = dismissedList.filter((id: string) => id !== mockId);
                localStorage.setItem(`dismissedNotifications_${user.id}`, JSON.stringify(filtered));
              } else if (key === 'upcomingSessions') {
                // Filter out any dismissed alert IDs that start with mock-session-
                const filtered = dismissedList.filter((id: string) => !id.startsWith('mock-session-'));
                localStorage.setItem(`dismissedNotifications_${user.id}`, JSON.stringify(filtered));
              }
            } catch (e) {
              console.error('Failed to update dismissed storage', e);
            }
          }
        }

        // Dispatch event to notify the notification bell to update immediately
        window.dispatchEvent(new Event('notification-preferences-updated'));
      }
      toast.success('Alert settings updated!');
      return updated;
    });
  };

  const handleCancelEdit = () => {
    setFormData({
      displayName: user?.profile?.displayName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setEditMode(false);
  };

  // Mouse and Touch Drag Handlers for circular cropper
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y
      });
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging && e.touches[0]) {
      setOffset({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
        setIsCropModalOpen(true);
        setZoom(1);
        setOffset({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCropSave = () => {
    if (!cropImgRef.current) return;
    const imgEl = cropImgRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = 250;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // The crop circle displays inside a 192px circular container.
    // The canvas is 250x250.
    const scaleFactor = 250 / 192;

    ctx.beginPath();
    ctx.arc(125, 125, 125, 0, Math.PI * 2);
    ctx.clip();

    const naturalWidth = imgEl.naturalWidth;
    const naturalHeight = imgEl.naturalHeight;
    
    let displayWidth = 192;
    let displayHeight = 192;
    if (naturalWidth >= naturalHeight) {
      displayHeight = 192;
      displayWidth = 192 * (naturalWidth / naturalHeight);
    } else {
      displayWidth = 192;
      displayHeight = 192 * (naturalHeight / naturalWidth);
    }

    const currentWidth = displayWidth * zoom;
    const currentHeight = displayHeight * zoom;

    // Centered relative coordinates on the 192x192 layout viewport
    const currentX = (192 - currentWidth) / 2 + offset.x;
    const currentY = (192 - currentHeight) / 2 + offset.y;

    const dx = currentX * scaleFactor;
    const dy = currentY * scaleFactor;
    const dw = currentWidth * scaleFactor;
    const dh = currentHeight * scaleFactor;

    ctx.drawImage(imgEl, dx, dy, dw, dh);

    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.95);
    
    if (user?.id) {
      localStorage.setItem(`profileAvatar_${user.id}`, croppedBase64);
    }
    setProfilePhoto(croppedBase64);
    setIsCropModalOpen(false);
    toast.success('Profile image updated!');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.put('/user/profile', {
        displayName: formData.displayName,
        email: formData.email,
      });
      
      toast.success('Profile preferences updated!');
      setEditMode(false);
      
      if (user) {
        setAuth(
          useAuthStore.getState().token || '',
          useAuthStore.getState().refreshToken || '',
          {
            ...user,
            email: formData.email,
            profile: user.profile 
              ? { ...user.profile, displayName: formData.displayName }
              : { displayName: formData.displayName }
          }
        );
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const isTeen = user?.role === 'TEEN';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 w-full max-w-[1280px]">
      {/* Premium Header */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/80 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-5">
          <div onClick={triggerFileInput} className="relative group cursor-pointer">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-105 flex items-center justify-center shadow-md relative border border-slate-200">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xl font-bold">
                  {formData.displayName.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white w-4 h-4" />
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <div className="text-center md:text-left">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              {isTeen ? 'My Space Settings' : 'Parent Profile & Preferences'}
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Manage your personal details, notification alerts, and learn how linking works.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`pb-2 px-4 text-xs font-bold border-b-2 transition-all ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Personal Info
        </button>
        <button 
          onClick={() => setActiveTab('notifications')}
          className={`pb-2 px-4 text-xs font-bold border-b-2 transition-all ${activeTab === 'notifications' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Alerts & Notifications
        </button>
      </div>

      {/* Content Area */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          
          {/* TAB 1: Profile */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-5 animate-in fade-in">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <User size={16} className="text-primary" /> Personal Information
              </h2>
              
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    disabled={!editMode}
                    className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-semibold transition-all ${
                      editMode 
                        ? 'bg-white border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-slate-800' 
                        : 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!editMode}
                      className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-semibold transition-all ${
                        editMode 
                          ? 'bg-white border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-slate-800' 
                          : 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      disabled
                      className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-[9px] text-slate-400 mt-1">Contact support to change primary phone.</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                {editMode ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="bg-slate-105 hover:bg-slate-200 text-slate-600 px-5 py-2.5 rounded-lg font-bold text-xs transition-all border border-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Edit3 size={14} />
                    Edit Profile
                  </button>
                )}
              </div>
            </form>
          )}

          {/* TAB 2: Notifications */}
          {activeTab === 'notifications' && (
            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Bell size={16} className="text-primary" /> Delivery Channels
                </h2>
              </div>
              
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => handleToggle('pushEnabled')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all text-center ${notifications.pushEnabled ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
                >
                  <Send className="w-5 h-5 mx-auto mb-1.5" />
                  <span className="font-semibold text-xs block">Push & Email Alerts</span>
                  <span className="text-[10px] opacity-80">{notifications.pushEnabled ? 'enabled' : 'disabled'}</span>
                </button>
              </div>

              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 pt-3">
                <Sparkles size={16} className="text-primary" /> Alert Preferences
              </h2>

              <div className="space-y-3.5">
                {!isTeen && (
                  <div className="flex items-center justify-between p-3.5 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0"><ShieldAlert size={16} /></div>
                      <div>
                        <p className="font-semibold text-xs text-slate-700">Daughter Inactivity (7 Days)</p>
                        <p className="text-[11px] text-slate-505">Alert if she hasn't logged in or viewed resources for a week</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors shrink-0 ${
                        notifications.inactivityAlert ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-550'
                      }`}>
                        {notifications.inactivityAlert ? 'enabled' : 'disabled'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggle('inactivityAlert')}
                        className={`w-9 h-5 rounded-full relative transition-colors duration-300 focus:outline-none shrink-0 ${
                          notifications.inactivityAlert ? 'bg-primary' : 'bg-slate-200'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform duration-300 transform ${
                            notifications.inactivityAlert ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-3.5 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0"><Calendar size={16} /></div>
                    <div>
                      <p className="font-semibold text-xs text-slate-700">Upcoming Sessions</p>
                      <p className="text-[11px] text-slate-505">24-hour and 1-hour reminders before expert sessions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors shrink-0 ${
                      notifications.upcomingSessions ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-550'
                    }`}>
                      {notifications.upcomingSessions ? 'enabled' : 'disabled'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggle('upcomingSessions')}
                      className={`w-9 h-5 rounded-full relative transition-colors duration-300 focus:outline-none shrink-0 ${
                        notifications.upcomingSessions ? 'bg-primary' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform duration-300 transform ${
                          notifications.upcomingSessions ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center shrink-0"><Sparkles size={16} /></div>
                    <div>
                      <p className="font-semibold text-xs text-slate-700">New Weekly Prompts</p>
                      <p className="text-[11px] text-slate-550">Get notified when fresh conversation starters are posted</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors shrink-0 ${
                      notifications.weeklyPrompt ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-550'
                    }`}>
                      {notifications.weeklyPrompt ? 'enabled' : 'disabled'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggle('weeklyPrompt')}
                      className={`w-9 h-5 rounded-full relative transition-colors duration-300 focus:outline-none shrink-0 ${
                        notifications.weeklyPrompt ? 'bg-primary' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform duration-300 transform ${
                          notifications.weeklyPrompt ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0"><BookOpen size={16} /></div>
                    <div>
                      <p className="font-semibold text-xs text-slate-700">New Resources Added</p>
                      <p className="text-[11px] text-slate-550">Updates when expert articles or worksheets drop in the library</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors shrink-0 ${
                      notifications.newResource ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-550'
                    }`}>
                      {notifications.newResource ? 'enabled' : 'disabled'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggle('newResource')}
                      className={`w-9 h-5 rounded-full relative transition-colors duration-300 focus:outline-none shrink-0 ${
                        notifications.newResource ? 'bg-primary' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform duration-300 transform ${
                          notifications.newResource ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Widget */}
        <div className="space-y-5">
          <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-5 text-center space-y-3">
            <div className="w-10 h-10 bg-white text-indigo-600 rounded-lg flex items-center justify-center mx-auto shadow-sm">
              <Link2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-indigo-900 text-base">{isTeen ? 'Parent Linking' : 'Daughter Linking'}</h3>
              <p className="text-[11px] font-medium text-slate-505 mt-1.5 leading-relaxed">
                Connect accounts to share progress updates and synchronize calendars.
              </p>
            </div>
            <Link 
              href="/dashboard/parent"
              className="block w-full py-2 bg-indigo-600 text-white border border-indigo-500 rounded-lg font-bold text-xs hover:bg-indigo-750 transition-all shadow-sm"
            >
              Manage Links
            </Link>
          </div>
        </div>
      </div>

      {/* Crop Modal Dialog */}
      {isCropModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4 animate-in scale-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Crop Profile Picture</h3>
              <button 
                type="button"
                onClick={() => setIsCropModalOpen(false)} 
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-105 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div 
              className="w-48 h-48 mx-auto rounded-full overflow-hidden border-2 border-primary bg-slate-950 relative cursor-move select-none"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              <img
                src={imageToCrop || ''}
                alt="To Crop"
                ref={cropImgRef}
                className="absolute max-w-none origin-center pointer-events-none"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                }}
              />
              <div className="absolute inset-0 rounded-full border-2 border-white/40 pointer-events-none" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Zoom</label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCropModalOpen(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold text-xs transition-colors border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropSave}
                className="flex-1 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-xs transition-colors shadow-sm"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
