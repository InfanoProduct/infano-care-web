'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { User, Bell, Camera, Loader2, Save, HelpCircle, Link2, ShieldAlert, Sparkles, Send, BookOpen, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'faq'>('profile');
  
  const [formData, setFormData] = useState({
    displayName: user?.profile?.displayName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Sync state if user data is fetched post-mount by the layout
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      displayName: user?.profile?.displayName || prev.displayName,
      email: user?.email || prev.email,
      phone: user?.phone || prev.phone,
    }));
  }, [user]);

  const [notifications, setNotifications] = useState({
    inactivityAlert: true,
    upcomingSessions: true,
    weeklyPrompt: true,
    newResource: true,
    pushEnabled: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
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
          <div className="relative group cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
              {formData.displayName.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white w-4 h-4" />
            </div>
          </div>
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
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

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Changes
                </button>
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
                  onClick={() => handleToggle('pushEnabled')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all text-center ${notifications.pushEnabled ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
                >
                  <Send className="w-5 h-5 mx-auto mb-1.5" />
                  <span className="font-semibold text-xs block">Push & Email Alerts</span>
                  <span className="text-[10px] opacity-80">{notifications.pushEnabled ? 'Enabled' : 'Disabled'}</span>
                </button>
              </div>

              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 pt-3">
                <Sparkles size={16} className="text-primary" /> Alert Preferences
              </h2>

              <div className="space-y-3.5">
                <label className="flex items-center justify-between p-3.5 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0"><ShieldAlert size={16} /></div>
                    <div>
                      <p className="font-semibold text-xs text-slate-700">Daughter Inactivity (7 Days)</p>
                      <p className="text-[11px] text-slate-505">Alert if she hasn't logged in or viewed resources for a week</p>
                    </div>
                  </div>
                  <input type="checkbox" checked={notifications.inactivityAlert} onChange={() => handleToggle('inactivityAlert')} className="w-4 h-4 accent-primary" />
                </label>

                <label className="flex items-center justify-between p-3.5 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0"><Calendar size={16} /></div>
                    <div>
                      <p className="font-semibold text-xs text-slate-700">Upcoming Sessions</p>
                      <p className="text-[11px] text-slate-505">24-hour and 1-hour reminders before expert sessions</p>
                    </div>
                  </div>
                  <input type="checkbox" checked={notifications.upcomingSessions} onChange={() => handleToggle('upcomingSessions')} className="w-4 h-4 accent-primary" />
                </label>

                <label className="flex items-center justify-between p-3.5 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center shrink-0"><Sparkles size={16} /></div>
                    <div>
                      <p className="font-semibold text-xs text-slate-700">New Weekly Prompts</p>
                      <p className="text-[11px] text-slate-505">Get notified when fresh conversation starters are posted</p>
                    </div>
                  </div>
                  <input type="checkbox" checked={notifications.weeklyPrompt} onChange={() => handleToggle('weeklyPrompt')} className="w-4 h-4 accent-primary" />
                </label>

                <label className="flex items-center justify-between p-3.5 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0"><BookOpen size={16} /></div>
                    <div>
                      <p className="font-semibold text-xs text-slate-700">New Resources Added</p>
                      <p className="text-[11px] text-slate-505">Updates when expert articles or worksheets drop in the library</p>
                    </div>
                  </div>
                  <input type="checkbox" checked={notifications.newResource} onChange={() => handleToggle('newResource')} className="w-4 h-4 accent-primary" />
                </label>
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
              <p className="text-[11px] font-medium text-slate-500 mt-1.5 leading-relaxed">
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
    </div>
  );
}
