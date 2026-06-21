'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  CreditCard, Award, ShoppingBag, Calendar, CheckCircle2, 
  Loader2, ShieldCheck, ArrowRight, MessageCircle, ExternalLink,
  DollarSign, FileText, AlertCircle, HelpCircle, BadgeCheck, MapPin
} from 'lucide-react';
import { ProgramsService, ProgramEnrollment } from '@/services/programs.service';
import { ShopService } from '@/services/shop.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function CustomerPaymentsOverview() {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<ProgramEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPaymentData = useCallback(async () => {
    try {
      setLoading(true);
      const [enrollRes] = await Promise.all([
        ProgramsService.getUserEnrollments().catch(() => ({ success: true, data: [] }))
      ]);

      setEnrollments(enrollRes.data || []);
    } catch (err) {
      console.error('Failed to load payment & invoice data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPaymentData();
  }, [loadPaymentData]);



  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-primary">
        <Loader2 className="animate-spin text-primary" size={44} />
        <span className="font-extrabold text-lg text-slate-600 tracking-wide">Compiling Financial Ledger...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-[1280px] mx-auto pb-8 font-sans">
      
      {/* Header Banner */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-sm">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white border border-primary/20 rounded-md text-[10px] font-bold text-primary shadow-sm">
            <CreditCard size={11} /> Secure Transactions
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Payments & Invoices
          </h1>
          <p className="text-xs font-semibold text-slate-500 max-w-lg leading-relaxed">
            Review detailed invoice summaries, track physical product delivery coordinates, and audit digital program enrollments.
          </p>
        </div>
      </div>

      {/* Main Grid: Left Column for Payments lists, Right for FAQs/Support info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Tab Switcher & Data Lists (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Program Enrollments list */}
          <div className="space-y-4">
              {enrollments.length === 0 ? (
                <div className="text-center py-12 bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-3.5">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center mx-auto text-slate-300">
                    <Award size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-850">No Program Enrollments Found</h4>
                    <p className="text-xs text-slate-400 font-medium mt-1 max-w-sm mx-auto">
                      You haven't enrolled in any developmental programs yet. Explore classes to get started!
                    </p>
                  </div>
                  <Link 
                    href="/#programs" 
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white font-bold text-xs rounded-lg shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    View Curriculums <ArrowRight size={13} />
                  </Link>
                </div>
              ) : (
                enrollments.map((enr) => (
                  <div 
                    key={enr.id}
                    className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm relative overflow-hidden border-t-4 border-t-primary"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                            1:1 Private Mentoring
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                            <Calendar size={11} />
                            {new Date(enr.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mt-1">
                          {enr.program.title} Program
                          {enr.user?.id && user?.id && enr.user.id !== user.id && (
                            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded border ${enr.user?.role === 'TEEN' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                              By {enr.user?.role === 'TEEN' ? 'Daughter' : 'Parent'}
                            </span>
                          )}
                        </h3>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-lg font-bold text-slate-850">₹{enr.pricePaid.toLocaleString()}</span>
                        <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Paid successfully</p>
                      </div>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold text-slate-500">
                      <div className="flex flex-wrap gap-4">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block">Registration ID</span>
                          <span className="text-slate-700 font-bold font-mono text-[11px] block mt-0.5">{enr.id}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block">Enrollment Status</span>
                          <span className="text-emerald-600 font-bold flex items-center gap-1 mt-0.5 text-[11px]">
                            <BadgeCheck size={13} /> {enr.status}
                          </span>
                        </div>
                      </div>

                      <Link 
                        href="/dashboard"
                        className="inline-flex items-center gap-1 text-primary hover:text-primary-dark font-bold text-[11px] group"
                      >
                        Go to Workspace <ArrowRight className="group-hover:translate-x-0.5 transition-transform" size={12} />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

        </div>

        {/* RIGHT COLUMN: Support, Security, FAQs (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Safety Verification Badge */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-3.5">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="text-green-500" size={16} />
              Billing Security
            </h4>
            <p className="text-xs font-medium text-slate-500 leading-relaxed">
              Every checkout is processed securely using modern 256-bit encryption through Razorpay, India's leading payment infrastructure. 
            </p>
            <div className="border-t border-slate-100 pt-2.5 flex items-center gap-2.5 text-[9px] font-bold text-slate-400">
              <span>🔒 PCI-DSS Compliant</span>
              <span>•</span>
              <span>💳 UPI & Card Safe</span>
            </div>
          </div>

          {/* Billing FAQs */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="text-primary" size={16} />
              Billing FAQs
            </h4>

            <div className="space-y-3 text-xs">
              <div className="space-y-0.5">
                <h5 className="font-bold text-slate-700">How do I access sessions after enrolling?</h5>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Log in with the registered phone number. Your dashboard immediately hosts live Google Meet links for active program cohorts.
                </p>
              </div>

              <div className="space-y-0.5">
                <h5 className="font-bold text-slate-700">Can I request a payment refund?</h5>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Refunds are subject to terms based on book shipping and program session completions. Reach out directly to support at WhatsApp or email.
                </p>
              </div>

              <div className="space-y-0.5">
                <h5 className="font-bold text-slate-700">How do I get my Tax Invoice?</h5>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Tax invoice structures are dynamically printed above. If you need a formal PDF for corporate reimbursement, chat with our coordinator on WhatsApp.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
