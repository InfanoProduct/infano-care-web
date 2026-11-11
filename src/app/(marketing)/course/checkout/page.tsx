/* eslint-disable */
import React, { Suspense } from "react";
import CourseCheckoutFlow from "@/components/course/CourseCheckoutFlow";

export const metadata = {
  title: "Checkout · Girlhood: HerNext",
  description: "Secure checkout for Girlhood: HerNext course and book bundle.",
};

export default function CourseCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFAF6] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#C2456A]/20 border-t-[#C2456A] animate-spin mb-4" />
          <p className="text-xs font-bold uppercase tracking-widest text-[#8A7896]">
            Loading secure checkout...
          </p>
        </div>
      }
    >
      <CourseCheckoutFlow />
    </Suspense>
  );
}

