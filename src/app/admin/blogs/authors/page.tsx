'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, User, Mail, Loader2, Edit, Trash2, CheckCircle2, X, Instagram } from 'lucide-react';
import { LinkedinIcon, TwitterIcon, InstagramIcon, FacebookIcon } from '@/components/icons';
import { blogService } from '@/services/blog.service';
import ImageUploader from '@/components/upload/ImageUploader';

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newAuthor, setNewAuthor] = useState({
    name: '',
    role: '',
    email: '',
    bio: '',
    linkedInUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    facebookUrl: '',
    instagramFollowers: '',
    facebookFollowers: '',
    linkedInFollowers: '',
    avatarUrl: ''
  });

  useEffect(() => {
    loadAuthors();
  }, []);

  const loadAuthors = async () => {
    setLoading(true);
    try {
      const data = await blogService.getAuthors() as any;
      setAuthors(data);
    } catch (error) {
      console.error('Failed to load authors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await blogService.updateAuthor(editingId, newAuthor);
      } else {
        await blogService.createAuthor(newAuthor);
      }
      setIsAdding(false);
      setEditingId(null);
      setNewAuthor({ name: '', role: '', email: '', bio: '', linkedInUrl: '', twitterUrl: '', instagramUrl: '', facebookUrl: '', instagramFollowers: '', facebookFollowers: '', linkedInFollowers: '', avatarUrl: '' });
      loadAuthors();
    } catch (error) {
      alert(editingId ? 'Failed to update author' : 'Failed to create author');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (author: any) => {
    setNewAuthor({
      name: author.name || '',
      role: author.role || '',
      email: author.email || '',
      bio: author.bio || '',
      linkedInUrl: author.linkedInUrl || '',
      twitterUrl: author.twitterUrl || '',
      instagramUrl: author.instagramUrl || '',
      facebookUrl: author.facebookUrl || '',
      instagramFollowers: author.instagramFollowers || '',
      facebookFollowers: author.facebookFollowers || '',
      linkedInFollowers: author.linkedInFollowers || '',
      avatarUrl: author.avatarUrl || ''
    });
    setEditingId(author.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this author?')) return;
    try {
      await blogService.deleteAuthor(id);
      loadAuthors();
    } catch (error) {
      alert('Failed to delete author');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Blog Authors</h1>
          <p className="text-muted-foreground mt-1">Manage the contributors behind your content</p>
        </div>
        <button 
          onClick={() => {
            setIsAdding(!isAdding);
            if (isAdding) {
              setEditingId(null);
              setNewAuthor({ name: '', role: '', email: '', bio: '', linkedInUrl: '', twitterUrl: '', instagramUrl: '', facebookUrl: '', instagramFollowers: '', facebookFollowers: '', linkedInFollowers: '', avatarUrl: '' });
            }
          }}
          className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl shadow-lg transition-all"
        >
          {isAdding ? 'Close Form' : <><Plus size={20} /> Add Contributor</>}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreateOrUpdate} className="glass-card p-8 rounded-[2.5rem] border-primary/10 shadow-2xl space-y-6 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">{editingId ? 'Edit Contributor' : 'New Contributor'}</h2>
            <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-muted-foreground hover:text-primary transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Full Name</label>
              <input
                required
                className="w-full bg-secondary/30 border-none rounded-2xl py-3 px-6 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={newAuthor.name}
                onChange={(e) => setNewAuthor({...newAuthor, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Role / Designation</label>
              <input
                className="w-full bg-secondary/30 border-none rounded-2xl py-3 px-6 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="e.g. Senior Editor"
                value={newAuthor.role}
                onChange={(e) => setNewAuthor({...newAuthor, role: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Email Address</label>
              <input
                type="email"
                className="w-full bg-secondary/30 border-none rounded-2xl py-3 px-6 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={newAuthor.email}
                onChange={(e) => setNewAuthor({...newAuthor, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">LinkedIn Profile</label>
              <input
                className="w-full bg-secondary/30 border-none rounded-2xl py-3 px-6 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={newAuthor.linkedInUrl}
                onChange={(e) => setNewAuthor({ ...newAuthor, linkedInUrl: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Instagram Profile</label>
              <input
                className="w-full bg-secondary/30 border-none rounded-2xl py-3 px-6 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={newAuthor.instagramUrl}
                onChange={(e) => setNewAuthor({ ...newAuthor, instagramUrl: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Facebook Profile</label>
              <input
                className="w-full bg-secondary/30 border-none rounded-2xl py-3 px-6 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={newAuthor.facebookUrl}
                onChange={(e) => setNewAuthor({ ...newAuthor, facebookUrl: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">IG Followers</label>
              <input
                className="w-full bg-secondary/30 border-none rounded-2xl py-3 px-6 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="e.g. 10k"
                value={newAuthor.instagramFollowers}
                onChange={(e) => setNewAuthor({ ...newAuthor, instagramFollowers: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">FB Followers</label>
              <input
                className="w-full bg-secondary/30 border-none rounded-2xl py-3 px-6 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="e.g. 5k"
                value={newAuthor.facebookFollowers}
                onChange={(e) => setNewAuthor({ ...newAuthor, facebookFollowers: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">LI Followers</label>
              <input
                className="w-full bg-secondary/30 border-none rounded-2xl py-3 px-6 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="e.g. 2k"
                value={newAuthor.linkedInFollowers}
                onChange={(e) => setNewAuthor({ ...newAuthor, linkedInFollowers: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <ImageUploader 
                label="Author Avatar" 
                value={newAuthor.avatarUrl}
                onUpload={(url) => setNewAuthor({...newAuthor, avatarUrl: url})} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Bio</label>
            <textarea
              className="w-full bg-secondary/30 border-none rounded-2xl py-4 px-6 font-medium min-h-[100px] focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
              value={newAuthor.bio}
              onChange={(e) => setNewAuthor({...newAuthor, bio: e.target.value})}
            />
          </div>
          <button type="submit" disabled={isSaving} className="btn-primary w-full py-4 rounded-2xl font-black shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
            {isSaving && <Loader2 className="animate-spin" size={20} />}
            {editingId ? 'Update Contributor Profile' : 'Create Contributor Profile'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {authors.map((author) => (
            <div key={author.id} className="glass-card rounded-3xl p-6 group hover:border-primary/20 transition-all duration-500">
              <div className="flex items-start gap-5 mb-6">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary/10 shadow-inner shrink-0 bg-secondary/30">
                  {author.avatarUrl ? (
                    <img src={author.avatarUrl} alt={author.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary/40">
                      <User size={32} />
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="text-xl font-bold truncate group-hover:text-primary transition-colors">{author.name}</h3>
                  <p className="text-primary font-black text-[10px] uppercase tracking-widest mt-1">{author.role}</p>
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm line-clamp-3 mb-6 font-medium leading-relaxed">
                {author.bio || 'No bio provided.'}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-primary/5">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(author)}
                    className="p-3 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-xl transition-all"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(author.id)}
                    className="p-3 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border/30 flex items-center gap-4">
                {author.email && (
                  <a href={`mailto:${author.email}`} className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-blue-500 hover:text-white transition-all">
                    <Mail size={18} />
                  </a>
                )}
                {author.linkedInUrl && (
                  <a href={author.linkedInUrl} target="_blank" className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-blue-600 hover:text-white transition-all">
                    <LinkedinIcon size={18} />
                  </a>
                )}
                {author.twitterUrl && (
                  <a href={author.twitterUrl} target="_blank" className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-sky-500 hover:text-white transition-all">
                    <TwitterIcon size={18} />
                  </a>
                )}
                {author.instagramUrl && (
                  <a href={author.instagramUrl} target="_blank" className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-pink-600 hover:text-white transition-all">
                    <InstagramIcon size={18} />
                  </a>
                )}
                {author.facebookUrl && (
                  <a href={author.facebookUrl} target="_blank" className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-blue-800 hover:text-white transition-all">
                    <FacebookIcon size={18} />
                  </a>
                )}
              </div>
            </div>
          ))}
          
          {authors.length === 0 && (
            <div className="col-span-full py-24 glass-card rounded-[2.5rem] border-dashed border-2 border-border/50 flex flex-col items-center justify-center opacity-40">
              <Users size={64} className="mb-4" />
              <p className="text-xl font-black">No authors found</p>
              <p className="font-bold">Add your first contributor to get started</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
