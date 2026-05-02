'use client';

import { useState, useEffect, use } from 'react';
import PostForm from '../../components/PostForm';
import { blogService } from '@/services/blog.service';
import { Loader2 } from 'lucide-react';

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    try {
      const data = await blogService.getPostById(id);
      setPost(data);
    } catch (error) {
      console.error('Failed to load post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-bold text-muted-foreground animate-pulse">Loading post data...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4">
          <Loader2 size={40} className="rotate-45" />
        </div>
        <h2 className="text-2xl font-bold">Post Not Found</h2>
        <p className="text-muted-foreground">The post you're trying to edit doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <PostForm initialData={post} isEditing />
    </div>
  );
}
