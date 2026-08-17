/* eslint-disable */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen, Video, PlayCircle, Clock, Search, Heart, Sparkles, Play,
  CheckCircle2, ArrowRight, Award, Star, MessageSquare, Mail, Layers, ChevronRight, ChevronLeft
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { toast } from "react-hot-toast";

// ─── Testimonials Data ────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "Infano's adolescent wellness courses helped my daughter navigate the changes of puberty with confidence. The expert-led guidance took the awkwardness out of our home conversations.",
    authorName: "Ananya Sharma",
    role: "Mother of 13-year-old, Mumbai",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=80"
  },
  {
    quote: "The teen health course was super helpful! The short video lessons on hormone changes and cycle regularity were easy to understand, and I loved the quizzes at the end.",
    authorName: "Riya K.",
    role: "Grade 9 Student, Bangalore",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80"
  },
  {
    quote: "Integrating Infano's learning modules into our school's wellness curriculum has seen immense appreciation from parents. It bridges a crucial gap in adolescent health education.",
    authorName: "Dr. Sandeep Mehta",
    role: "School Principal, New Delhi",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80"
  },
  {
    quote: "As a gynecologist, I highly recommend Infano. The courses translate complex hormonal changes and PCOS management into engaging, easy-to-understand life lessons.",
    authorName: "Dr. Priya Nair",
    role: "Child & Adolescent Specialist, Kochi",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&q=80"
  },
  {
    quote: "Gigi has become my daughter's go-to guide. The self-paced modules helped her understand menstrual hygiene without any shame or hesitation. It's beautiful.",
    authorName: "Meera Deshmukh",
    role: "Mother of 15-year-old, Pune",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&q=80"
  },
  {
    quote: "The period nutrition course was amazing! Learning about how different foods help with cramps and energy levels has completely changed how I manage my weekly cycles.",
    authorName: "Sneha Patel",
    role: "Grade 11 Student, Ahmedabad",
    avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=120&q=80"
  }
];

// ─── Blog Section (backend-fetched) ──────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005/api';

