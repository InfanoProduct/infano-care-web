'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { blogService } from '@/services/blog.service';
import dynamic from 'next/dynamic';
const BlogForm = dynamic(() => import('../../../components/BlogForm'), { ssr: false });

export default function EditPostPage() {
  const params = useParams();
  const id = params.id as string;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadPost();
    }
  }, [id]);

  const loadPost = async () => {
    setLoading(true);
    try {
      const data = await blogService.getPostById(id);
      setPost(data);
    } catch (err: any) {
      console.error('Failed to load post:', err);
      setError(err.message || 'Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-bold text-muted-foreground">Retrieving article data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center">
          <Loader2 size={32} />
        </div>
        <p className="font-bold text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-primary font-bold hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <BlogForm initialData={post} isEditing />
    </div>
  );
}
