import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Zap, Heart } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="text-center max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-medium animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Empowering Every Woman's Journey
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
            Your Cycle, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
              Understood & Celebrated.
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Infano Care is your companion for menstrual health and reproductive wellness. 
            Track your cycle, get AI-powered insights, and connect with experts who care.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/get-started" className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
              Start Your Journey <ArrowRight size={20} />
            </Link>
            <Link href="/about" className="px-8 py-4 rounded-lg font-medium border border-border hover:bg-secondary transition-all">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {[
          { 
            title: "Smart Cycle Tracking", 
            desc: "Understand your body better with precision tracking and AI-driven cycle predictions tailored to your unique rhythm.",
            icon: Zap,
            color: "text-purple-500"
          },
          { 
            title: "Expert Consultations", 
            desc: "Direct access to reproductive health specialists and mentors whenever you need guidance or support.",
            icon: Heart,
            color: "text-rose-500"
          },
          { 
            title: "Health Insights", 
            desc: "Deep-dive analysis of your symptoms and patterns to help you manage your wellness proactively.",
            icon: Shield,
            color: "text-indigo-500"
          }
        ].map((feature) => (
          <div key={feature.title} className="glass-card p-8 rounded-3xl space-y-4 hover:translate-y-[-8px] transition-all duration-300">
            <div className={`w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center`}>
              <feature.icon className={feature.color} size={24} />
            </div>
            <h3 className="text-xl font-bold">{feature.title}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {feature.desc}
            </p>
          </div>
        ))}
      </section>

      {/* Social Proof */}
      <section className="text-center space-y-12 py-20 bg-secondary/30 rounded-[40px] mx-4">
        <div className="flex items-center justify-center gap-2 text-primary font-semibold">
          <Heart fill="currentColor" size={20} /> Trusted by thousands of women globally
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale">
          <div className="text-2xl font-bold italic">WOMEN'S HEALTH</div>
          <div className="text-2xl font-bold">VOGUE</div>
          <div className="text-2xl font-bold">FORBES</div>
          <div className="text-2xl font-bold">TECHCRUNCH</div>
        </div>
      </section>
    </div>

  );
}
