'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Settings, Calendar as CalendarIcon, Save, X, Plus, Globe, RefreshCcw, CalendarRange } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ExpertCalendarPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'schedule' | 'settings'>('schedule');
  const [loading, setLoading] = useState(false);

  // Settings
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [reschedulePolicy, setReschedulePolicy] = useState('24 hours prior');
  const [bookingPeriodMonths, setBookingPeriodMonths] = useState(2);

  // Schedule
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [defaultAvailability, setDefaultAvailability] = useState<Record<string, {start: string, end: string}[]>>({});
  const [blockDates, setBlockDates] = useState<string[]>([]);
  const [newBlockDate, setNewBlockDate] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expert/calendar`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          setTimezone(data.timezone || 'Asia/Kolkata');
          setReschedulePolicy(data.reschedulePolicy || '24 hours prior');
          setBookingPeriodMonths(data.bookingPeriodMonths || 2);
          setDefaultAvailability(data.defaultAvailability || {});
          setBlockDates(data.blockDates || []);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expert/calendar`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          timezone,
          reschedulePolicy,
          bookingPeriodMonths,
          defaultAvailability,
          blockDates
        })
      });
      if (res.ok) {
        toast.success("Calendar settings saved successfully!");
      } else {
        const errorText = await res.text();
        console.error("Save failed:", errorText);
        toast.error(`Failed to save settings: ${errorText}`);
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  const addSlot = (day: string) => {
    setDefaultAvailability(prev => {
      const slots = prev[day] || [];
      return { ...prev, [day]: [...slots, { start: "09:00", end: "17:00" }] };
    });
  };

  const updateSlot = (day: string, index: number, field: 'start'|'end', value: string) => {
    setDefaultAvailability(prev => {
      const slots = [...(prev[day] || [])];
      slots[index] = { ...slots[index], [field]: value };
      return { ...prev, [day]: slots };
    });
  };

  const removeSlot = (day: string, index: number) => {
    setDefaultAvailability(prev => {
      const slots = [...(prev[day] || [])];
      slots.splice(index, 1);
      return { ...prev, [day]: slots };
    });
  };

  const addBlockDate = () => {
    if (newBlockDate && !blockDates.includes(newBlockDate)) {
      setBlockDates([...blockDates, newBlockDate]);
      setNewBlockDate('');
    }
  };

  const removeBlockDate = (date: string) => {
    setBlockDates(blockDates.filter(d => d !== date));
  };

  return (
    <div className="space-y-6 w-full max-w-[1280px] mx-auto pb-8 font-sans">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight">My Calendar</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your availability and booking settings.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-70"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="flex gap-4 border-b border-slate-200 px-2">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'schedule' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          Schedule
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>

      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Timezone Setting */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100/50">
                <Globe className="text-blue-500 w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Timezone</h3>
                <p className="text-xs text-slate-500 mt-0.5">Select the timezone you operate in.</p>
              </div>
            </div>
            <select 
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full md:w-64 border border-slate-200 rounded-xl p-3 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none bg-white transition-all shadow-sm"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
            </select>
          </div>

          {/* Reschedule Policy Setting */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100/50">
                <RefreshCcw className="text-emerald-500 w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Reschedule Policy</h3>
                <p className="text-xs text-slate-500 mt-0.5">Tell parents how late they can reschedule.</p>
              </div>
            </div>
            <input 
              type="text"
              value={reschedulePolicy}
              onChange={(e) => setReschedulePolicy(e.target.value)}
              placeholder="e.g. 24 hours prior"
              className="w-full md:w-64 border border-slate-200 rounded-xl p-3 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none bg-white transition-all shadow-sm"
            />
          </div>

          {/* Booking Period Setting */}
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100/50">
                <CalendarRange className="text-amber-500 w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Booking Period (Months)</h3>
                <p className="text-xs text-slate-500 mt-0.5">How far in advance can parents book sessions?</p>
              </div>
            </div>
            <input 
              type="number"
              min="1" max="12"
              value={bookingPeriodMonths}
              onChange={(e) => setBookingPeriodMonths(parseInt(e.target.value) || 1)}
              className="w-full md:w-64 border border-slate-200 rounded-xl p-3 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none bg-white transition-all shadow-sm"
            />
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Weekly Hours</h2>
              <div className="space-y-4">
                {DAYS.map(day => {
                  const slots = defaultAvailability[day] || [];
                  const isAvailable = slots.length > 0;
                  return (
                    <div key={day} className="flex items-start gap-4 p-4 border border-slate-100 rounded-lg">
                      <div className="w-32 flex items-center gap-2 pt-2">
                        <input 
                          type="checkbox" 
                          checked={isAvailable}
                          onChange={(e) => {
                            if (e.target.checked) addSlot(day);
                            else setDefaultAvailability(prev => ({ ...prev, [day]: [] }));
                          }}
                          className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300"
                        />
                        <span className={`font-medium ${isAvailable ? 'text-slate-800' : 'text-slate-400'}`}>{day}</span>
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        {!isAvailable ? (
                          <div className="text-sm text-slate-400 py-2">Unavailable</div>
                        ) : (
                          slots.map((slot, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input 
                                type="time"
                                value={slot.start}
                                onChange={(e) => updateSlot(day, idx, 'start', e.target.value)}
                                className="border border-slate-200 rounded p-1.5 text-sm"
                              />
                              <span className="text-slate-400">-</span>
                              <input 
                                type="time"
                                value={slot.end}
                                onChange={(e) => updateSlot(day, idx, 'end', e.target.value)}
                                className="border border-slate-200 rounded p-1.5 text-sm"
                              />
                              <button onClick={() => removeSlot(day, idx)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        )}
                        {isAvailable && (
                          <button onClick={() => addSlot(day)} className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 mt-2">
                            <Plus className="w-3 h-3" /> Add hours
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-semibold mb-1">Block Dates</h2>
              <p className="text-sm text-slate-500 mb-4">Add specific dates when you are completely unavailable.</p>
              
              <div className="flex gap-2 mb-4">
                <input 
                  type="date"
                  value={newBlockDate}
                  onChange={(e) => setNewBlockDate(e.target.value)}
                  className="flex-1 border border-slate-300 rounded-lg p-2 outline-none"
                />
                <button onClick={addBlockDate} className="bg-slate-800 text-white px-3 py-2 rounded-lg hover:bg-slate-700 text-sm font-medium">Add</button>
              </div>

              <div className="space-y-2">
                {blockDates.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No blocked dates.</p>
                ) : (
                  blockDates.map(date => (
                    <div key={date} className="flex justify-between items-center bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm border border-red-100">
                      <span>{new Date(date).toLocaleDateString()}</span>
                      <button onClick={() => removeBlockDate(date)} className="hover:text-red-900">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
