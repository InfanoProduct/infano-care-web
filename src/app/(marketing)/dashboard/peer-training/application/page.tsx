"use client";

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { ArrowRight, Loader2, CheckCircle2, Shield } from 'lucide-react';
import Link from 'next/link';

export default function PeerApplicationPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    eligibility: {
      isOver18: false,
      hasLivedExperience: false,
      isFluent: false,
      isStable: false,
      isDigitallyLiterate: false,
      canCommit: false,
      agreesToVerification: false,
      confidentiality: false,
      safeguarding: false,
      boundaries: false
    }
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res: any = await apiClient.get('/peerline/training/status');
        if (res.certificationStatus === 'submitted' || res.certificationStatus === 'certified') {
          setSuccess(true);
        }
      } catch (err) {
        console.error('Failed to fetch status:', err);
      }
    };
    fetchStatus();
  }, []);

  const handleApply = async () => {
    setLoading(true);
    try {
      await apiClient.post('/peerline/mentor/apply', {
        eligibility: formData.eligibility
      });
      setSuccess(true);
    } catch (err: any) {
      console.error('Application Error:', err);
      alert(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-32 h-32 mx-auto rounded-[3rem] bg-green-100 text-green-600 flex items-center justify-center mb-8 shadow-2xl shadow-green-200">
          <CheckCircle2 size={64} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-4">Application Submitted!</h2>
        <p className="text-lg text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">
          Thank you for completing the training and assessment. Your application is now under review by our administration team.
        </p>
        <Link
          href="/dashboard"
          className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold inline-flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl"
        >
          Return to Dashboard <ArrowRight size={20} />
        </Link>
      </div>
    );
  }

  const allChecked = Object.values(formData.eligibility).every(Boolean);

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500">
        <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield size={32} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Code of Conduct</h1>
        <p className="text-slate-500">Agree to our guidelines to finalize your application.</p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 md:p-12 space-y-12">
        {/* Eligibility & Conduct */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Eligibility & Code of Conduct</h2>
          <p className="text-sm text-slate-500">Please confirm that you meet our criteria and agree to the guidelines.</p>

          <div className="grid sm:grid-cols-2 gap-4">
            {Object.keys(formData.eligibility).map((key) => (
              <label key={key} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all border border-transparent hover:border-primary/20">
                <input
                  type="checkbox"
                  checked={formData.eligibility[key as keyof typeof formData.eligibility]}
                  onChange={(e) => setFormData({
                    ...formData,
                    eligibility: { ...formData.eligibility, [key]: e.target.checked }
                  })}
                  className="w-5 h-5 accent-primary mt-0.5"
                />
                <span className="text-xs font-bold text-slate-700 leading-tight">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^is /, '').replace(/^has /, '').replace(/^can /, '').replace(/^agrees /, '').toUpperCase()}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Submit */}
        <div className="pt-8 flex justify-end">
          <button
            disabled={!allChecked || loading}
            onClick={handleApply}
            className="btn-primary py-4 px-10 text-lg flex items-center justify-center disabled:opacity-50 min-w-[250px]"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Submit Application'}
          </button>
        </div>
      </div>
    </div>
  );
}
