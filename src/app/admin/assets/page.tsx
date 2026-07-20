'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Image as ImageIcon, Plus, Search, Copy, Check, Trash2, Eye, X, 
  Loader2, UploadCloud, FileImage, ExternalLink, Calendar, HardDrive,
  FileText, Film, Grid
} from 'lucide-react';
import { AssetsService, Asset } from '@/services/assets.service';
import { toast } from 'react-hot-toast';
import { copyToClipboard } from '@/lib/utils';

const isVideo = (urlOrName: string) => {
  const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.ogg', '.3gp'];
  const lower = urlOrName.toLowerCase();
  return videoExtensions.some(ext => lower.endsWith(ext));
};

const isGif = (urlOrName: string) => {
  return urlOrName.toLowerCase().endsWith('.gif');
};

const isPdf = (urlOrName: string) => {
  return urlOrName.toLowerCase().endsWith('.pdf');
};

const isImage = (urlOrName: string) => {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.bmp', '.tiff', '.ico'];
  const lower = urlOrName.toLowerCase();
  return imageExtensions.some(ext => lower.endsWith(ext)) && !lower.endsWith('.gif');
};

const getDisplayName = (filename: string) => {
  const extIndex = filename.lastIndexOf('.');
  const nameWithoutExt = extIndex !== -1 ? filename.substring(0, extIndex) : filename;
  
  const uuidPattern = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';
  const suffixRegex = new RegExp(`-${uuidPattern}$`);
  
  const displayName = nameWithoutExt.replace(suffixRegex, '');
  return displayName || nameWithoutExt;
};

