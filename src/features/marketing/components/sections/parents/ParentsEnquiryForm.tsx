'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

const STEPS = [
  {
    id: 'age',
    title: "What is your child's age group?",
    options: ['8-10 years', '11-13 years', '14-16 years', '17-19 years'],
  },
  {
    id: 'interests',
    title: 'What are your primary areas of interest?',
    options: ['Holistic Wellness', 'Confidence Building', 'Safe Digital Community', 'Expert Guidance'],
  },
  {
    id: 'learning',
    title: 'Preferred learning style?',
    options: ['Story-led Learning', 'Activity-based', 'Group Discussions', 'One-on-One Mentoring'],
  },
  {
    id: 'contact',
    title: 'Almost there! Just a few more details',
  }
];

export function ParentsEnquiryForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    age: '',
    interests: '',
    learning: '',
    name: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleOptionSelect = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await apiClient.post('/enquiry/submit', {
        type: 'parent',
        contactName: formData.name,
        email: formData.email,
        phone: formData.phone,
        schoolName: '', // Added to satisfy backend/prisma requirement
        details: `Age: ${formData.age}, Interests: ${formData.interests}, Learning Style: ${formData.learning}`,
      });

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">Submission Successful!</h3>
        <p className="text-slate-600 max-w-md mx-auto">
          Thank you for reaching out. Our team will contact you shortly to help guide your child's journey.
        </p>
      </motion.div>
    );
  }

  const currentStepData = STEPS[step];

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full mb-10 overflow-hidden">
        <motion.div 
          className="bg-primary h-full"
          initial={{ width: 0 }}
          animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl font-bold text-slate-900 mb-8">{currentStepData.title}</h3>

          {currentStepData.options ? (
            <div className="grid grid-cols-1 gap-4">
              {currentStepData.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleOptionSelect(currentStepData.id, option)}
                  className={`p-4 text-left rounded-2xl border-2 transition-all duration-200 font-medium ${
                    formData[currentStepData.id as keyof typeof formData] === option
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-slate-100 hover:border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Submit Enquiry
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          )}

          {step > 0 && !isSubmitted && (
            <button
              type="button"
              onClick={prevStep}
              className="mt-8 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Go Back
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
