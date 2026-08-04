'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuthStore } from '@/store/auth-store';
import { User, Bell, Camera, Loader2, Save, HelpCircle, Link2, ShieldAlert, Sparkles, Send, BookOpen, Calendar, X, Edit3, ArrowLeft, Check } from 'lucide-react';
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
    specialisation: user?.profile?.specialisation || '',
    consultationPrice: user?.profile?.consultationPrice?.toString() || '500',
    bio: user?.profile?.bio || '',
  });

  // Sync state if user data is fetched post-mount by the layout
  useEffect(() => {
    if (!editMode) {
      setFormData({
        displayName: user?.profile?.displayName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        specialisation: user?.profile?.specialisation || '',
        consultationPrice: user?.profile?.consultationPrice?.toString() || '500',
        bio: user?.profile?.bio || '',
      });
    }
  }, [user, editMode]);

  // Avatar upload and cropping states
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [imageNaturalSize, setImageNaturalSize] = useState({ w: 0, h: 0 });
  const [imgDisplaySize, setImgDisplaySize] = useState({ w: 0, h: 0 });
  const [cropRect, setCropRect] = useState({ x: 0, y: 0, size: 200 });
  const [dragMode, setDragMode] = useState<'none' | 'move' | 'nw' | 'ne' | 'sw' | 'se'>('none');
  const [dragStart, setDragStart] = useState({ mx: 0, my: 0, cx: 0, cy: 0, cs: 0 });
  const [portalMounted, setPortalMounted] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropImgRef = useRef<HTMLImageElement>(null);

  // Portal mount detection for createPortal
  useEffect(() => {
    setPortalMounted(true);
  }, []);

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
      if (user.profile?.avatarUrl) {
        setProfilePhoto(user.profile.avatarUrl);
      } else {
        const storedPhoto = localStorage.getItem(`profileAvatar_${user.id}`);
        if (storedPhoto) {
          setProfilePhoto(storedPhoto);
        }
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

  const [allTopics, setAllTopics] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === 'PEER') {
      apiClient.get('/peerline/topics')
        .then((res: any) => setAllTopics(res?.topics || []))
        .catch(console.error);
    }
  }, [user?.role]);

  const getDisplayAge = useCallback(() => {
    if (user?.profile?.dateOfBirth) {
      const diff = Date.now() - new Date(user.profile.dateOfBirth).getTime();
      return Math.abs(new Date(diff).getUTCFullYear() - 1970).toString();
    }
    if (user?.peerApplication?.eligibility) {
      let eligibilityObj = user.peerApplication.eligibility;
      if (typeof eligibilityObj === 'string') {
        try { eligibilityObj = JSON.parse(eligibilityObj); } catch (e) { eligibilityObj = {}; }
      }
      if (eligibilityObj.age) return eligibilityObj.age.toString();
    }
    if (user?.ageAtSignup) {
      return user.ageAtSignup.toString();
    }
    return 'Not provided';
  }, [user]);

  const getSelectedTopicNames = useCallback(() => {
    if (user?.role !== 'PEER') return [];
    
    // First try certifiedTopicIds from profile if it exists and has items
    let topicIds: string[] = [];
    if (user?.profile?.certifiedTopicIds && user?.profile?.certifiedTopicIds.length > 0) {
      topicIds = user.profile.certifiedTopicIds;
    } else if (user?.peerApplication?.eligibility) {
      // Fallback to application eligibility
      let eligibilityObj = user.peerApplication.eligibility;
      if (typeof eligibilityObj === 'string') {
        try { eligibilityObj = JSON.parse(eligibilityObj); } catch (e) { eligibilityObj = {}; }
      }
      if (Array.isArray(eligibilityObj.topicIds)) {
        topicIds = eligibilityObj.topicIds;
      }
    }

    if (topicIds.length === 0) return [];
    
    // Map to names
    return topicIds.map(id => {
      const found = allTopics.find(t => t.id === id);
      return found ? found.name : id; // fallback to ID if name not found yet
    });
  }, [user, allTopics]);

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
      specialisation: user?.profile?.specialisation || '',
      consultationPrice: user?.profile?.consultationPrice?.toString() || '500',
      bio: user?.profile?.bio || '',
    });
    setEditMode(false);
  };

  // ── Google Photos-style Crop Frame Handlers ──
  const MIN_CROP_SIZE = 60;

  // Compute display size when image loads — fits image into available viewport
  const computeDisplaySize = useCallback((natW: number, natH: number) => {
    const maxW = Math.min(480, window.innerWidth - 48);
    const maxH = Math.min(420, window.innerHeight - 140);
    const aspect = natW / natH;
    let w = maxW;
    let h = w / aspect;
    if (h > maxH) {
      h = maxH;
      w = h * aspect;
    }
    return { w: Math.round(w), h: Math.round(h) };
  }, []);

  // Start a drag interaction (move or resize from corner)
  const startCropInteraction = useCallback((clientX: number, clientY: number, mode: 'move' | 'nw' | 'ne' | 'sw' | 'se') => {
    setDragMode(mode);
    setDragStart({ mx: clientX, my: clientY, cx: cropRect.x, cy: cropRect.y, cs: cropRect.size });
  }, [cropRect]);

  // Process drag movement
  const processCropDrag = useCallback((clientX: number, clientY: number) => {
    if (dragMode === 'none') return;
    const dx = clientX - dragStart.mx;
    const dy = clientY - dragStart.my;

    if (dragMode === 'move') {
      const newX = Math.max(0, Math.min(imgDisplaySize.w - dragStart.cs, dragStart.cx + dx));
      const newY = Math.max(0, Math.min(imgDisplaySize.h - dragStart.cs, dragStart.cy + dy));
      setCropRect(prev => ({ ...prev, x: newX, y: newY }));
    } else {
      // Corner resize — use average of dx/dy projections for uniform square sizing
      let delta = 0;
      if (dragMode === 'se') delta = (dx + dy) / 2;
      else if (dragMode === 'nw') delta = -(dx + dy) / 2;
      else if (dragMode === 'ne') delta = (dx - dy) / 2;
      else if (dragMode === 'sw') delta = (-dx + dy) / 2;

      let newSize = dragStart.cs + delta;

      // Compute max size based on which corner is anchored
      let maxSize = newSize;
      if (dragMode === 'se') maxSize = Math.min(imgDisplaySize.w - dragStart.cx, imgDisplaySize.h - dragStart.cy);
      else if (dragMode === 'nw') maxSize = Math.min(dragStart.cx + dragStart.cs, dragStart.cy + dragStart.cs);
      else if (dragMode === 'ne') maxSize = Math.min(imgDisplaySize.w - dragStart.cx, dragStart.cy + dragStart.cs);
      else if (dragMode === 'sw') maxSize = Math.min(dragStart.cx + dragStart.cs, imgDisplaySize.h - dragStart.cy);

      newSize = Math.max(MIN_CROP_SIZE, Math.min(newSize, maxSize));
      const sizeDiff = newSize - dragStart.cs;

      let newX = dragStart.cx;
      let newY = dragStart.cy;

      if (dragMode === 'nw') { newX = dragStart.cx - sizeDiff; newY = dragStart.cy - sizeDiff; }
      else if (dragMode === 'ne') { newY = dragStart.cy - sizeDiff; }
      else if (dragMode === 'sw') { newX = dragStart.cx - sizeDiff; }
      // 'se': x and y stay the same

      // Clamp position
      newX = Math.max(0, Math.min(newX, imgDisplaySize.w - newSize));
      newY = Math.max(0, Math.min(newY, imgDisplaySize.h - newSize));

      setCropRect({ x: newX, y: newY, size: newSize });
    }
  }, [dragMode, dragStart, imgDisplaySize]);

  const endCropInteraction = useCallback(() => {
    setDragMode('none');
  }, []);

  // Global mouse/touch listeners for drag
  useEffect(() => {
    if (dragMode === 'none') return;

    const onMouseMove = (e: MouseEvent) => { e.preventDefault(); processCropDrag(e.clientX, e.clientY); };
    const onTouchMove = (e: TouchEvent) => { if (e.touches[0]) { e.preventDefault(); processCropDrag(e.touches[0].clientX, e.touches[0].clientY); } };
    const onEnd = () => endCropInteraction();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [dragMode, processCropDrag, endCropInteraction]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          setImageNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
          const display = computeDisplaySize(img.naturalWidth, img.naturalHeight);
          setImgDisplaySize(display);
          // Initialize crop rect — centered square, 80% of smaller dimension
          const cropSize = Math.min(display.w, display.h) * 0.8;
          setCropRect({
            x: (display.w - cropSize) / 2,
            y: (display.h - cropSize) / 2,
            size: cropSize,
          });
          setImageToCrop(reader.result as string);
          setIsCropModalOpen(true);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCropSave = () => {
    if (!cropImgRef.current || !imgDisplaySize.w) return;
    const imgEl = cropImgRef.current;

    const outputSize = 500;
    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clip output to circle for profile avatar
    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.clip();

    // Map crop rect from display coordinates to natural image coordinates
    const scale = imgEl.naturalWidth / imgDisplaySize.w;
    const srcX = cropRect.x * scale;
    const srcY = cropRect.y * scale;
    const srcSize = cropRect.size * scale;

    ctx.drawImage(imgEl, srcX, srcY, srcSize, srcSize, 0, 0, outputSize, outputSize);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast.error('Failed to process cropped image');
        return;
      }

      // Validate image size (must be under 10MB)
      if (blob.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', blob, 'avatar.jpg');

        const response = await apiClient.request<{ success: boolean; avatarUrl: string; profile: any }>(
          '/user/profile/avatar',
          {
            method: 'POST',
            body: formData,
            headers: {
              'Content-Type': 'skip',
            },
          }
        );

        if (response.success && response.avatarUrl) {
          // Update profile photo locally
          setProfilePhoto(response.avatarUrl);
          
          // Save locally to localStorage as backup
          if (user?.id) {
            localStorage.setItem(`profileAvatar_${user.id}`, response.avatarUrl);
          }

          // Update useAuthStore profile state so other layout parts sync
          if (user) {
            setAuth(
              useAuthStore.getState().token || '',
              useAuthStore.getState().refreshToken || '',
              {
                ...user,
                profile: {
                  ...user.profile,
                  avatarUrl: response.avatarUrl,
                },
              }
            );
          }

          toast.success('Profile image updated successfully!');
          setIsCropModalOpen(false);
        } else {
          throw new Error('Image upload failed');
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to upload profile photo');
        console.error('Avatar upload error:', error);
      } finally {
        setUploading(false);
      }
    }, 'image/jpeg', 0.9);
  };

  // Corner handle component for the crop frame
  const CropCornerHandle = ({ corner, cursor }: { corner: 'nw' | 'ne' | 'sw' | 'se'; cursor: string }) => {
    const borderClasses = {
      nw: 'top-[-2px] left-[-2px] border-t-[3px] border-l-[3px]',
      ne: 'top-[-2px] right-[-2px] border-t-[3px] border-r-[3px]',
      sw: 'bottom-[-2px] left-[-2px] border-b-[3px] border-l-[3px]',
      se: 'bottom-[-2px] right-[-2px] border-b-[3px] border-r-[3px]',
    };
    return (
      <div
        className={`absolute w-6 h-6 border-white ${borderClasses[corner]} z-10`}
        style={{ cursor }}
        onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); startCropInteraction(e.clientX, e.clientY, corner); }}
        onTouchStart={(e) => { e.stopPropagation(); if (e.touches[0]) startCropInteraction(e.touches[0].clientX, e.touches[0].clientY, corner); }}
      />
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const isExpert = user?.role === 'EXPERT';
      await apiClient.put('/user/profile', {
        displayName: formData.displayName,
        email: formData.email,
        ...(isExpert && {
          specialisation: formData.specialisation,
          consultationPrice: formData.consultationPrice ? parseFloat(formData.consultationPrice) : null,
          bio: formData.bio
        })
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
            profile: {
              ...user.profile,
              displayName: formData.displayName,
              ...(isExpert && {
                specialisation: formData.specialisation,
                consultationPrice: formData.consultationPrice ? parseFloat(formData.consultationPrice) : null,
                bio: formData.bio
              })
            }
          }
        );
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const isTeen = user?.role === 'TEEN' || (user?.role === 'PEER' && user?.contentTier && user?.contentTier !== 'ADULT');

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

                <div className="grid grid-cols-2 gap-3">
                  <div className={user?.role === 'PEER' ? '' : 'col-span-2'}>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Age</label>
                    <input
                      type="text"
                      value={getDisplayAge()}
                      disabled
                      className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  {user?.role === 'PEER' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Selected Topics</label>
                      <div className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm font-semibold text-slate-500 cursor-not-allowed min-h-[42px] flex flex-wrap gap-1">
                        {getSelectedTopicNames().length > 0 ? (
                          getSelectedTopicNames().map((topicName: string, idx: number) => (
                            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                              {topicName}
                            </span>
                          ))
                        ) : (
                          <span>None selected</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {user?.role === 'EXPERT' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Specialisation</label>
                      <input
                        type="text"
                        name="specialisation"
                        value={formData.specialisation}
                        onChange={handleChange}
                        disabled={!editMode}
                        placeholder="e.g. Pediatrician, Counselor"
                        className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-semibold transition-all ${
                          editMode 
                            ? 'bg-white border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-slate-800' 
                            : 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Consultation Price (₹)</label>
                      <input
                        type="number"
                        name="consultationPrice"
                        value={formData.consultationPrice}
                        onChange={handleChange}
                        disabled={!editMode}
                        min="0"
                        className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-semibold transition-all ${
                          editMode 
                            ? 'bg-white border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-slate-800' 
                            : 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {user?.role === 'EXPERT' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      disabled={!editMode}
                      rows={3}
                      className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-semibold transition-all resize-none ${
                        editMode 
                          ? 'bg-white border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-slate-800' 
                          : 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                      }`}
                    />
                  </div>
                )}
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
      {isCropModalOpen && portalMounted && createPortal(
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ zIndex: 99999 }}
          onClick={() => setIsCropModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg md:max-w-xl flex flex-col overflow-hidden max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header bar — light background */}
            <div className="flex items-center justify-between px-6 h-14 shrink-0 border-b border-slate-100 bg-white">
              <h3 className="text-slate-800 font-bold text-sm tracking-wide">Crop Profile Photo</h3>
              <button 
                type="button"
                onClick={() => setIsCropModalOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Crop workspace — image with crop overlay, light workspace background */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-slate-50 p-6 min-h-[320px] max-h-[55vh]">
              {/* Image container */}
              <div 
                className="relative select-none animate-in fade-in duration-300"
                style={{ width: imgDisplaySize.w, height: imgDisplaySize.h }}
              >
                {/* The actual image */}
                <img
                  src={imageToCrop || ''}
                  alt="Crop preview"
                  ref={cropImgRef}
                  draggable={false}
                  className="w-full h-full block"
                  style={{ userSelect: 'none' }}
                />

                {/* Crop frame — circular crop area inside a rectangular cropper border */}
                <div
                  className="absolute"
                  style={{
                    left: cropRect.x,
                    top: cropRect.y,
                    width: cropRect.size,
                    height: cropRect.size,
                    cursor: dragMode === 'move' ? 'grabbing' : 'move',
                  }}
                  onMouseDown={(e) => { e.preventDefault(); startCropInteraction(e.clientX, e.clientY, 'move'); }}
                  onTouchStart={(e) => { if (e.touches[0]) startCropInteraction(e.touches[0].clientX, e.touches[0].clientY, 'move'); }}
                >
                  {/* Circular Crop Area Mask with shadow cutout */}
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                      border: '2px solid rgba(255, 255, 255, 0.85)',
                    }}
                  />

                  {/* Rectangular cropper border outer edge */}
                  <div className="absolute inset-0 border border-white/30 pointer-events-none" />

                  {/* L-shaped corner handles */}
                  <CropCornerHandle corner="nw" cursor="nwse-resize" />
                  <CropCornerHandle corner="ne" cursor="nesw-resize" />
                  <CropCornerHandle corner="sw" cursor="nesw-resize" />
                  <CropCornerHandle corner="se" cursor="nwse-resize" />
                </div>
              </div>
            </div>

            {/* Bottom action bar — light background */}
            <div className="flex items-center justify-between px-6 h-16 shrink-0 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                disabled={uploading}
                onClick={() => {
                  // Reset crop to centered default
                  const cropSize = Math.min(imgDisplaySize.w, imgDisplaySize.h) * 0.8;
                  setCropRect({
                    x: (imgDisplaySize.w - cropSize) / 2,
                    y: (imgDisplaySize.h - cropSize) / 2,
                    size: cropSize,
                  });
                }}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg font-semibold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => setIsCropModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg font-semibold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={handleCropSave}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition-all shadow-sm shadow-indigo-600/10 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