export default function AssetsManagement() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video' | 'gif' | 'pdf'>('all');
  const [copiedFilename, setCopiedFilename] = useState<string | null>(null);
  
  // Drag and drop states
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [currentFileProgress, setCurrentFileProgress] = useState<number>(0);
  
  // Lightbox Modal state
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load assets from server
  const loadAssets = useCallback(async (showSilent = false) => {
    if (!showSilent) setLoading(true);
    try {
      const data = await AssetsService.getAssets();
      setAssets(data);
    } catch (error) {
      console.error('Failed to load assets:', error);
      toast.error('Failed to load assets');
    } finally {
      if (!showSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  // Format file size
  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Unknown date';
    }
  };

  // Clipboard copy
  const handleCopyUrl = async (url: string, filename: string) => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedFilename(filename);
      toast.success('Copied image URL to clipboard!');
      setTimeout(() => {
        setCopiedFilename(null);
      }, 2000);
    } else {
      toast.error('Failed to copy link');
    }
  };

  // Delete handler
  const handleDeleteAsset = async (filename: string) => {
    if (!confirm(`Are you sure you want to permanently delete this asset?\n\n${filename}\n\nAny content relying on this URL will break.`)) {
      return;
    }
    
    try {
      await AssetsService.deleteAsset(filename);
      toast.success('Asset deleted successfully');
      setAssets(prev => prev.filter(item => item.filename !== filename));
      if (selectedAsset?.filename === filename) {
        setSelectedAsset(null);
      }
    } catch (error) {
      console.error('Failed to delete asset:', error);
      toast.error('Failed to delete asset');
    }
  };

  // File Upload handler
  const handleUploadFiles = async (files: FileList) => {
    if (files.length === 0) return;
    
    setUploading(true);
    setCurrentFileProgress(0);
    let successCount = 0;
    let failCount = 0;

    const uploadedInBatch = new Set<string>();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Image, PDF, or Video check
      const isImg = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      const isVid = file.type.startsWith('video/');

      if (!isImg && !isPdf && !isVid) {
        toast.error(`${file.name} is not a supported file type (Image, PDF, or Video)`);
        failCount++;
        continue;
      }

      // Duplicate check
      const extIndex = file.name.lastIndexOf('.');
      const fileExt = extIndex !== -1 ? file.name.substring(extIndex) : '';
      const rawBaseName = extIndex !== -1 ? file.name.substring(0, extIndex) : file.name;
      const sanitizedBaseName = rawBaseName
        .replace(/[^a-zA-Z0-9-_]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '') || 'file';
        
      const fullSanitizedName = `${sanitizedBaseName}${fileExt.toLowerCase()}`;

      const existsInAssets = assets.some(asset => {
        const assetExtIndex = asset.filename.lastIndexOf('.');
        const assetExt = assetExtIndex !== -1 ? asset.filename.substring(assetExtIndex) : '';
        return getDisplayName(asset.filename) === sanitizedBaseName && assetExt.toLowerCase() === fileExt.toLowerCase();
      });

      if (existsInAssets || uploadedInBatch.has(fullSanitizedName)) {
        toast.error(`A file named "${file.name}" already exists`);
        failCount++;
        continue;
      }

      // Size validation (Max 200MB for videos, 50MB for images/PDFs)
      const maxLimit = isVid ? 200 * 1024 * 1024 : 50 * 1024 * 1024;
      if (file.size > maxLimit) {
        const limitStr = isVid ? '200MB' : '50MB';
        toast.error(`${file.name} exceeds the maximum size limit of ${limitStr}`);
        failCount++;
        continue;
      }

      setUploadProgress(`Uploading ${i + 1}/${files.length}: ${file.name}`);
      setCurrentFileProgress(0);
      
      try {
        await AssetsService.uploadAsset(file, (percent) => {
          setCurrentFileProgress(percent);
        });
        successCount++;
        uploadedInBatch.add(fullSanitizedName);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} file(s)`);
      loadAssets(true); // silently reload list
    }
    if (failCount > 0) {
      toast.error(`Failed to upload ${failCount} file(s)`);
    }

    setUploading(false);
    setUploadProgress('');
    setCurrentFileProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag-and-drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Filtered Assets list
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.filename.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    if (activeTab === 'all') return true;
    if (activeTab === 'video') return isVideo(asset.filename);
    if (activeTab === 'gif') return isGif(asset.filename);
    if (activeTab === 'pdf') return isPdf(asset.filename);
    if (activeTab === 'image') return isImage(asset.filename);
    
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="admin-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Universal <span className="text-primary">Assets</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload, browse, and copy public URLs for general UI illustrations, icons, and banners
          </p>
        </div>
        <button 
          onClick={triggerFileInput}
          disabled={uploading}
          className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
        >
          <Plus size={20} />
          <span>Upload File</span>
        </button>
        <input 
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept="image/*,application/pdf,video/*"
          onChange={(e) => e.target.files && handleUploadFiles(e.target.files)}
        />
      </div>

      {/* Upload Drag Area */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`glass-card rounded-[2rem] border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center min-h-[220px] ${
          dragActive 
            ? 'border-primary bg-primary/5 scale-[1.01]' 
            : 'border-border/60 hover:border-primary/40 hover:bg-primary/[0.01]'
        }`}
      >
        {uploading ? (
          <div className="w-full max-w-xl mx-auto space-y-6 py-4 animate-in fade-in zoom-in-95 duration-500">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-primary/80 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  {uploadProgress.split(':')[0] || 'Uploading'}
                </span>
                <p className="font-extrabold text-lg text-foreground truncate max-w-[280px] sm:max-w-xs md:max-w-sm mt-2" title={uploadProgress.split(': ').slice(1).join(': ')}>
                  {uploadProgress.split(': ').slice(1).join(': ') || 'Processing files...'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-1.5 self-center sm:self-auto">
                <span className="font-black text-3xl text-primary tracking-tight tabular-nums">
                  {currentFileProgress}
                </span>
                <span className="text-sm font-black text-muted-foreground/70">%</span>
              </div>
            </div>

            {/* Glowing Custom Progress Bar Track */}
            <div className="relative w-full">
              <div className="w-full bg-secondary/40 rounded-full h-3.5 border border-border/20 shadow-inner overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary via-violet-500 to-indigo-500 rounded-full h-full shadow-[0_0_15px_rgba(124,58,237,0.5)] transition-all duration-300 ease-out flex items-center justify-end relative"
                  style={{ width: `${currentFileProgress}%` }}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-white/40 blur-[1px] animate-pulse rounded-r-full" />
                </div>
              </div>
            </div>

            {/* Subtle Sub-Text / Loader indicator */}
            <div className="flex items-center justify-between text-xs text-muted-foreground/80 font-bold px-1">
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin text-primary" size={14} />
                <span>Do not close or refresh this tab</span>
              </div>
              <span>Uploading to secure server...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto shadow-inner group-hover:scale-110 transition-transform">
              <UploadCloud size={32} />
            </div>
            <div>
              <p className="font-black text-xl tracking-tight">Drag & Drop your files here</p>
              <p className="text-sm text-muted-foreground mt-1 font-medium">
                Or <span className="text-primary font-bold hover:underline">browse files</span> from your computer
              </p>
            </div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground/60">
              Supports PNG, JPG, JPEG, SVG, WEBP, GIF, PDF, MP4, MOV, WEBM, AVI, MKV
            </p>
          </div>
        )}
      </div>

      {/* Main Panel */}
      <div className="glass-card rounded-[2.5rem] border-primary/5 overflow-hidden shadow-2xl p-8 space-y-6">
        
        {/* Controls: Search, Tabs, and Count */}
        <div className="flex flex-col gap-6 pb-6 border-b border-border/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Search assets by filename..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-secondary/30 hover:bg-secondary/50 focus:bg-white border border-border/40 focus:border-primary/30 rounded-2xl transition-all duration-300 font-medium outline-none text-sm placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-black bg-secondary/80 px-4 py-2 rounded-full border border-border shadow-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <FileImage size={14} className="text-primary" />
                {filteredAssets.length === assets.length 
                  ? `${assets.length} Total` 
                  : `${filteredAssets.length} of ${assets.length} Matched`}
              </span>
            </div>
          </div>
          
          {/* Tabs Filter */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {[
              { id: 'all', label: 'All Assets', icon: Grid },
              { id: 'image', label: 'Images', icon: ImageIcon },
              { id: 'video', label: 'Videos', icon: Film },
              { id: 'gif', label: 'GIFs', icon: FileImage },
              { id: 'pdf', label: 'PDFs', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              // Count for this tab (matching search query if any)
              const count = assets.filter(asset => {
                const matchesSearch = asset.filename.toLowerCase().includes(searchQuery.toLowerCase());
                if (!matchesSearch) return false;
                if (tab.id === 'all') return true;
                if (tab.id === 'video') return isVideo(asset.filename);
                if (tab.id === 'gif') return isGif(asset.filename);
                if (tab.id === 'pdf') return isPdf(asset.filename);
                if (tab.id === 'image') return isImage(asset.filename);
                return true;
              }).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 border cursor-pointer select-none ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-102'
                      : 'bg-secondary/30 hover:bg-secondary/60 text-muted-foreground border-border/60 hover:text-foreground'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-white' : 'text-primary/70'} />
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-secondary text-muted-foreground/80'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="font-bold text-muted-foreground">Loading asset library...</p>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto text-muted-foreground">
              <ImageIcon size={32} />
            </div>
            <h3 className="font-black text-xl tracking-tight">No assets found</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium">
              {searchQuery 
                ? 'Try adjusting your search query or clear the filter to see all files.'
                : 'Your universal asset library is empty. Drag and drop files above to start adding assets!'}
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-primary font-bold text-sm hover:underline"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAssets.map((asset) => {
              const isCopied = copiedFilename === asset.filename;
              return (
                <div 
                  key={asset.filename} 
                  className="bg-secondary/15 rounded-3xl overflow-hidden border border-border/40 hover:border-primary/20 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col group"
                >
                  {/* Image/File container */}
                  <div className="relative aspect-video w-full bg-secondary/30 overflow-hidden flex-shrink-0 flex items-center justify-center border-b border-border/30">
                    {isVideo(asset.filename) ? (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent flex flex-col items-center justify-center p-0 relative select-none">
                        <video 
                          src={asset.url}
                          className="w-full h-full object-cover absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity duration-355"
                          muted
                          playsInline
                          loop
                          preload="metadata"
                          onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                          onMouseLeave={(e) => e.currentTarget.pause()}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 group-hover:bg-black/5 transition-all pointer-events-none">
                          <div className="w-10 h-10 rounded-full bg-black/45 backdrop-blur-sm flex items-center justify-center text-white border border-white/20 group-hover:scale-110 transition-transform duration-300 shadow-md">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                          <span className="text-[9px] font-extrabold uppercase text-white tracking-wider bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-white/10 mt-2">
                            Video
                          </span>
                        </div>
                      </div>
                    ) : asset.filename.toLowerCase().endsWith('.pdf') || asset.url.toLowerCase().endsWith('.pdf') ? (
                      <div className="w-full h-full bg-gradient-to-br from-red-500/10 via-rose-500/5 to-transparent flex flex-col items-center justify-center p-4 relative group-hover:scale-105 transition-transform duration-700 select-none">
                        <FileText size={48} className="text-red-500 mb-2 drop-shadow-sm" />
                        <span className="text-[10px] font-extrabold uppercase text-red-500 tracking-wider bg-red-500/10 px-2.5 py-0.5 rounded-md border border-red-500/20">
                          PDF Document
                        </span>
                      </div>
                    ) : (
                      <img 
                        src={asset.url} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        loading="lazy"
                      />
                    )}
                    
                    {/* Hover Overlay Actions */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <button
                        onClick={() => setSelectedAsset(asset)}
                        className="p-3 bg-white/90 hover:bg-white rounded-xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 text-foreground flex items-center gap-1.5 font-bold text-xs"
                      >
                        <Eye size={16} />
                        <span>Preview</span>
                      </button>
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-white/90 hover:bg-white rounded-xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 text-foreground flex items-center justify-center"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>

                    {/* Format Badge */}
                    <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-[9px] font-black text-white px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {asset.filename.split('.').pop()}
                    </span>
                  </div>

                  {/* Body details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5 min-w-0">
                      <p 
                        className="font-bold text-sm text-foreground truncate cursor-help"
                        title={asset.filename}
                      >
                        {getDisplayName(asset.filename)}
                      </p>
                      
                      <div className="flex flex-col gap-1 text-[11px] text-muted-foreground font-semibold">
                        <div className="flex items-center gap-1.5">
                          <HardDrive size={12} className="text-muted-foreground/75" />
                          <span>{formatBytes(asset.size)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-muted-foreground/75" />
                          <span>{formatDate(asset.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions footer */}
                    <div className="grid grid-cols-5 gap-2 pt-2">
                      <button
                        onClick={() => handleCopyUrl(asset.url, asset.filename)}
                        className={`col-span-4 py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border shadow-sm ${
                          isCopied 
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/10' 
                            : 'bg-white hover:bg-primary/5 hover:text-primary text-foreground border-border/60'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check size={14} className="animate-in zoom-in duration-300" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>Copy URL</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteAsset(asset.filename)}
                        className="col-span-1 py-2.5 rounded-xl bg-white hover:bg-rose-50 hover:text-rose-600 text-muted-foreground border border-border/60 hover:border-rose-200 shadow-sm flex items-center justify-center transition-all"
                        title="Delete Asset"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox / Preview Modal */}
      {selectedAsset && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300"
          onClick={() => setSelectedAsset(null)}
        >
          <div 
            className="relative bg-white dark:bg-zinc-900 rounded-[2rem] overflow-hidden max-w-4xl w-full shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Huge Image / Video / PDF Iframe */}
            <div className="bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center p-6 md:p-10 aspect-video md:aspect-auto md:w-3/5 min-h-[350px] md:min-h-[500px]">
              {isVideo(selectedAsset.filename) ? (
                <video 
                  src={selectedAsset.url} 
                  controls
                  autoPlay
                  className="w-full max-h-[70vh] rounded-2xl border border-black/10 shadow-lg"
                />
              ) : selectedAsset.filename.toLowerCase().endsWith('.pdf') || selectedAsset.url.toLowerCase().endsWith('.pdf') ? (
                <iframe 
                  src={selectedAsset.url} 
                  className="w-full h-full min-h-[350px] md:min-h-[500px] rounded-2xl border border-black/10 shadow-lg"
                  title={selectedAsset.filename}
                />
              ) : (
                <img 
                  src={selectedAsset.url} 
                  alt="" 
                  className="max-h-[70vh] object-contain rounded-2xl shadow-lg border border-black/5"
                />
              )}
            </div>

            {/* Right: Technical specs and quick actions */}
            <div className="p-8 md:w-2/5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-border/50">
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <h3 className="font-black text-2xl tracking-tight leading-tight truncate pr-4 text-foreground">
                    Asset Details
                  </h3>
                  <button 
                    onClick={() => setSelectedAsset(null)}
                    className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70 block">Filename</span>
                    <p className="text-sm font-bold break-all text-foreground bg-secondary/35 px-4 py-2.5 rounded-xl border border-border/30 leading-relaxed select-all">
                      {selectedAsset.filename}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70 block">File Size</span>
                      <p className="text-sm font-black text-foreground mt-1 flex items-center gap-1.5">
                        <HardDrive size={14} className="text-primary" />
                        {formatBytes(selectedAsset.size)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70 block">Uploaded On</span>
                      <p className="text-sm font-black text-foreground mt-1 flex items-center gap-1.5">
                        <Calendar size={14} className="text-primary" />
                        {formatDate(selectedAsset.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70 block">Public URL</span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={selectedAsset.url}
                        className="flex-1 bg-secondary/35 border border-border/30 rounded-xl px-4 py-2.5 text-xs text-muted-foreground font-semibold select-all focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopyUrl(selectedAsset.url, selectedAsset.filename)}
                        className="p-3 bg-primary text-white rounded-xl hover:scale-105 transition-transform shadow-md shadow-primary/20 flex items-center justify-center"
                        title="Copy URL"
                      >
                        {copiedFilename === selectedAsset.filename ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border/30 flex gap-3">
                <a
                  href={selectedAsset.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 btn-primary py-3 rounded-xl font-bold text-xs shadow-md shadow-primary/10 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-transform"
                >
                  <ExternalLink size={14} />
                  <span>Open URL</span>
                </a>
                <button
                  onClick={() => handleDeleteAsset(selectedAsset.filename)}
                  className="px-4 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 text-rose-600 border border-rose-100 hover:border-rose-200 rounded-xl transition-all flex items-center justify-center"
                  title="Delete Asset"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
