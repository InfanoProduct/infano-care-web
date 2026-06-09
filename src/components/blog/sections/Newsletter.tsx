'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setStatus('idle');
    setMessage('');
    
    try {
      await apiClient.post('/enquiry/subscribe', {
        email: email,
      });
      setStatus('success');
      setMessage('Successfully subscribed! Check your email for a welcome message.');
      setEmail('');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="text-center py-24 space-y-8 bg-gray-50 rounded-[4rem]">
      <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto">
        <Sparkles size={40} />
      </div>
      <div className="space-y-4">
        <h2 className="text-4xl font-black tracking-tight">Stay Informed & Inspired</h2>
        <p className="text-muted-foreground font-medium text-lg max-w-xl mx-auto">
          Subscribe to our weekly editorial digest for curated health insights and parenting guides.
        </p>
      </div>
      <form className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto px-6" onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === 'error') setStatus('idle');
          }}
          placeholder="Enter your email"
          required
          className="flex-grow bg-white border border-gray-200 rounded-2xl py-5 px-8 font-bold text-lg focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-xl"
        />
        <button 
          type="submit"
          disabled={isSubmitting}
          className="btn-primary py-5 px-12 rounded-2xl font-black shadow-2xl shadow-primary/20 whitespace-nowrap text-lg flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Subscribing...
            </>
          ) : (
            'Sign Me Up'
          )}
        </button>
      </form>
      
      {status === 'success' && (
        <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-100 text-green-700 font-bold text-sm">
          <Sparkles size={16} />
          {message}
        </div>
      )}
      {status === 'error' && (
        <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-100 text-red-700 font-bold text-sm">
          {message}
        </div>
      )}
    </section>
  );
}
