import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { getImageUrl, getCategoryColor } from '@/lib/utils';
import { ShopService, Book } from '@/services/shop.service';

export function PromoBanner() {
  const [book, setBook] = useState<Book | null>(null);

  useEffect(() => {
    async function loadBook() {
      try {
        const books = await ShopService.getBooks();
        if (books && books.length > 0) {
          const targetBook = books.find(b => b.id === '7e248707-c9e8-462c-a716-99f3852ef8c0') || books[0];
          setBook(targetBook);
        } else {
          setBook({
            id: '7e248707-c9e8-462c-a716-99f3852ef8c0',
            title: 'The Awkward Age',
            description: 'A story of Every Adolescent Girl',
            price: 499,
            stock: 100,
            isActive: true
          });
        }
      } catch (err) {
        console.error('Failed to load book in PromoBanner:', err);
        setBook({
          id: '7e248707-c9e8-462c-a716-99f3852ef8c0',
          title: 'The Awkward Age',
          description: 'A story of Every Adolescent Girl',
          price: 499,
          stock: 100,
          isActive: true
        });
      }
    }
    loadBook();
  }, []);

  return (
    <div className="group relative overflow-hidden rounded-xl aspect-square shadow-2xl">
      <Image
        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe"
        alt="Promotion"
        fill
        className="object-cover group-hover:scale-110 transition-transform duration-700 sharp-image"
        sizes="(max-width: 1024px) 100vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute inset-0 p-8 flex flex-col justify-end items-center text-center space-y-4">
        <Link 
          href={book ? `/checkout?bookId=${book.id}` : '/checkout'}
          className="px-10 py-4 bg-primary text-white text-[12px] font-black uppercase tracking-widest rounded-lg hover:bg-white hover:text-primary transition-all text-center inline-block"
        >
          Purchase Now
        </Link>
      </div>

    </div>
  );
}


export function CategoryWidget({ categories }: { categories: any[] }) {
  const displayCategories = [...categories]
    .sort((a: any, b: any) => (b._count?.posts || 0) - (a._count?.posts || 0))
    .slice(0, 4);

  if (categories.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4">
      {displayCategories.map((cat) => (
        <CategoryCard key={cat.id} cat={cat} />
      ))}
    </div>
  );
}

