import { ArrowRight, Shield, CheckCircle2, MessageSquare, GraduationCap, Award } from 'lucide-react';
import { PeerLineOnboardingForm } from '@/components/peerline/PeerLineOnboardingForm';

export default function PeerLineOnboardingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold mb-6">
            <Shield size={16} /> PeerLine Mentor Program
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6 text-foreground">
            Join the PeerLine <br />
            <span className="text-primary">Support Network</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Become a certified Peer Mentor and help create a safer, kinder space for girls everywhere. 
            Follow our structured onboarding process to begin your journey.
          </p>
        </div>
      </section>

      {/* Main Onboarding Flow */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Left: Process Overview */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">The Process</h2>
                <div className="space-y-6">
                  {[
                    { icon: <MessageSquare size={20} />, title: '1. Application', desc: 'Eligibility check & personal statement' },
                    { icon: <GraduationCap size={20} />, title: '2. Scenario Exercise', desc: 'Written responses to sample messages' },
                    { icon: <Award size={20} />, title: '3. Certification', desc: 'Complete 4 training episodes & assessment' },
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
                        {step.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{step.title}</h4>
                        <p className="text-xs text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-slate-900 text-white rounded-3xl">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-accent-light" /> 
                  Automated Certification
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Bypass manual admin approval! Once you pass the final assessment with 80%+, you are automatically certified to start accepting conversations.
                </p>
              </div>
            </div>

            {/* Right: The Form */}
            <div className="lg:col-span-2">
              <PeerLineOnboardingForm />
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