function BlogSection({ router }: { router: ReturnType<typeof useRouter> }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/blog/posts?page=1&limit=3`);
        const data = await res.json();
        // API returns { items: [...], total, ... }
        const items = data?.items ?? data?.posts ?? (Array.isArray(data) ? data : []);
        setPosts(items.slice(0, 3));
      } catch {
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <section className="pt-8 pb-8 lg:pt-10 lg:pb-20 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 xl:px-24">
        {/* Header — site-wide style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50/80 backdrop-blur-sm border border-slate-100 rounded-full mb-4">
              <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Wellness Resources</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-heading tracking-tight text-slate-900">
              Blog Post Articles
            </h2>
          </div>
          <button
            onClick={() => router.push("/blog")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors group shrink-0"
          >
            All Articles
            <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading
            ? /* Skeleton loaders */
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-[20px] border border-slate-100 overflow-hidden animate-pulse">
                <div className="h-52 bg-slate-100" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-slate-100 rounded-full w-1/3" />
                  <div className="h-4 bg-slate-100 rounded-full w-full" />
                  <div className="h-4 bg-slate-100 rounded-full w-2/3" />
                  <div className="h-3 bg-slate-100 rounded-full w-1/4 mt-4" />
                </div>
              </div>
            ))
            : posts.length === 0
              ? /* Empty state */
              <div className="col-span-3 text-center py-16 text-slate-400">
                <p className="text-base font-medium">No blog posts available yet.</p>
              </div>
              : /* Real posts */
              posts.map((post: any, idx: number) => {
                const category = post.categories?.[0]?.name ?? post.tags?.[0] ?? "Wellness";
                const slug = post.slug ?? post.id;
                const image = post.thumbnailUrl;
                return (
                  <motion.div
                    key={post.id ?? idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    onClick={() => router.push(`/blog/${slug}`)}
                    className="bg-white rounded-[20px] border border-slate-100 shadow-[0_2px_16px_rgba(0,0,0,0.04)] overflow-hidden group flex flex-col cursor-pointer hover:shadow-[0_8px_32px_rgba(74,30,127,0.08)] transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden bg-slate-100 shrink-0">
                      {image ? (
                        <img
                          src={image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#F4E8FF] to-[#FDF2F8] flex items-center justify-center">
                          <svg className="w-12 h-12 text-primary/20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                          </svg>
                        </div>
                      )}
                      {/* Category pill */}
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
                        <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wide">{category}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <h3 className="font-bold text-[14px] text-slate-900 leading-snug line-clamp-2 group-hover:text-primary transition-colors font-heading">
                        {post.title}
                      </h3>
                      {post.summary && (
                        <p className="text-[12px] text-slate-500 leading-relaxed mt-2 line-clamp-2">{post.summary}</p>
                      )}
                      <div className="mt-4 text-[11px] font-bold text-primary hover:text-primary-light flex items-center gap-1 self-start">
                        Read Article <ArrowRight size={11} />
                      </div>
                    </div>
                  </motion.div>
                );
              })
          }
        </div>
      </div>
    </section>
  );
}

export default function CourseLandingPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/lms/explore");
      if (res) {
        setCourses(res as any[]);
      }
    } catch (e) {
      toast.error("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const tags = ["All", "Teen Health", "Parenting", "Nutrition", "Wellness"];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === "All" || course.category === selectedTag;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans overflow-x-hidden">

      {/* ─── HERO SECTION ──────────────────────────────────────────────────────── */}
      <section className="relative pt-6 pb-8 lg:pt-12 lg:pb-20 overflow-hidden bg-white">
        {/* Subtle dot grid background — matching home */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #4a1e7f 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        {/* Floating sparkle icons */}
        <div className="absolute top-[22%] right-[6%] text-primary/25 animate-pulse pointer-events-none z-0">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 3c.13 4.29 2.29 6.45 6.58 6.58-4.29.13-6.45 2.29-6.58 6.58-.13-4.29-2.29-6.45-6.58-6.58 4.29-.13 6.45-2.29 6.58-6.58Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="absolute bottom-[24%] left-[4%] text-primary/15 animate-pulse pointer-events-none z-0" style={{ animationDelay: '2s' }}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 3c.13 4.29 2.29 6.45 6.58 6.58-4.29.13-6.45 2.29-6.58 6.58-.13-4.29-2.29-6.45-6.58-6.58 4.29-.13 6.45-2.29 6.58-6.58Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 md:px-12 xl:px-24 relative z-20">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

            {/* Left Text Column */}
            <div className="flex-1 space-y-6 text-left z-10 max-w-xl lg:max-w-none">

              {/* Badge — matches site-wide style */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50/80 backdrop-blur-sm border border-slate-100 rounded-full animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
                <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Expert-Guided E-Learning</span>
              </div>

              {/* Heading — site-wide standard */}
              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6 leading-tight tracking-tight text-slate-900 animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both" style={{ animationDelay: '100ms' }}>
                Empower Her Journey With{" "}
                <span className="font-caveat text-primary relative inline-block px-1 text-5xl md:text-6xl font-bold tracking-wide rotate-[-1.5deg]">
                  Expert
                  {/* Double wavy underline */}
                  <svg className="absolute left-0 bottom-[-4px] w-full h-3 text-primary/75" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0,5 Q25,1 50,5 T100,4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M0,8 Q25,4 50,8 T100,7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>{" "}
                <span className="text-primary">Knowledge</span>
              </h1>

              {/* Subheading — site-wide standard */}
              <p className="text-base md:text-md text-slate-500 leading-relaxed font-medium max-w-lg animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both" style={{ animationDelay: '200ms' }}>
                Specially curated courses in adolescent wellness, puberty transition, and parent-daughter communication to build resilience, health, and lifelong confidence.{" "}
                <span className="inline-block text-pink-400 translate-y-[2px]">
                  <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </span>
              </p>

              {/* Feature pillars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-5 sm:gap-y-0 py-5 border-t border-b border-slate-100 mt-2">
                {[
                  {
                    icon: (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-4.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2z" />
                        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-4.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2z" />
                      </svg>
                    ), bg: "bg-pink-50 text-pink-500", title: "Build", subtitle: "Mental Strength", border: true
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22C12 22 20 18 20 12C20 8 16.5 6.5 16.5 6.5C16.5 6.5 15 9 12 9C9 9 7.5 6.5 7.5 6.5C7.5 6.5 4 8 4 12C4 18 12 22 12 22Z" />
                        <path d="M12 22V9" />
                      </svg>
                    ), bg: "bg-[#FAF5FF] text-primary", title: "Develop", subtitle: "Healthy Habits", border: true
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    ), bg: "bg-pink-50 text-pink-500", title: "Stronger", subtitle: "Parent Bond", border: true
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ), bg: "bg-[#FAF5FF] text-primary", title: "Gain Lifelong", subtitle: "Confidence", border: false
                  }
                ].map((feat, idx) => (
                  <div key={idx} className={`flex flex-col items-center text-center px-4 ${feat.border ? "sm:border-r border-slate-200" : ""}`}>
                    <div className={`w-10 h-10 rounded-full ${feat.bg} flex items-center justify-center mb-2`}>
                      {feat.icon}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700 leading-snug">{feat.title}</span>
                    <span className="text-[11px] font-semibold text-slate-500 leading-snug">{feat.subtitle}</span>
                  </div>
                ))}
              </div>

              {/* Popular tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Popular:</span>
                {tags.slice(1).map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${selectedTag === tag
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "bg-white border-slate-200 text-slate-500 hover:border-primary/30 hover:text-primary"
                      }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* CTAs — matches home page style */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2 animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both" style={{ animationDelay: '300ms' }}>
                <button
                  onClick={() => {
                    const el = document.getElementById("courses-list");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="btn-primary text-sm px-8 py-3.5 group shadow-lg shadow-primary/20 inline-flex items-center gap-2"
                >
                  Start Learning Today
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={() => toast.success("Feature video coming soon!")}
                  className="inline-flex items-center gap-2.5 text-slate-600 hover:text-primary font-medium text-sm transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center shrink-0 transition-colors">
                    <Play size={12} className="fill-primary text-primary translate-x-[1px]" />
                  </div>
                  Watch How It Works
                </button>
              </div>
            </div>

            {/* Right Graphics/Image Column — pushed right with ml-auto */}
            <div className="flex-shrink-0 w-full lg:w-auto lg:ml-auto flex justify-center lg:justify-end items-center animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both" style={{ animationDelay: '150ms' }}>

              <div className="relative w-[285px] h-[285px] sm:w-[360px] sm:h-[360px] md:w-[420px] md:h-[420px] flex items-center justify-center">
                {/* Organic purple background blob */}
                <div className="absolute top-[8%] right-[8%] w-[85%] h-[85%] bg-gradient-to-tr from-[#F4E8FF] via-[#FDF2F8] to-[#FFF0EB] rounded-[60%_40%_50%_40%_/_50%_40%_60%_50%] -z-10 animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />

                {/* Wavy dashed line loop decoration */}
                <svg className="absolute top-[-5%] left-[-5%] w-[110%] h-[110%] text-primary/20 pointer-events-none z-0" viewBox="0 0 100 100" fill="none">
                  <path d="M12,82 C-5,50 15,22 46,18 C68,15 82,32 62,8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,3" strokeLinecap="round" />
                </svg>

                {/* Floating Paper Airplane & Dashed Trail */}
                <div className="absolute top-[-24px] left-[54%] z-20 transform rotate-[10deg] animate-bounce" style={{ animationDuration: '6s' }}>
                  <svg className="w-8 h-8 text-primary/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </div>

                {/* Outline stars (sparkles) absolute decoration */}
                <div className="absolute left-[-4%] top-[45%] text-primary/65 animate-pulse z-20">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 3c.13 4.29 2.29 6.45 6.58 6.58-4.29.13-6.45 2.29-6.58 6.58-.13-4.29-2.29-6.45-6.58-6.58 4.29-.13 6.45-2.29 6.58-6.58Z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                <div className="absolute right-[-4%] top-[38%] text-primary/65 animate-pulse z-20" style={{ animationDelay: '1.5s' }}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 3c.13 4.29 2.29 6.45 6.58 6.58-4.29.13-6.45 2.29-6.58 6.58-.13-4.29-2.29-6.45-6.58-6.58 4.29-.13 6.45-2.29 6.58-6.58Z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Dot grid decoration */}
                <div className="absolute bottom-[8%] right-[2%] text-primary/20 grid grid-cols-5 gap-2.5 pointer-events-none z-0">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-current" />
                  ))}
                </div>

                {/* Main portrait with hand-drawn organic squircle border style */}
                <div className="absolute top-[8%] left-[10%] w-[78%] h-[78%] rounded-[48px_36px_64px_44px] overflow-hidden shadow-[0_12px_45px_rgba(74,30,127,0.08)] border-[6px] border-white z-10 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img
                    src="/course_hero_girls.png"
                    alt="Students learning"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Overlapping Badge 1: Expert Verified */}
                <div className="absolute bottom-[2%] left-0 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-[0_8px_30px_rgba(74,30,127,0.06)] border border-purple-100/50 flex items-center gap-3 z-20 hover:scale-103 transition-transform">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Award size={14} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[11px] text-slate-800">Expert Verified</h4>
                    <p className="text-[9px] font-bold text-slate-450 mt-0.5">Medical-led framework</p>
                  </div>
                </div>

                {/* Overlapping Badge 2: 4.8 Rating */}
                <div className="absolute top-[4%] right-0 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-[0_8px_30px_rgba(74,30,127,0.06)] border border-purple-100/50 flex items-center gap-3 z-20 hover:scale-103 transition-transform">
                  <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center text-accent shrink-0">
                    <Star size={14} className="fill-accent text-accent" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[11px] text-slate-800">4.8 Rating</h4>
                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">Highly recommended by moms</p>
                  </div>

                  {/* Three little accent lines above rating card */}
                  <div className="absolute top-[-26px] right-[-14px] text-primary/45 pointer-events-none select-none z-20">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="6" y1="18" x2="10" y2="6" />
                      <line x1="12" y1="18" x2="16" y2="6" />
                      <line x1="18" y1="18" x2="22" y2="6" />
                    </svg>
                  </div>
                </div>

                {/* Overlapping Sticky Note: Bottom-Right */}
                <div className="absolute bottom-[-24px] right-[2%] bg-[#FFF4EC] border border-[#FFD8C0] rounded-3xl p-5 shadow-[0_12px_32px_rgba(251,146,60,0.14)] transform rotate-[6deg] w-[140px] sm:w-[155px] text-center z-20 font-caveat select-none">
                  <p className="text-[17px] sm:text-[19px] font-black text-primary leading-tight">
                    Because<br />
                    Every Girl<br />
                    Deserves to<br />
                    Thrive ♡
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── OUR COURSES SECTION ────────────────────────────────────────────────── */}
      <section id="courses-list" className="pt-8 pb-8 lg:pt-10 lg:pb-20 bg-[#FFFCFA] relative">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full mb-4">
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Self-Paced Courses</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold font-heading tracking-tight text-slate-900">Our <span className="text-primary">Wellness</span> Courses</h2>
            </div>
            {/* Tag switch bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all ${selectedTag === tag
                    ? "bg-primary text-white shadow-md shadow-primary/10"
                    : "bg-white border border-slate-200 text-slate-500 hover:text-slate-700"
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Course Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-96 bg-white rounded-3xl p-3 border border-slate-100 shadow-sm animate-pulse flex flex-col">
                  <div className="h-48 bg-slate-100 rounded-2xl w-full"></div>
                  <div className="p-4 flex-1 space-y-3">
                    <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                    <div className="h-6 bg-slate-100 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[32px] border border-slate-100 shadow-xs max-w-xl mx-auto">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-700">No courses found</h3>
              <p className="text-slate-400 text-xs mt-1 font-semibold">Try switching tags or adjusting search text.</p>
              <button onClick={() => { setSearchQuery(""); setSelectedTag("All"); }} className="mt-5 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold transition-colors">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course, idx) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  onClick={() => router.push(`/course/${course.id}`)}
                  className="bg-white rounded-[28px] p-3 border border-slate-100 shadow-[0_4px_24px_rgba(74,30,127,0.02)] hover:shadow-[0_8px_32px_rgba(74,30,127,0.06)] transition-all duration-300 group flex flex-col h-full cursor-pointer overflow-hidden relative"
                >
                  {/* Thumbnail */}
                  <div className="relative h-[200px] rounded-2xl overflow-hidden bg-slate-100 mb-4">
                    <img
                      src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                    />
                    {/* Category Overlay */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-full shadow-xs">
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                        {course.category || "General"}
                      </span>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="px-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="font-bold text-[16px] text-slate-800 leading-snug line-clamp-2 group-hover:text-primary transition-colors font-heading">
                        {course.title}
                      </h3>
                      <p className="text-slate-400 text-xs font-medium line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    {/* Metadata footer */}
                    <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {course.timeDuration || 120} mins
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${course.isFree ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-700'}`}>
                          {course.isFree ? "Free" : `₹${course.price}`}
                        </span>
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── SUITABILITY SECTION ───────────────────────────────────────────────── */}
      <section className="pt-8 pb-8 lg:pt-10 lg:pb-20 bg-white relative">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full mb-4">
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Who It's For</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-heading tracking-tight text-slate-900">Our Courses are <span className="text-primary">Suitable</span> for...</h2>
          </motion.div>

          {/* Video Placeholder Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-3xl mx-auto mb-16 rounded-[28px] overflow-hidden shadow-xl border border-slate-100 relative group aspect-video"
          >
            <img
              src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1000&q=80"
              alt="Class learning"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
            />
            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <button className="w-16 h-16 rounded-full bg-white text-primary flex items-center justify-center shadow-lg hover:scale-105 transition-transform animate-pulse">
                <Play className="w-6 h-6 ml-1.5 fill-primary" />
              </button>
            </div>
          </motion.div>

          {/* 4 Pillars suitable list — colorful themed cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {([
              {
                icon: "🌱",
                title: "Pre-teen Girls",
                desc: "Navigate puberty transitions, hormonal changes, and mental wellness without any confusion or anxiety.",
                bg: "bg-[#FDF4FF]", border: "border-purple-100", iconBg: "bg-purple-50", iconText: "text-purple-600", numText: "text-purple-200"
              },
              {
                icon: "🧠",
                title: "Teenagers",
                desc: "Explore intermediate tracks about PCOS, hygiene, period nutrition, and building solid self-esteem.",
                bg: "bg-[#F0FDF4]", border: "border-emerald-100", iconBg: "bg-emerald-50", iconText: "text-emerald-600", numText: "text-emerald-200"
              },
              {
                icon: "👨‍👩‍👧",
                title: "Supportive Parents",
                desc: "Learn to host healthy parent-daughter conversations, understand teen emotions, and link accounts seamlessly.",
                bg: "bg-[#FFFBEB]", border: "border-amber-100", iconBg: "bg-amber-50", iconText: "text-amber-600", numText: "text-amber-200"
              },
              {
                icon: "🏫",
                title: "Schools & Educators",
                desc: "Incorporate expert-led life skill frameworks directly into the classroom wellness curriculum.",
                bg: "bg-[#F0F9FF]", border: "border-sky-100", iconBg: "bg-sky-50", iconText: "text-sky-600", numText: "text-sky-200"
              }
            ] as const).map((p, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className={`${p.bg} ${p.border} border rounded-[28px] p-7 relative overflow-hidden group hover:shadow-xl transition-all duration-500 flex flex-col min-h-[220px]`}
              >
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-2xl ${p.iconBg} flex items-center justify-center text-2xl mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    {p.icon}
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2 font-heading leading-tight">{p.title}</h3>
                  <p className={`${p.iconText} text-sm font-medium leading-relaxed opacity-90`}>{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROCESS METHODOLOGY SECTION ────────────────────────────────────────── */}
      <section className="pt-8 pb-8 lg:pt-10 lg:pb-20 bg-white border-t border-slate-100">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* LEFT — Text Block */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Our Methodology</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold font-heading tracking-tight text-slate-900 mb-6 leading-tight">
                Expert Skills That Help You{" "}
                <span className="text-primary">Learn Seamlessly</span>
              </h2>
              <p className="text-base text-slate-500 font-medium leading-relaxed mb-8">
                We don&apos;t just teach — we build real understanding. Our four-step method ensures every learner walks away with knowledge, skills, and confidence that last.
              </p>
              {[
                "Bite-sized video modules — learn at your own pace",
                "Interactive quizzes & downloadable summary sheets",
                "Expert Q&A boards & certified mentor support",
                "Achievement badges & milestone progress trackers",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 mb-4">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <span className="text-slate-700 text-sm font-medium leading-relaxed">{item}</span>
                </div>
              ))}
            </motion.div>

            {/* RIGHT — 2×2 Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                {
                  step: "Step 01",
                  title: "Theoretical Knowledge",
                  desc: "Understand core concepts through bite-sized, medical-verified high quality video modules.",
                  bg: "bg-[#F5F3FF]", border: "border-purple-100", accentBar: "bg-purple-500", stepColor: "text-purple-500",
                  icon: (
                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  )
                },
                {
                  step: "Step 02",
                  title: "Practical Skill Practice",
                  desc: "Reinforce what you learn with interactive test quizzes and downloadable summary sheets.",
                  bg: "bg-[#FFF1F2]", border: "border-rose-100", accentBar: "bg-rose-400", stepColor: "text-rose-500",
                  icon: (
                    <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )
                },
                {
                  step: "Step 03",
                  title: "Expert & Mentor Support",
                  desc: "Get your queries solved via designated expert discussion tabs and certified Q&A boards.",
                  bg: "bg-[#ECFDF5]", border: "border-emerald-100", accentBar: "bg-emerald-500", stepColor: "text-emerald-600",
                  icon: (
                    <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  )
                },
                {
                  step: "Step 04",
                  title: "Final Milestones",
                  desc: "Complete the quiz checklist to unlock achievement badges and dynamic progress trackers.",
                  bg: "bg-[#FFFBEB]", border: "border-amber-100", accentBar: "bg-amber-400", stepColor: "text-amber-600",
                  icon: (
                    <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                  )
                }
              ] as const).map((p, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className={`${p.bg} ${p.border} border rounded-[20px] p-5 flex flex-col gap-3 hover:shadow-md transition-all duration-300 group`}
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {p.icon}
                  </div>
                  {/* Left accent bar + step + title */}
                  <div className="flex items-start gap-2.5">
                    <div className={`w-[3px] min-h-[40px] ${p.accentBar} rounded-full shrink-0`} />
                    <div>
                      <span className={`text-[10px] font-bold ${p.stepColor} uppercase tracking-[0.2em] block mb-0.5`}>{p.step}</span>
                      <h3 className="font-bold text-slate-900 text-[14px] font-heading leading-snug">{p.title}</h3>
                    </div>
                  </div>
                  {/* Description */}
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </section>


      {/* ─── TESTIMONIALS SECTION ──────────────────────────────────────────────── */}
      <section className="pt-8 pb-8 lg:pt-10 lg:pb-20 bg-white relative">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-[#FAF5FF] via-white to-pink-50/20 border border-purple-100 rounded-[2.5rem] p-12 sm:p-20 relative overflow-hidden shadow-[0_8px_32px_rgba(74,30,127,0.02)] hover:shadow-[0_16px_48px_rgba(74,30,127,0.05)] transition-all duration-500 hover:-translate-y-0.5 group/card">
              {/* Background design elements */}
              <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[120%] bg-primary/5 rounded-full blur-[60px] pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-14">
                {/* Image side */}
                <div className="shrink-0 w-32 h-32 sm:w-44 sm:h-44 rounded-[2rem] overflow-hidden border-4 border-white shadow-md relative group-hover/card:scale-103 transition-transform duration-500">
                  <img
                    src={TESTIMONIALS[currentTestimonial].avatar}
                    alt={TESTIMONIALS[currentTestimonial].authorName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Review side */}
                <div className="flex-1 space-y-6 text-left">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-800 text-lg sm:text-[22px] font-bold leading-relaxed italic">
                    “{TESTIMONIALS[currentTestimonial].quote}”
                  </p>
                  <div className="pt-4 border-t border-primary/10 flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-base font-heading">{TESTIMONIALS[currentTestimonial].authorName}</h4>
                      <p className="text-xs font-bold text-slate-400 mt-0.5">{TESTIMONIALS[currentTestimonial].role}</p>
                    </div>
                    {/* Slider controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setCurrentTestimonial(prev => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                        className="w-9 h-9 rounded-full bg-white border border-primary/10 hover:bg-primary/5 text-slate-600 flex items-center justify-center transition-all shadow-xs active:scale-90"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => setCurrentTestimonial(prev => (prev + 1) % TESTIMONIALS.length)}
                        className="w-9 h-9 rounded-full bg-white border border-primary/10 hover:bg-primary/5 text-slate-600 flex items-center justify-center transition-all shadow-xs active:scale-90"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BLOG POST ARTICLES SECTION ────────────────────────────────────────── */}
      <BlogSection router={router} />


      {/* ─── NEWSLETTER SUBSCRIPTION SECTION ──────────────────────────────────────── */}
      <section className="pt-8 pb-8 lg:pt-10 lg:pb-20 bg-[#FFFCFA]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-[32px] p-10 sm:p-16 text-center text-white relative overflow-hidden shadow-lg shadow-primary/15">
            <div className="absolute top-[-10%] left-[-10%] w-[35%] h-[120%] bg-white/10 rounded-full blur-[40px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[120%] bg-white/10 rounded-full blur-[40px] pointer-events-none" />
            <div className="relative z-10 max-w-xl mx-auto space-y-5">
              <h2 className="text-4xl md:text-5xl font-bold font-heading tracking-tight leading-tight">Subscribe For Regular Updates &amp; Discounts</h2>
              <p className="text-white/80 text-base font-medium leading-relaxed">
                Get notified of new expert-led health courses, puberty resources, community webinars, and special discount coupon offers.
              </p>
              <form onSubmit={(e) => { e.preventDefault(); toast.success("Subscribed successfully!"); }} className="flex flex-col sm:flex-row gap-3 pt-3">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  className="flex-1 px-5 py-3.5 rounded-full bg-white/20 border border-white/20 placeholder:text-white/60 focus:outline-none focus:bg-white focus:text-slate-800 text-white font-medium text-sm transition-all"
                />
                <button type="submit" className="px-8 py-3.5 bg-white text-primary hover:bg-white/90 rounded-full font-bold text-sm shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>

  );
}
