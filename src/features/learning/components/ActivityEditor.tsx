'use client';

import { useState } from 'react';
import { X, Plus, GripVertical, Trash2, Type, Video, HelpCircle, Save, ArrowLeft, Image as ImageIcon, MessageSquare, BarChart3 } from 'lucide-react';

interface Activity {
  id: string;
  type: 'text' | 'video' | 'quiz' | 'reflection' | 'image' | 'poll';
  content: any;
}

interface ActivityEditorProps {
  episodeId: string;
  episodeTitle: string;
  initialContent: Activity[];
  onSave: (content: Activity[]) => void;
  onBack: () => void;
}

export function ActivityEditor({ episodeId, episodeTitle, initialContent, onSave, onBack }: ActivityEditorProps) {
  const [activities, setActivities] = useState<Activity[]>(Array.isArray(initialContent) ? initialContent : []);

  const addActivity = (type: Activity['type']) => {
    const newActivity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: 
        type === 'text' ? '' : 
        type === 'video' ? { url: '' } : 
        type === 'image' ? { url: '', caption: '' } :
        type === 'reflection' ? { prompt: '' } :
        type === 'poll' ? { question: '', options: ['', ''] } :
        { questions: [] }
    };
    setActivities([...activities, newActivity]);
  };

  const removeActivity = (id: string) => {
    setActivities(activities.filter(a => a.id !== id));
  };

  const updateActivity = (id: string, newContent: any) => {
    setActivities(activities.map(a => a.id === id ? { ...a, content: newContent } : a));
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white border border-border rounded-2xl hover:bg-secondary transition-all shadow-sm group">
            <ArrowLeft size={24} className="text-muted-foreground group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-800">Content Builder</h2>
            <p className="text-muted-foreground font-medium">Episode: <span className="text-primary font-bold">{episodeTitle}</span></p>
          </div>
        </div>
        <button onClick={() => onSave(activities)} className="btn-primary flex items-center gap-2">
          <Save size={20} /> Publish Content
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Stack */}
        <div className="lg:col-span-2 space-y-6">
          {activities.map((activity, index) => (
            <div key={activity.id} className="glass-card rounded-3xl p-6 relative group border-white/50">
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 p-2 bg-white border border-border rounded-xl text-muted-foreground/30 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical size={16} />
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400">
                    {index + 1}
                  </span>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    activity.type === 'text' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    activity.type === 'video' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                    activity.type === 'image' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    activity.type === 'reflection' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                    activity.type === 'poll' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-slate-50 text-slate-600 border-slate-100'
                  }`}>
                    {activity.type === 'text' && <Type size={12} />}
                    {activity.type === 'video' && <Video size={12} />}
                    {activity.type === 'image' && <ImageIcon size={12} />}
                    {activity.type === 'reflection' && <MessageSquare size={12} />}
                    {activity.type === 'poll' && <BarChart3 size={12} />}
                    {activity.type === 'quiz' && <HelpCircle size={12} />}
                    {activity.type}
                  </div>
                </div>
                <button onClick={() => removeActivity(activity.id)} className="p-2 hover:bg-rose-50 rounded-lg text-rose-400 hover:text-rose-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>

              {activity.type === 'text' && (
                <textarea 
                  value={activity.content}
                  onChange={(e) => updateActivity(activity.id, e.target.value)}
                  className="w-full bg-slate-50 border border-border rounded-2xl p-4 min-h-[150px] outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium text-slate-700"
                  placeholder="Enter your educational content here..."
                />
              )}

              {activity.type === 'video' && (
                <input 
                  type="text"
                  value={activity.content.url}
                  onChange={(e) => updateActivity(activity.id, { url: e.target.value })}
                  className="w-full bg-slate-50 border border-border rounded-2xl p-4 outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-primary"
                  placeholder="Paste Video URL (e.g., YouTube)"
                />
              )}

              {activity.type === 'image' && (
                <div className="space-y-3">
                  <input 
                    type="text"
                    value={activity.content.url}
                    onChange={(e) => updateActivity(activity.id, { ...activity.content, url: e.target.value })}
                    className="w-full bg-slate-50 border border-border rounded-2xl p-4 outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-emerald-600"
                    placeholder="Image URL (https://...)"
                  />
                  <input 
                    type="text"
                    value={activity.content.caption}
                    onChange={(e) => updateActivity(activity.id, { ...activity.content, caption: e.target.value })}
                    className="w-full bg-slate-50 border border-border rounded-2xl p-4 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium"
                    placeholder="Image Caption (optional)"
                  />
                </div>
              )}

              {activity.type === 'reflection' && (
                <textarea 
                  value={activity.content.prompt}
                  onChange={(e) => updateActivity(activity.id, { prompt: e.target.value })}
                  className="w-full bg-slate-50 border border-border rounded-2xl p-4 min-h-[100px] outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-rose-600"
                  placeholder="Enter the reflection prompt for the user..."
                />
              )}

              {activity.type === 'poll' && (
                <div className="space-y-4">
                  <input 
                    type="text"
                    value={activity.content.question}
                    onChange={(e) => updateActivity(activity.id, { ...activity.content, question: e.target.value })}
                    className="w-full bg-slate-50 border border-border rounded-2xl p-4 outline-none focus:ring-4 focus:ring-primary/5 transition-all font-black text-slate-800"
                    placeholder="Poll Question?"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    {Array.isArray(activity.content.options) && activity.content.options.map((opt: string, i: number) => (
                      <input 
                        key={i}
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...activity.content.options];
                          newOpts[i] = e.target.value;
                          updateActivity(activity.id, { ...activity.content, options: newOpts });
                        }}
                        className="bg-white border border-border rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-primary"
                        placeholder={`Option ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activity.type === 'quiz' && (
                <div className="p-10 bg-slate-50 border-2 border-dashed border-border rounded-[2rem] text-center">
                  <HelpCircle className="mx-auto mb-3 text-muted-foreground/30" size={32} />
                  <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Quiz Builder Coming Soon</p>
                </div>
              )}
            </div>
          ))}

          {activities.length === 0 && (
            <div className="glass-card rounded-[2.5rem] p-24 text-center border-dashed border-2 border-primary/10">
              <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-primary/30">
                <Plus size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Your Canvas is Ready</h3>
              <p className="text-muted-foreground mt-3 font-medium max-w-sm mx-auto">Click on the activities in the right panel to start building your lesson curriculum.</p>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="space-y-6">
          <div className="glass-card rounded-[2.5rem] p-8 sticky top-8 border-white/60">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-8">Activity Library</h3>
            <div className="grid grid-cols-1 gap-4">
              <button onClick={() => addActivity('text')} className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:border-blue-500/30 hover:bg-blue-50/50 transition-all group">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Type size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800">Text Block</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Knowledge</p>
                </div>
              </button>

              <button onClick={() => addActivity('video')} className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:border-purple-500/30 hover:bg-purple-50/50 transition-all group">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Video size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800">Video Lesson</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Multimedia</p>
                </div>
              </button>

              <button onClick={() => addActivity('image')} className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:border-emerald-500/30 hover:bg-emerald-50/50 transition-all group">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ImageIcon size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800">Visual Image</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Illustration</p>
                </div>
              </button>

              <button onClick={() => addActivity('reflection')} className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:border-rose-500/30 hover:bg-rose-50/50 transition-all group">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800">Reflection</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Interaction</p>
                </div>
              </button>

              <button onClick={() => addActivity('poll')} className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:border-amber-500/30 hover:bg-amber-50/50 transition-all group">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800">Quick Poll</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Feedback</p>
                </div>
              </button>

              <button onClick={() => addActivity('quiz')} className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:border-slate-500/30 hover:bg-slate-50/50 transition-all group opacity-60">
                <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <HelpCircle size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800">Quiz Block</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Assessment</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
