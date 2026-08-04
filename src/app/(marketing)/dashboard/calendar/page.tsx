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
      toast.error("Failed to fetch calendar settings.");
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
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-2xs">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
              <CalendarIcon size={18} className="text-indigo-600" />
            </span>
            My Calendar
          </h1>
          <p className="text-slate-505 text-xs font-semibold mt-1">Manage your availability, working hours, and booking policy.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-indigo-755 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-xs cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
          Save Changes
        </button>
      </div>

      <div className="flex gap-4 border-b border-slate-200 px-2">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-3 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'schedule' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarIcon size={14} />
          Schedule
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-3 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'settings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings size={14} />
          Settings
        </button>
      </div>

      {activeTab === 'settings' && (
        <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-2xs">
          {/* Timezone Setting */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100/50">
                <Globe className="text-blue-500 w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Timezone</h3>
                <p className="text-xs text-slate-505 mt-0.5">Select the timezone you operate in.</p>
              </div>
            </div>
            <select 
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full md:w-64 border border-slate-250 rounded-xl p-3 text-xs font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/35 outline-none bg-white transition-all shadow-sm"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
            </select>
          </div>

          {/* Reschedule Policy Setting */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100/50">
                <RefreshCcw className="text-emerald-500 w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Reschedule Policy</h3>
                <p className="text-xs text-slate-505 mt-0.5">Tell parents how late they can reschedule.</p>
              </div>
            </div>
            <input 
              type="text"
              value={reschedulePolicy}
              onChange={(e) => setReschedulePolicy(e.target.value)}
              placeholder="e.g. 24 hours prior"
              className="w-full md:w-64 border border-slate-250 rounded-xl p-3 text-xs font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/35 outline-none bg-white transition-all shadow-sm"
            />
          </div>

          {/* Booking Period Setting */}
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100/50">
                <CalendarRange className="text-amber-500 w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Booking Period (Months)</h3>
                <p className="text-xs text-slate-505 mt-0.5">How far in advance can parents book sessions?</p>
              </div>
            </div>
            <input 
              type="number"
              min="1" max="12"
              value={bookingPeriodMonths}
              onChange={(e) => setBookingPeriodMonths(parseInt(e.target.value) || 1)}
              className="w-full md:w-64 border border-slate-250 rounded-xl p-3 text-xs font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/35 outline-none bg-white transition-all shadow-sm"
            />
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-2xs">
              <h2 className="text-sm font-extrabold text-slate-800 mb-4">Weekly Working Hours</h2>
              <div className="space-y-4">
                {DAYS.map(day => {
                  const slots = defaultAvailability[day] || [];
                  const isAvailable = slots.length > 0;
                  return (
                    <div key={day} className="flex items-start gap-4 p-4 border border-slate-100 rounded-2xl bg-slate-50/20">
                      <div className="w-32 flex items-center gap-2 pt-2 shrink-0">
                        <input 
                          type="checkbox" 
                          checked={isAvailable}
                          onChange={(e) => {
                            if (e.target.checked) addSlot(day);
                            else setDefaultAvailability(prev => ({ ...prev, [day]: [] }));
                          }}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 accent-indigo-600 cursor-pointer"
                        />
                        <span className={`text-xs font-bold ${isAvailable ? 'text-slate-800' : 'text-slate-400'}`}>{day}</span>
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        {!isAvailable ? (
                          <div className="text-xs text-slate-400 font-semibold py-2">Unavailable</div>
                        ) : (
                          slots.map((slot, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input 
                                type="time"
                                value={slot.start}
                                onChange={(e) => updateSlot(day, idx, 'start', e.target.value)}
                                className="border border-slate-200 rounded-lg p-1.5 text-xs font-semibold outline-none focus:border-indigo-400"
                              />
                              <span className="text-slate-400 text-xs">-</span>
                              <input 
                                type="time"
                                value={slot.end}
                                onChange={(e) => updateSlot(day, idx, 'end', e.target.value)}
                                className="border border-slate-200 rounded-lg p-1.5 text-xs font-semibold outline-none focus:border-indigo-400"
                              />
                              <button onClick={() => removeSlot(day, idx)} className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer">
                                <X size={14} />
                              </button>
                            </div>
                          ))
                        )}
                        {isAvailable && (
                          <button onClick={() => addSlot(day)} className="text-xs text-indigo-600 hover:text-indigo-755 font-black flex items-center gap-1 mt-2 cursor-pointer">
                            <Plus size={11} /> Add Hours Slot
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
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-2xs">
              <h2 className="text-sm font-extrabold text-slate-800 mb-1">Block Dates</h2>
              <p className="text-[11px] font-semibold text-slate-400 mb-4">Add specific dates when you will be completely unavailable for bookings.</p>
              
              <div className="flex gap-2 mb-4">
                <input 
                  type="date"
                  value={newBlockDate}
                  onChange={(e) => setNewBlockDate(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 outline-none text-xs font-semibold focus:border-indigo-400"
                />
                <button onClick={addBlockDate} className="bg-slate-900 text-white px-3 py-2 rounded-xl hover:bg-slate-800 text-xs font-bold cursor-pointer">Add</button>
              </div>

              <div className="space-y-2">
                {blockDates.length === 0 ? (
                  <p className="text-xs text-slate-400 italic font-semibold">No blocked dates set.</p>
                ) : (
                  blockDates.map(date => (
                    <div key={date} className="flex justify-between items-center bg-rose-50/50 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-rose-100">
                      <span>{new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <button onClick={() => removeBlockDate(date)} className="text-rose-500 hover:text-rose-700 cursor-pointer">
                        <X size={14} />
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
