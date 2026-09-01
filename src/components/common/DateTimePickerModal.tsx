'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgramsService } from '@/services/programs.service';

interface DateTimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: string, time: string) => void;
  initialDate?: string;
  initialTime?: string;
  maxDays?: number;
}

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM',
  '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM'
];

function parseLocalDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts.map(Number);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      const parsed = new Date(y, m - 1, d);
      parsed.setHours(0, 0, 0, 0);
      return parsed;
    }
  }
  const parsed = new Date(dateStr);
  parsed.setHours(0, 0, 0, 0);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function DateTimePickerModal({
  isOpen,
  onClose,
  onSelect,
  initialDate,
  initialTime,
  maxDays = 7,
}: DateTimePickerModalProps) {
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    parseLocalDate(initialDate)
  );
  const [confirmingTime, setConfirmingTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Fetch booked slots for selected date
  useEffect(() => {
    if (selectedDate) {
      const fetchBookedSlots = async () => {
        setLoadingSlots(true);
        try {
          const yearStr = selectedDate.getFullYear();
          const monthStr = String(selectedDate.getMonth() + 1).padStart(2, '0');
          const dayStr = String(selectedDate.getDate()).padStart(2, '0');
          const formattedDate = `${yearStr}-${monthStr}-${dayStr}`;
          
          const slots = await ProgramsService.getBookedSlots(formattedDate);
          setBookedSlots(slots || []);
        } catch (e) {
          console.error("Failed to fetch booked slots", e);
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchBookedSlots();
    } else {
      setBookedSlots([]);
    }
  }, [selectedDate]);

  // Reset confirming state when date changes
  useEffect(() => {
    setConfirmingTime(null);
  }, [selectedDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + maxDays);
  maxDate.setHours(23, 59, 59, 999);

  const canGoPrev = year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth());
  const canGoNext = year < maxDate.getFullYear() || (year === maxDate.getFullYear() && month < maxDate.getMonth());

  const handlePrevMonth = () => {
    if (canGoPrev) {
      setCurrentDate(new Date(year, month - 1, 1));
    }
  };

  const handleNextMonth = () => {
    if (canGoNext) {
      setCurrentDate(new Date(year, month + 1, 1));
    }
  };

  // Generate calendar grid array
  const calendarCells = [];
  
  // Previous month padding days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarCells.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevMonthDays - i)
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i)
    });
  }

  // Next month padding days to make grid complete (multiple of 7)
  const remaining = 42 - calendarCells.length;
  for (let i = 1; i <= remaining; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i)
    });
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setConfirmingTime(null);
  };

  const handleTimeClick = (time: string) => {
    setConfirmingTime(time);
  };

  const handleConfirm = (time: string) => {
    if (selectedDate) {
      const yearStr = selectedDate.getFullYear();
      const monthStr = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${yearStr}-${monthStr}-${dayStr}`;
      
      const [timePart, modifier] = time.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);
      
      let endMinutes = minutes + 30;
      let endHours = hours;
      let endModifier = modifier;
      
      if (endMinutes >= 60) {
        endMinutes -= 60;
        endHours += 1;
      }
      
      if (endHours === 12 && endMinutes === 0 && hours === 11) {
        endModifier = modifier === 'AM' ? 'PM' : 'AM';
      } else if (endHours > 12) {
        endHours -= 12;
      }
      
      const pad = (n: number) => String(n).padStart(2, '0');
      const formattedEndTime = `${pad(endHours)}:${pad(endMinutes)} ${endModifier}`;
      const apiTimeSlot = `${time} - ${formattedEndTime}`;
      
      onSelect(formattedDate, apiTimeSlot);
      onClose();
    }
  };

  const getDayFormattedHeader = () => {
    if (!selectedDate) return '';
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    return selectedDate.toLocaleDateString('en-US', options);
  };

  const getFilteredTimeSlots = () => {
    if (!selectedDate) return [];
    
    const isToday = selectedDate.getDate() === today.getDate() &&
                    selectedDate.getMonth() === today.getMonth() &&
                    selectedDate.getFullYear() === today.getFullYear();
                    
    if (!isToday) return TIME_SLOTS;
    
    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
    const minAllowedMinutes = currentTotalMinutes + 90; // First slot must be at least 1 hr 30 min from current time
    
    return TIME_SLOTS.filter(time => {
      const [timePart, modifier] = time.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);
      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      
      const slotTotalMinutes = hours * 60 + minutes;
      return slotTotalMinutes >= minAllowedMinutes;
    });
  };

  const filteredSlots = getFilteredTimeSlots();

  // Pre-calculate slot booking counts to keep JSX extremely simple
  const slotCounts = bookedSlots.reduce((acc, bookedTime) => {
    const startTime = bookedTime.split(' - ')[0];
    acc[startTime] = (acc[startTime] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm -z-10"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-[375px] max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl flex flex-col border border-slate-100 p-4 sm:p-5 my-auto scrollbar-thin"
        >
          {/* Header with Title & Close Button */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <CalendarIcon size={16} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 font-heading">
                  Select Slot
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold">
                  Pick date and time
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              aria-label="Close modal"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Calendar section */}
          <div className="w-full flex flex-col items-center">
            {/* Month selector */}
            <div className="w-full flex items-center justify-between mb-3 px-0.5 mt-1">
              <span className="text-sm font-extrabold text-slate-800 font-heading">
                {monthNames[month]} {year}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded-full border border-slate-100 hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={!canGoPrev}
                  aria-label="Previous month"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded-full border border-slate-100 hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={!canGoNext}
                  aria-label="Next month"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Days header */}
            <div className="w-full grid grid-cols-7 gap-1 text-center mb-1.5">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
                <span key={d} className="text-[9px] font-black text-slate-400 tracking-wider">
                  {d}
                </span>
              ))}
            </div>

            {/* Days grid */}
            <div className="w-full grid grid-cols-7 gap-1">
              {calendarCells.map((cell, idx) => {
                const isToday = cell.date.getTime() === today.getTime();
                const isBeforeToday = cell.date < today;
                const isAfterMax = cell.date > maxDate;
                const isSelected = selectedDate && cell.date.getTime() === selectedDate.getTime();
                const isActive = !isBeforeToday && !isAfterMax && cell.isCurrentMonth;

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!isActive}
                    onClick={() => handleDateSelect(cell.date)}
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all relative mx-auto ${
                      !cell.isCurrentMonth
                        ? 'text-slate-200 pointer-events-none'
                        : isSelected
                        ? 'bg-primary text-white font-extrabold shadow-sm'
                        : isActive
                        ? 'text-primary bg-primary/5 hover:bg-primary/10 font-bold'
                        : 'text-slate-300 cursor-not-allowed bg-transparent font-normal'
                    }`}
                  >
                    {cell.day}
                    {isToday && !isSelected && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slots section below calendar */}
          <div className="w-full mt-3 border-t border-slate-100 pt-3 flex flex-col">
            {selectedDate ? (
              <>
                <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2.5 text-center">
                  {getDayFormattedHeader()}
                </h4>

                {loadingSlots ? (
                  <div className="flex items-center justify-center py-6 text-primary">
                    <Loader2 size={18} className="animate-spin" />
                  </div>
                ) : filteredSlots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1 pb-2 scrollbar-thin">
                    {filteredSlots.map((time) => {
                      const isConfirming = confirmingTime === time;
                      const isBooked = (slotCounts[time] || 0) >= 2;

                      return (
                        <div key={time} className="w-full">
                          {isBooked ? (
                            <button
                              type="button"
                              disabled
                              className="w-full py-2 bg-slate-100 border border-slate-200 text-slate-400 text-[10px] font-bold rounded-xl cursor-not-allowed flex flex-col items-center justify-center"
                            >
                              <span>{time}</span>
                              <span className="text-[8px] font-extrabold uppercase text-slate-400 tracking-wider">Not available</span>
                            </button>
                          ) : isConfirming ? (
                            <div className="flex gap-1 w-full">
                              <button
                                type="button"
                                onClick={() => setConfirmingTime(null)}
                                className="flex-1 py-2 bg-slate-600 hover:bg-slate-700 text-white text-[10px] font-bold rounded-lg transition-all flex items-center justify-center shrink-0"
                              >
                                {time}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleConfirm(time)}
                                className="flex-1 py-2 bg-primary hover:bg-primary/90 text-white text-[10px] font-bold rounded-lg transition-all shadow-sm flex items-center justify-center animate-in slide-in-from-right duration-200 font-heading"
                              >
                                Confirm
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleTimeClick(time)}
                              className="w-full py-2 bg-white hover:bg-primary/5 border border-primary/20 text-primary text-[10px] font-bold rounded-xl transition-all hover:border-primary/50 shadow-3xs flex items-center justify-center"
                            >
                              {time}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-slate-400 text-xs font-semibold">
                    No available slots left for this date.
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-3.5 text-slate-400 text-xs font-semibold bg-slate-50/50 rounded-xl border border-dashed border-slate-100">
                Select a date above to view slots
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
