"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Video, PlayCircle, Clock, Search, Heart, Sparkles, Play, CheckCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/lib/api-client";
import Script from "next/script";

const DecorativeBg = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 flex justify-center">
    <div className="w-full max-w-6xl relative h-full">
      {/* Sparkles */}
      <Sparkles className="absolute top-10 left-10 text-purple-300/40 w-8 h-8 -rotate-12 animate-pulse" />
      <Sparkles className="absolute top-40 left-1/4 text-yellow-400/30 w-6 h-6 rotate-45" />
      <Sparkles className="absolute top-16 right-1/4 text-orange-300/40 w-7 h-7" />
      
      {/* Hearts */}
      <Heart className="absolute top-24 left-[15%] text-pink-300/40 w-8 h-8 -rotate-12" />
      <Heart className="absolute top-20 right-[15%] text-pink-400/30 w-10 h-10 rotate-12 animate-pulse" />
      
      {/* Dotted swirly lines */}
      <svg className="absolute top-10 right-0 w-64 h-32 text-slate-300/50" viewBox="0 0 200 100" fill="none">
        <path d="M0 80 Q 50 10 100 50 T 200 20" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
      </svg>
      <svg className="absolute top-48 left-0 w-32 h-32 text-slate-300/40" viewBox="0 0 100 100" fill="none">
        <path d="M10 90 Q 50 10 90 90" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
      </svg>
    </div>
  </div>
);

