'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Link as LinkIcon, ExternalLink, Check } from 'lucide-react';
import { blogService } from '@/services/blog.service';
import { toast } from 'react-hot-toast';

export interface ImageUploaderProps {
  onUpload: (url: string) => void;
  label?: string;
  description?: string;
  value?: string;
  folder?: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'banner' | 'wide' | 'auto';
  helperText?: string;
  showUrlToggle?: boolean;
}

export default function ImageUploader({
  onUpload,
  label,
  description,
  value,
  folder = 'blog',
  className = '',
  aspectRatio = 'video',
  helperText = 'PNG, JPG or WebP (max. 5MB)',
  showUrlToggle = true,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value || '');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle external value changes
  useEffect(() => {
    if (value !== undefined) {
      setPreview(value || '');
      setUrlInput(value || '');
    }
  }, [value]);

  const handleUploadFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WebP, etc.)');
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const result = (await blogService.uploadImage(file, folder)) as any;
      if (result && result.url) {
        onUpload(result.url);
        setPreview(result.url);
        setUrlInput(result.url);
        toast.success('Image uploaded successfully');
      } else {
        throw new Error('No URL returned from server');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image to server');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleUrlApply = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      clearImage();
      return;
    }
    setPreview(trimmed);
    onUpload(trimmed);
    toast.success('Image URL applied');
  };

  const clearImage = () => {
    setPreview('');
    setUrlInput('');
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'banner':
        return 'aspect-[21/9]';
      case 'wide':
        return 'aspect-[16/10]';
      case 'auto':
        return 'min-h-[160px]';
      case 'video':
      default:
        return 'aspect-video';
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          {label && (
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-0.5 block">
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 pl-0.5">{description}</p>
          )}
        </div>
        {showUrlToggle && !preview && (
          <div className="flex items-center gap-1 text-[11px] bg-muted/60 p-0.5 rounded-lg border border-border/50">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                mode === 'upload'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                mode === 'url'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Paste URL
            </button>
          </div>
        )}
      </div>

      <div className="relative group/box">
        {preview ? (
          <div
            className={`relative w-full ${getAspectClass()} rounded-2xl overflow-hidden border border-border/60 bg-muted/20 shadow-xs group`}
          >
            <img
              src={preview}
              alt="Thumbnail preview"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />

            {/* Hover actions overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] flex items-center justify-center gap-3 p-4">
              <label
                title="Upload replacement image"
                className="cursor-pointer p-2.5 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 text-white transition-all transform hover:scale-105 shadow-sm"
              >
                <Upload size={18} />
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>

              {preview.startsWith('http') && (
                <a
                  href={preview}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View full image"
                  className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 text-white transition-all transform hover:scale-105 shadow-sm"
                >
                  <ExternalLink size={18} />
                </a>
              )}

              <button
                type="button"
                onClick={clearImage}
                title="Remove image"
                className="p-2.5 bg-red-500/30 backdrop-blur-md rounded-xl hover:bg-red-500/50 text-white transition-all transform hover:scale-105 shadow-sm"
              >
                <X size={18} />
              </button>
            </div>

            {/* Uploading indicator */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center flex-col gap-2.5 z-10">
                <Loader2 className="animate-spin text-primary" size={32} />
                <span className="text-white font-semibold text-xs tracking-wide">Uploading to server...</span>
              </div>
            )}
          </div>
        ) : mode === 'upload' ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center w-full ${getAspectClass()} border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-primary bg-primary/10 scale-[0.99]'
                : 'border-border/80 hover:border-primary/50 hover:bg-primary/5 bg-muted/10'
            }`}
          >
            <div className="flex flex-col items-center justify-center p-6 text-center">
              {isUploading ? (
                <Loader2 className="animate-spin text-primary mb-3" size={32} />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3 shadow-xs group-hover/box:scale-110 transition-transform">
                  <Upload size={22} />
                </div>
              )}
              <p className="text-sm font-bold text-foreground">
                {isUploading ? 'Uploading to server...' : isDragging ? 'Drop image here' : 'Click or drag image to upload'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{helperText}</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
        ) : (
          <div className="p-4 rounded-2xl border border-border/80 bg-muted/10 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleUrlApply();
                    }
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                />
              </div>
              <button
                type="button"
                onClick={handleUrlApply}
                className="px-4 py-2.5 bg-primary text-primary-foreground font-semibold text-xs rounded-xl hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-xs shrink-0"
              >
                <Check size={14} /> Apply
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">Paste a direct image URL (e.g. from Unsplash, AWS S3, Cloudinary)</p>
          </div>
        )}
      </div>
    </div>
  );
}
