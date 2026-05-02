'use client';

import dynamic from 'next/dynamic';

const BlogForm = dynamic(() => import('../../components/BlogForm'), { ssr: false });

export default function NewPostPage() {
  return (
    <div className="pb-20">
      <BlogForm />
    </div>
  );
}