export default function ExploreCoursesPage() {
  const [exploreCourses, setExploreCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const router = useRouter();
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const exploreRes = await apiClient.get("/lms/explore");
      if (exploreRes) setExploreCourses(exploreRes as any[]);
    } catch (error) {
      toast.error("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (courseId: string) => {
    try {
      const res = await apiClient.post(`/lms/${courseId}/purchase`);
      
      if (res && res.razorpay) {
        if (typeof (window as any).Razorpay === 'undefined') {
          toast.error("Payment gateway is loading. Please wait a moment.");
          return;
        }

        const options = {
          key: res.razorpay.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: res.razorpay.amount * 100,
          currency: "INR",
          name: "Infano.care LMS",
          description: "Course Enrollment",
          order_id: res.razorpay.orderId,
          handler: async function (response: any) {
            try {
              toast.loading("Verifying payment...", { id: "payment" });
              await apiClient.post(`/lms/${courseId}/verify-purchase`, {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              toast.success("Successfully enrolled!", { id: "payment" });
              router.push("/dashboard/my-courses");
            } catch (err) {
              toast.error("Payment verification failed.", { id: "payment" });
            }
          },
          theme: {
            color: "#4a1e7f",
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function () {
          toast.error("Payment failed. Please try again.");
        });
        rzp.open();
      } else {
        toast.success("Successfully enrolled!");
        router.push("/dashboard/my-courses");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to enroll in course.");
    }
  };

  const dataCategories = Array.from(new Set(exploreCourses.map(c => c.category).filter(Boolean)));
  const displayCategories = ["All", ...(dataCategories.length > 0 ? dataCategories : ["Parenting", "Teen Health", "Nutrition", "Productivity", "Wellbeing", "Digital Life"])];

  const filteredExploreCourses = exploreCourses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase()) || course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory || (!course.category && selectedCategory === "General");
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="relative min-h-screen pb-20 overflow-x-hidden font-sans">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <DecorativeBg />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header Area */}
          <div className="flex flex-col items-center text-center mb-12 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 text-pink-500 text-sm font-bold mb-6 border border-pink-100">
              <Sparkles className="w-4 h-4" /> Keep Learning, Keep Growing
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight font-heading">
              Explore Our <span className="relative text-primary inline-block">
                Courses
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>
            <p className="text-slate-500 font-medium mt-6 text-lg max-w-2xl mx-auto">
              Build knowledge. Strengthen skills. Grow with confidence.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 w-full mb-10 relative z-10">
            <div className="relative w-full lg:w-96 shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search courses, topics..." 
                className="w-full pl-12 pr-4 py-3.5 rounded-full bg-white border border-slate-200 shadow-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-700 font-medium transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 lg:pb-0 scrollbar-hide hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style dangerouslySetInnerHTML={{__html: `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
              `}} />
              {displayCategories.map(category => (
                <button 
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                    selectedCategory === category 
                      ? "bg-primary text-white shadow-md shadow-primary/20 border border-primary" 
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-80 bg-white rounded-[24px] p-2 border border-slate-100 shadow-sm animate-pulse flex flex-col">
                  <div className="h-48 bg-slate-100 rounded-[20px] w-full"></div>
                  <div className="p-4 flex-1 flex flex-col gap-3">
                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-100 rounded w-full"></div>
                    <div className="h-3 bg-slate-100 rounded w-2/3"></div>
                    <div className="mt-auto flex justify-between">
                      <div className="h-4 bg-slate-100 rounded w-16"></div>
                      <div className="h-6 bg-slate-100 rounded-full w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredExploreCourses.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[32px] border border-slate-100 shadow-sm">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700">No courses found</h3>
              <p className="text-slate-500 mt-2">Try adjusting your filters or search term.</p>
              <button onClick={() => {setSearchQuery(""); setSelectedCategory("All");}} className="mt-6 px-6 py-2.5 bg-slate-100 text-slate-700 rounded-full font-bold hover:bg-slate-200 transition-colors">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredExploreCourses.map(course => (
                <div key={course.id} className="bg-white rounded-[28px] p-2.5 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(74,30,127,0.1)] transition-all duration-300 group overflow-hidden flex flex-col h-full relative cursor-pointer" onClick={() => router.push(`/dashboard/courses/explore/${course.id}`)}>
                  {/* Image Container */}
                  <div className="relative h-[200px] rounded-[22px] overflow-hidden bg-slate-100">
                    <img src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                      <span className="text-xs font-black text-slate-700 flex items-center gap-1">
                         {course.category === "Parenting" && "👨‍👩‍👧"}
                         {course.category === "Teen Health" && "🧠"}
                         {course.category === "Digital Life" && "📱"}
                         {course.category === "Nutrition" && "🥗"}
                         {course.category === "Productivity" && "📚"}
                         {course.category || "General"}
                      </span>
                    </div>

                    {/* Favorite Heart */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); /* Add favorite logic later */ }}
                      className="absolute top-4 right-4 p-2 rounded-full bg-white/40 hover:bg-white/95 backdrop-blur-sm transition-all text-white hover:text-pink-500 shadow-sm z-10"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                    
                    {/* Play Button Overlay */}
                    <div className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg text-primary transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <Play className="w-4 h-4 ml-1" fill="currentColor" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-extrabold text-[17px] text-slate-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors">{course.title}</h3>
                    <p className="text-[14px] text-slate-500 mt-2 line-clamp-2 leading-relaxed flex-1">{course.description}</p>
                    
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-1.5 text-slate-500 text-[13px] font-bold">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {course.timeDuration || 120} mins
                      </div>
                      <div className={`px-4 py-1 rounded-full text-xs font-black ${course.isFree ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-700'}`}>
                        {course.isFree ? "FREE" : `₹${course.price}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Big CTA Card matching design */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-100/80 rounded-[28px] p-8 border border-purple-200/50 shadow-sm flex flex-col h-full relative overflow-hidden group">
                <Sparkles className="absolute top-6 right-6 text-purple-300 w-6 h-6 opacity-60" />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/40 blur-3xl rounded-full pointer-events-none"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-200/40 blur-3xl rounded-full pointer-events-none"></div>
                
                <div className="flex-1 mt-4 relative z-10">
                  {/* Tiny graduation cap illustration could go here */}
                  <div className="text-4xl mb-4">🎓</div>
                  <h3 className="text-2xl font-black text-slate-800 leading-tight">
                    Learn <span className="text-primary">Today</span>,<br/>
                    Lead <span className="text-primary">Tomorrow!</span>
                  </h3>
                  <p className="text-[14px] text-slate-600 mt-3 leading-relaxed font-medium max-w-[95%]">
                    Unlock expert knowledge and build a healthier, happier, smarter you.
                  </p>
                </div>
                
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }} 
                  className="mt-6 w-full py-3.5 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 relative z-10"
                >
                  View All Courses <span className="text-xl leading-none">→</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