function CategoryCard({ cat }: { cat: any }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);
  
  // Dynamic images based on category name
  const categoryImages: Record<string, string[]> = {
    'Technology': [
      'https://images.unsplash.com/photo-1518770660439-4636190af475',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa'
    ],
    'Lifestyle': [
      'https://images.unsplash.com/photo-1511185307590-3c29c112aef2',
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f'
    ],
    'Travel': [
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
      'https://images.unsplash.com/photo-1488085061387-422e29b40080',
      'https://images.unsplash.com/photo-1503220317375-aaad61436b1b'
    ],
    'Health': [
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
      'https://images.unsplash.com/photo-1511688858344-1854ef99c756',
      'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7'
    ]
  };

  // Fallback images if category not in list
  const fallbackImages = [
    'https://images.unsplash.com/photo-1432821596592-e2c18b78144f',
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
    'https://images.unsplash.com/photo-1526285759904-71d1170ed2ac'
  ];

  const images = categoryImages[cat.name] || [
    'https://images.unsplash.com/photo-1493612276216-ee3925520721', // Diversity
    'https://images.unsplash.com/photo-1516321497487-e288fb19713f', // Abstract
    'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc'  // Texture
  ];

  // Image Slideshow Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000 + Math.random() * 2000); 
    return () => clearInterval(timer);
  }, [images.length]);

  // Animated Counter Effect
  useEffect(() => {
    let start = 0;
    const end = cat._count?.posts || 0;
    if (start === end) {
      setDisplayCount(end);
      return;
    }

    let totalDuration = 1500;
    let incrementTime = Math.abs(Math.floor(totalDuration / end)) || 100;

    let timer = setInterval(() => {
      start += 1;
      setDisplayCount(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [cat._count?.posts]);

  return (
    <Link 
      href={`/blog?category=${cat.id}`}
      className="group relative aspect-square rounded-xl overflow-hidden shadow-lg border border-white/10"
    >
      {/* Background Image Slideshow */}
      <div className="absolute inset-0 bg-gray-900">
        {images.map((img, idx) => (
          <Image
            key={img}
            src={img}
            alt=""
            fill
            className={`object-cover transition-opacity duration-1000 ${
              idx === currentImageIndex ? 'opacity-100 scale-110' : 'opacity-0 scale-100'
            } group-hover:scale-125 transition-transform duration-[2000ms]`}
            sizes="(max-width: 1024px) 50vw, 15vw"
          />
        ))}
      </div>

      {/* Overlay */}
      <div className={`absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-500`} />
      
      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center space-y-1 z-10">
        <span className="text-4xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
          {displayCount}+
        </span>
        <span className="blog-meta-text !text-white !font-black !text-[13px] capitalize tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {cat.name}
        </span>
      </div>
    </Link>
  );
}

export function SocialStats({ author, globalStats }: { author?: any; globalStats?: any }) {
  const platforms = [
    { 
      name: 'Instagram', 
      count: globalStats?.instagramFollowers || author?.instagramFollowers || '4.2k+', 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ), 
      color: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]',
      url: author?.instagramUrl || 'https://www.instagram.com/infano.care/'
    },
    { 
      name: 'Facebook', 
      count: globalStats?.facebookFollowers || author?.facebookFollowers || '2.1k+', 
      icon: 'f', 
      color: 'bg-[#3b5998]',
      url: author?.facebookUrl || 'https://www.facebook.com/infano.wecare'
    },
    { 
      name: 'LinkedIn', 
      count: globalStats?.linkedInFollowers || author?.linkedInFollowers || '1.5k+', 
      icon: 'in', 
      color: 'bg-[#0077b5]',
      url: author?.linkedInUrl || 'https://www.linkedin.com/company/infanocare/'
    },
    { 
      name: 'YouTube', 
      count: globalStats?.youtubeSubscribers || '1.2k+', 
      icon: 'y', 
      color: 'bg-[#ff0000]',
      url: 'https://www.youtube.com/@InfanoCare'
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {platforms.map((p) => (
        <a 
          key={p.name} 
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${p.color} p-4 rounded-lg flex flex-col items-center justify-center text-white space-y-1 shadow-md hover:scale-105 transition-transform cursor-pointer`}
        >
          <span className="text-xs font-black">{p.icon}</span>
          <span className="text-sm font-black">{p.count}</span>
          <span className="text-[8px] font-black uppercase tracking-widest opacity-60">{p.name}</span>
        </a>
      ))}
    </div>
  );
}

export function PostTabsWidget({ posts }: { posts: any[] }) {
  const [activeTab, setActiveTab] = useState<'recent' | 'popular'>('recent');
  
  const recentPosts = posts.slice(0, 4);
  const popularPosts = [...posts].sort(() => 0.5 - Math.random()).slice(0, 4);

  const displayPosts = activeTab === 'recent' ? recentPosts : popularPosts;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden">
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('recent')}
          className={`flex-1 py-4 font-black capitalize text-[13px] tracking-wide transition-all ${
            activeTab === 'recent' 
              ? 'border-b-2 border-primary text-[var(--blog-text-main)] bg-gray-50/50' 
              : 'text-[var(--blog-text-muted)] hover:text-[var(--blog-text-main)] hover:bg-gray-50'
          }`}
        >
          Recent
        </button>
        <button
          onClick={() => setActiveTab('popular')}
          className={`flex-1 py-4 font-black capitalize text-[13px] tracking-wide transition-all ${
            activeTab === 'popular' 
              ? 'border-b-2 border-primary text-[var(--blog-text-main)] bg-gray-50/50' 
              : 'text-[var(--blog-text-muted)] hover:text-[var(--blog-text-main)] hover:bg-gray-50'
          }`}
        >
          Popular
        </button>
      </div>

      <div className="p-6 space-y-6">
        {displayPosts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group flex gap-4 items-center">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden shadow-md shrink-0 border border-gray-50">
              <Image
                src={getImageUrl(post.thumbnailUrl)}
                alt=""
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 sharp-image"
                sizes="80px"
              />
            </div>
            <div className="space-y-1">
              <span className={`blog-category-tag !px-2 !py-0.5 !text-[8px] ${getCategoryColor(post.categories?.[0]?.name)}`}>
                {post.categories?.[0]?.name || 'Story'}
              </span>
              <h4 className="blog-post-title blog-sidebar-title transition-all line-clamp-2">
                {post.title}
              </h4>
              <p className="blog-meta-text !text-[11px] !leading-none">
                By {post.author?.name || 'Staff'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
