import { Sparkles } from 'lucide-react';

export function Newsletter() {
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
      <form className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto px-6" onSubmit={e => e.preventDefault()}>
        <input
          type="email"
          placeholder="Enter your email"
          className="flex-grow bg-white border border-gray-200 rounded-2xl py-5 px-8 font-bold text-lg focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-xl"
        />
        <button className="btn-primary py-5 px-12 rounded-2xl font-black shadow-2xl shadow-primary/20 whitespace-nowrap text-lg">
          Sign Me Up
        </button>
      </form>
    </section>
  );
}
