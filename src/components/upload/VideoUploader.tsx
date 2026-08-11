'use client';

import { useState, useEffect } from 'react';
import { Upload, X, Loader2, Video as VideoIcon } from 'lucide-react';
import { blogService } from '@/services/blog.service';

interface VideoUploaderProps {
  onUpload: (url: string) => void;
  label?: string;
  value?: string;
  folder?: string;
}

export default function VideoUploader({ onUpload, label, value, folder = 'lms' }: VideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');

  // Handle external value changes (e.g. initial load or manual URL input)
  useEffect(() => {
    if (value !== undefined) {
      setPreview(value || '');
    }
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview (create object URL for video preview)
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    setIsUploading(true);
    try {
      const result = await blogService.uploadImage(file, folder) as any;
      onUpload(result.url);
      setPreview(result.url);
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert('Failed to upload video: ' + (error.message || error.toString()));
      // Reset preview if upload failed
      setPreview(value || '');
    } finally {
      setIsUploading(false);
      // Clean up object URL if it was created
      if (objectUrl.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrl);
      }
    }
  };

  const clearVideo = () => {
    setPreview('');
    onUpload('');
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">{label}</label>}
      
      <div className="relative">
        {preview ? (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-primary/10 group bg-slate-900 flex items-center justify-center">
            <video src={preview} controls className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <label className="cursor-pointer p-3 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-all">
                <Upload size={20} className="text-white" />
                <input type="file" className="hidden" accept="video/*" onChange={handleFileChange} disabled={isUploading} />
              </label>
              <button 
                type="button"
                onClick={clearVideo}
                className="p-3 bg-red-500/20 backdrop-blur-md rounded-xl hover:bg-red-500/40 transition-all"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center flex-col gap-2">
                <Loader2 className="animate-spin text-white" size={32} />
                <span className="text-white font-bold text-xs">Uploading Video...</span>
              </div>
            )}
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-primary/20 rounded-2xl cursor-pointer hover:bg-primary/5 transition-all group bg-slate-50">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {isUploading ? (
                <Loader2 className="animate-spin text-primary mb-2" size={32} />
              ) : (
                <VideoIcon className="text-primary/40 group-hover:text-primary mb-2" size={32} />
              )}
              <p className="text-sm font-bold text-muted-foreground">
                {isUploading ? 'Uploading to server...' : 'Click to upload video'}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">MP4, WebM, or OGG (max. 200MB)</p>
            </div>
            <input type="file" className="hidden" accept="video/*" onChange={handleFileChange} disabled={isUploading} />
          </label>
        )}
      </div>
    </div>
  );
}
