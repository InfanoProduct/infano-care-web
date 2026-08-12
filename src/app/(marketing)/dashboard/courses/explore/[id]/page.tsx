"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Clock, Video, CheckCircle2, PlayCircle, Tag } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/lib/api-client";
import Script from "next/script";

export default function CourseExplorePage() {
  const { id } = useParams();
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const data = await apiClient.get(`/lms/${id}`);
      if (!data) throw new Error("Failed to load course");
      setCourse(data);
    } catch (error) {
      toast.error("Error loading course details");
      router.push("/dashboard/courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    try {
      const res = await apiClient.post(`/lms/${course.id}/purchase`, {}) as any;
      
      if (course.isFree || !res.razorpay) {
        toast.success("Successfully enrolled!");
        router.push(`/dashboard/courses/${course.id}`);
        return;
      }

      const { orderId, amount, currency, keyId } = res.razorpay;

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "Infano Care",
        description: `Enroll in ${course.title}`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            await apiClient.post(`/lms/${course.id}/verify-purchase`, {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success("Payment successful! Enrolled in course.");
            router.push(`/dashboard/courses/${course.id}`);
          } catch (verifyError: any) {
            toast.error(verifyError.message || "Payment verification failed.");
          }
        },
        prefill: {
          name: (user as any)?.profile?.displayName || (user as any)?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: { color: "#F472B6" } // pink-400 equivalent for primary
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function () {
        toast.error("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate purchase.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading course details...</p>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4 md:px-8 space-y-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      {/* Back Button */}
      <div>
        <Link href="/dashboard/courses" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          <ArrowLeft size={18} /> Back to Courses
        </Link>
      </div>

      {/* Hero Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row relative">
        <div className="md:w-2/5 relative h-64 md:h-auto bg-slate-100 shrink-0">
          {course.thumbnailUrl ? (
            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <BookOpen size={80} />
            </div>
          )}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full font-black text-primary shadow-lg border border-white/20 flex items-center gap-2">
            <Tag size={16} />
            {course.isFree ? "FREE" : `₹${course.price}`}
          </div>
        </div>
        
        <div className="p-8 md:p-10 flex-1 flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">{course.title}</h1>
          <p className="text-slate-600 text-lg mb-8 line-clamp-3">{course.description}</p>
          
          <div className="flex flex-wrap items-center gap-6 text-slate-500 font-bold mb-8">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <Clock size={20} className="text-primary" /> 
              {course.timeDuration} mins total
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <BookOpen size={20} className="text-blue-500" /> 
              {course.modules?.length || 0} Modules
            </div>
          </div>
          
          <button 
            onClick={handlePurchase}
            className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 text-lg"
          >
            {course.isFree ? "Enroll for Free" : "Purchase & Enroll Now"} <PlayCircle size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        {/* Left Column: Highlights & Description */}
        <div className="lg:col-span-2 space-y-8">
          {/* Highlights */}
          {course.highlights && course.highlights.length > 0 && (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h2 className="text-2xl font-black text-slate-800 mb-6">What you'll learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {course.highlights.map((highlight: string, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-green-500 shrink-0 mt-0.5" />
                    <span className="text-slate-600 font-medium">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Description */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h2 className="text-2xl font-black text-slate-800 mb-6">Course Description</h2>
            <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
              {course.description}
            </div>
          </div>
        </div>

        {/* Right Column: Curriculum */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm sticky top-6">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <Video size={24} className="text-primary" /> 
              Course Curriculum
            </h2>
            
            {course.modules && course.modules.length > 0 ? (
              <div className="space-y-4">
                {course.modules.map((mod: any, index: number) => (
                  <div key={mod.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors flex gap-4">
                    {mod.thumbnailUrl && (
                      <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-slate-200">
                        <img src={mod.thumbnailUrl} alt={mod.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-bold text-slate-800 line-clamp-2">{index + 1}. {mod.title}</h3>
                        <span className="shrink-0 text-xs font-black text-slate-400 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">
                          {mod.timeDuration}m
                        </span>
                      </div>
                      {mod.description && <p className="text-sm text-slate-500 line-clamp-2">{mod.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                <p className="text-slate-500 font-medium">Curriculum coming soon.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
