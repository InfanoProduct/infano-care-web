"use client";

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export function PeerLineOnboardingForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('peerline_onboarding_form');
      if (saved) return JSON.parse(saved);
    }
    return {
      name: '',
      email: '',
      phone: '',
      personalStatement: '',
      scenario1: '',
      scenario2: '',
      eligibility: {
        isOver18: false,
        hasLivedExperience: false,
        isFluent: false,
        isStable: false,
        isDigitallyLiterate: false,
        canCommit: false,
        agreesToVerification: false,
      }
    };
  });

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('peerline_onboarding_form', JSON.stringify(formData));
  }, [formData]);

  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res: any = await apiClient.get('/peerline/training/status');
        if (res.status || res.certificationStatus) {
          const status = res.status;
          const certStatus = res.certificationStatus;
          
          // Persist for reloads
          localStorage.setItem('peerline_app_status', status);
          if (certStatus) localStorage.setItem('peerline_cert_status', certStatus);

          setApplicationStatus(status);
          
          if (certStatus === 'certified') {
            window.location.href = '/peerline/login';
            return;
          }
          
          if (status === 'pending' || status === 'approved' || ['training', 'pending_training', 'pending_conduct'].includes(certStatus)) {
            setSuccess(true);
          }
        }
      } catch (err) {
        // Not logged in, check localStorage for previous submission state
        const savedStatus = localStorage.getItem('peerline_app_status');
        if (savedStatus && savedStatus !== 'none') {
          setApplicationStatus(savedStatus);
          setSuccess(true);
        }
      } finally {
        setInitialLoading(false);
      }
    };
    checkStatus();
  }, []);

  const handleApply = async () => {
    setLoading(true);
    setError(null);
    setValidationErrors([]);
    try {
      await apiClient.post('/peerline/mentor/apply', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        personalStatement: formData.personalStatement,
        scenarioResponses: [formData.scenario1, formData.scenario2],
        eligibility: formData.eligibility
      });
      // Save info to local storage for certification step
      localStorage.setItem('peerline_mentor_details', JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      }));
      localStorage.removeItem('peerline_onboarding_form');
      setSuccess(true);
    } catch (err: any) {
      const isAlreadySubmitted = 
        err.details?.status || 
        err.message?.toLowerCase().includes('already submitted') ||
        (typeof err.error === 'string' && err.error.toLowerCase().includes('already submitted'));

      if (isAlreadySubmitted) {
        const status = err.details?.status || 'pending';
        const certStatus = err.details?.certificationStatus;
        
        // Persist for reloads
        localStorage.setItem('peerline_app_status', status);
        if (certStatus) localStorage.setItem('peerline_cert_status', certStatus);

        setApplicationStatus(status);
        if (certStatus === 'certified') {
          window.location.href = '/peerline/login';
          return;
        }
        setSuccess(true);
        return;
      }

      console.error('Onboarding Error:', err);
      setError(err.message || 'Something went wrong');
      if (err.details) {
        setValidationErrors(err.details);
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-xl flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  if (success) {
    const isPending = applicationStatus === 'pending';
    const isApproved = ['approved', 'training', 'certified', 'pending_training'].includes(applicationStatus || '');

    return (
      <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-xl text-center animate-in fade-in zoom-in duration-500">
        <div className={`w-20 h-20 ${isApproved ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'} rounded-full flex items-center justify-center mx-auto mb-6`}>
          {isApproved ? <CheckCircle2 size={40} /> : <Loader2 className="animate-spin" size={40} />}
        </div>
        <h3 className="text-3xl font-bold text-slate-900 mb-4">
          {isPending ? 'Application Under Review' : 'Application Successful!'}
        </h3>
        <div className="space-y-4 mb-8 max-w-md mx-auto text-slate-600">
          {isPending ? (
            <p>
              Your application is currently being reviewed by our administration team. Please wait for approval before you can start your certification journey.
            </p>
          ) : (
            <p>
              Thank you. Your application has been processed. You can now proceed to the Certification Journey to begin your training.
            </p>
          )}
          <p className="text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
            {isPending 
              ? "Next steps: Our team will contact you shortly for a video onboarding call. Once approved, the enrollment button will be enabled."
              : "Next steps: Complete the episodes, pass the final assessment, and get certified as a PeerLine Mentor."
            }
          </p>
        </div>
        
        {isApproved ? (
          <Link href="/peerline/dashboard" className="btn-primary text-lg px-10 py-4 inline-flex items-center">
            Enroll in Certification Journey <ArrowRight className="ml-2" />
          </Link>
        ) : (
          <button disabled className="btn-primary opacity-50 cursor-not-allowed text-lg px-10 py-4 inline-flex items-center">
            Wait for Approval <ArrowRight className="ml-2" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl border border-slate-100">
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-50">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Mentor Application</h3>
          <p className="text-sm text-muted-foreground mt-1 flex items-center">
            Complete all steps to proceed to training.
            <span className="mx-2">•</span>
            <Link href="/peerline/login" className="text-primary hover:underline font-bold">Already a mentor? Login</Link>
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm font-black text-primary mb-2">STEP {step} / 4</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`w-8 h-1.5 rounded-full ${s <= step ? 'bg-primary' : 'bg-slate-100'}`} />
            ))}
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          <h4 className="text-lg font-bold text-slate-800">1. Eligibility Requirements</h4>
          <p className="text-sm text-muted-foreground">Please confirm that you meet all the essential criteria from Section 1.1 of the Mentor Guide.</p>
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
          <button
            disabled={!Object.values(formData.eligibility).every(Boolean)}
            onClick={() => setStep(2)}
            className="w-full btn-primary py-5 text-lg disabled:opacity-50 mt-6"
          >
            Continue to Personal Statement
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          <h4 className="text-lg font-bold text-slate-800">2. Personal Statement</h4>
          <p className="text-sm text-muted-foreground">Share your lived experience and your motivation for becoming a PeerLine mentor. Minimum 50 characters required.</p>
          <textarea
            className="w-full p-6 rounded-2xl border border-slate-200 min-h-[200px] focus:ring-2 focus:ring-primary/50 outline-none text-slate-700 leading-relaxed"
            placeholder="Tell us about yourself and why you want to support others..."
            value={formData.personalStatement}
            onChange={(e) => setFormData({ ...formData, personalStatement: e.target.value })}
          />
          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">Back</button>
            <button
              disabled={formData.personalStatement.length < 50}
              onClick={() => setStep(3)}
              className="flex-1 btn-primary py-4 disabled:opacity-50"
            >
              Next: Scenario Exercise
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8 animate-in slide-in-from-right duration-300">
          <h4 className="text-lg font-bold text-slate-800">3. Scenario Exercise</h4>
          <p className="text-sm text-muted-foreground">How would you respond to these sample messages? Focus on active listening and empathy as defined in Section 2.2 of the guide.</p>
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-sm italic mb-4 font-bold text-slate-600">Scenario 1: "I've been feeling so alone lately. I don't think anyone understands."</p>
              <textarea
                className="w-full p-4 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Write your supportive response here..."
                value={formData.scenario1}
                onChange={(e) => setFormData({ ...formData, scenario1: e.target.value })}
              />
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-sm italic mb-4 font-bold text-slate-600">Scenario 2: "I'm so stressed about my exams. I feel like failing is not an option."</p>
              <textarea
                className="w-full p-4 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Write your supportive response here..."
                value={formData.scenario2}
                onChange={(e) => setFormData({ ...formData, scenario2: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setStep(2)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">Back</button>
            <button
              disabled={!formData.scenario1 || !formData.scenario2}
              onClick={() => setStep(4)}
              className="flex-1 btn-primary py-4 disabled:opacity-50"
            >
              Next: Personal Details
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          <h4 className="text-lg font-bold text-slate-800">4. Personal Information</h4>
          <p className="text-sm text-muted-foreground">We need your contact details to schedule your video onboarding call and background check.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Full Name</label>
              <input
                type="text"
                className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary/50 outline-none text-slate-700"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Email Address</label>
              <input
                type="email"
                className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary/50 outline-none text-slate-700"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Phone Number</label>
              <input
                type="tel"
                className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary/50 outline-none text-slate-700"
                placeholder="+91 00000 00000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">
              <p className="font-bold mb-1">{error}</p>
              {validationErrors.length > 0 && (
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((ve, i) => (
                    <li key={i}>{ve.path}: {ve.message}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex gap-4">
            <button onClick={() => setStep(3)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">Back</button>
            <button
              disabled={!formData.name || !formData.email || !formData.phone || loading}
              onClick={handleApply}
              className="flex-1 btn-primary py-4 flex items-center justify-center disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : 'Submit Application'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
