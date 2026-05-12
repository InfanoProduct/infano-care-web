"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle2, 
  Smartphone, 
  Sparkles, 
  Shield, 
  Heart, 
  BookOpen, 
  Activity, 
  Zap,
  Users,
  Play
} from 'lucide-react';
import { FaqSection } from '@/features/marketing/components/sections/FaqSection';
import { ECOSYSTEM_FAQS } from '@/features/marketing/data/faqs';

export default function EcosystemPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Section 3.1 — Mobile Showcase Hero */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 overflow-hidden bg-[#FAF9FF]">
        {/* Background Graphics - Enriched */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[5%] left-[-5%] w-[45%] h-[45%] bg-accent/10 rounded-full blur-[120px] animate-pulse" />
          
          {/* Animated Graphic Blobs */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              x: [0, 50, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-[40%_60%_70%_30%/40%_50%_60%_40%] blur-[80px]"
          />

          <div className="absolute inset-0 opacity-[0.05]" 
               style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #6366f1 1.5px, transparent 0)', backgroundSize: '48px 48px' }} />
          
          {/* Floating Decorative Elements */}
          <div className="absolute top-[15%] left-[5%] opacity-20">
             <div className="w-24 h-24 border-2 border-primary rounded-full animate-spin-slow" />
          </div>
          <div className="absolute bottom-[10%] right-[10%] opacity-20">
             <div className="w-32 h-32 border-2 border-accent rounded-2xl rotate-45 animate-bounce-slow" />
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-full mb-10 shadow-md"
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Smartphone size={12} />
                </div>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.25em]">The Infano Mobile Platform</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-5xl md:text-8xl font-bold font-heading text-slate-900 mb-8 leading-[1.05] tracking-tighter"
              >
                Six pillars. <br />
                <span className="text-primary">One universe.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-lg md:text-2xl text-slate-500 mb-12 leading-relaxed font-medium max-w-xl"
              >
                The Infano ecosystem is a holistic digital home for every girl—blending technology, stories, and guidance.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex items-center gap-8"
              >
                <Link href="#pillars" className="px-12 py-6 bg-slate-900 text-white rounded-full font-bold text-xl hover:bg-primary transition-all shadow-2xl shadow-slate-900/30 active:scale-95 flex items-center gap-3 group">
                  Explore the Pillars <ArrowRight size={24} className="transition-transform group-hover:translate-x-2" />
                </Link>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, type: "spring" }}
              className="flex-1 relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full scale-75 animate-pulse" />
              <MockupPhone>
                <div className="p-6 bg-white h-full flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                       <Sparkles size={20} className="text-primary" />
                    </div>
                    <div className="flex -space-x-2">
                       {[...Array(3)].map((_, i) => (
                         <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                       ))}
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-6 tracking-tight">Morning, Anya!</div>
                  <div className="space-y-4">
                    <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10">
                      <div className="text-[10px] font-black text-primary uppercase mb-2 tracking-widest">Active Quest</div>
                      <div className="text-lg font-bold">The Courage Code</div>
                      <div className="h-2 w-full bg-primary/10 rounded-full mt-4 overflow-hidden">
                        <motion.div 
                          initial={{ x: "-100%" }}
                          animate={{ x: "0%" }}
                          transition={{ duration: 2, delay: 1 }}
                          className="w-2/3 h-full bg-primary" 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex flex-col items-center shadow-sm">
                          <Activity size={24} className="text-emerald-500 mb-2" />
                          <div className="text-xs font-bold text-emerald-600">Health</div>
                       </div>
                       <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100 flex flex-col items-center shadow-sm">
                          <Users size={24} className="text-rose-500 mb-2" />
                          <div className="text-xs font-bold text-rose-600">Friends</div>
                       </div>
                    </div>
                  </div>
                </div>
              </MockupPhone>
            </motion.div>
          </div>
        </div>
      </section>

      <div id="pillars" className="space-y-0">
        {/* Section 3.2 — Pillar 1: Story-Based Learning */}
        <section className="py-40 bg-white relative overflow-hidden">
          {/* Background Graphics */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-50/30 -skew-x-12 translate-x-1/2" />
          <div className="absolute top-20 right-[15%] opacity-[0.05]">
             <div className="grid grid-cols-5 gap-4">
                {[...Array(25)].map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-emerald-600" />
                ))}
             </div>
          </div>

          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
            <div className="grid lg:grid-cols-2 gap-32 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1 relative"
              >
                <div className="absolute -inset-10 bg-emerald-100/50 blur-[100px] rounded-full scale-75" />
                <MockupPhone color="bg-[#E8F9F1]">
                  <div className="p-0 h-full flex flex-col overflow-hidden">
                    <div className="h-1/2 relative">
                      <img 
                        src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80" 
                        className="w-full h-full object-cover"
                        alt="Story interface"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-50 to-transparent" />
                    </div>
                    <div className="p-8 bg-white flex-1 -mt-12 rounded-t-[3.5rem] relative z-10 shadow-2xl">
                      <div className="flex justify-center mb-8">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full" />
                      </div>
                      <h4 className="text-3xl font-bold mb-4 tracking-tight">The Courage Code</h4>
                      <p className="text-base text-slate-500 mb-10 leading-relaxed font-medium">
                        Navigate the digital world with confidence. Your story, your choices.
                      </p>
                      <div className="space-y-4">
                         <motion.div whileHover={{ scale: 1.02 }} className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 text-sm font-bold flex items-center justify-between cursor-pointer">
                           Stand by her <Play size={16} className="text-emerald-500" />
                         </motion.div>
                         <motion.div whileHover={{ scale: 1.02 }} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold flex items-center justify-between opacity-50 cursor-pointer">
                           Stay quiet <Play size={16} />
                         </motion.div>
                      </div>
                    </div>
                  </div>
                </MockupPhone>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-1 lg:order-2"
              >
                <div className="w-20 h-20 rounded-[2rem] bg-emerald-50 text-emerald-500 flex items-center justify-center text-4xl mb-10 shadow-xl shadow-emerald-900/5 border border-emerald-100">
                  <BookOpen size={32} />
                </div>
                <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-8 tracking-tighter leading-none">Story-Based <br /> Learning Journeys</h2>
                <div className="w-20 h-1.5 bg-emerald-400 rounded-full mb-10" />
                <p className="text-xl text-slate-500 mb-12 leading-relaxed font-medium max-w-xl">
                  Learning that feels like living. Our journeys use narrative power to teach life skills—from self-worth to career exploration.
                </p>
                
                <div className="grid gap-8 mb-16">
                  {[
                    { title: 'Interactive Choices', desc: 'Branching narratives where her choices shape the outcome.' },
                    { title: '12+ Unique Worlds', desc: 'Designed for ages 10–21 with age-appropriate themes.' },
                    { title: 'Progress Rewards', desc: 'Badges and unlocks that celebrate every chapter finished.' }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 items-start group">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0 border border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">{item.title}</h4>
                        <p className="text-base text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-1000" />
                  <h4 className="font-bold mb-6 text-[10px] uppercase tracking-[0.3em] text-white/40">Popular Collections</h4>
                  <div className="flex flex-wrap gap-3">
                    {['Body Talks', 'Her Money Mind', 'Unfiltered', 'Friendship Lab'].map((tag) => (
                      <span key={tag} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-white hover:bg-primary hover:border-primary transition-all cursor-pointer">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Section 3.3 — Pillar 2: AI Wellness Tracker */}
        <section className="py-40 bg-[#FAF9FF] relative overflow-hidden">
          {/* Enhanced Background Graphic */}
          <div className="absolute inset-0 z-0 pointer-events-none">
             <div className="absolute top-1/2 left-0 w-full h-[800px] bg-[radial-gradient(circle_at_center,_#FFE4E6_0%,_transparent_70%)] opacity-30 blur-3xl" />
             <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
          </div>

          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
            <div className="grid lg:grid-cols-2 gap-32 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="w-20 h-20 rounded-[2rem] bg-rose-50 text-rose-500 flex items-center justify-center text-4xl mb-10 shadow-xl shadow-rose-900/5 border border-rose-100">
                  <Activity size={32} />
                </div>
                <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-8 tracking-tighter leading-none">AI Wellness <br /> & Cycle Tracker</h2>
                <div className="w-20 h-1.5 bg-rose-400 rounded-full mb-10" />
                <p className="text-xl text-slate-500 mb-12 leading-relaxed font-medium max-w-xl">
                  Know your body. Trust your mind. Our tracker identifies patterns in mood and energy to provide personalised medical-grade insights.
                </p>
                
                <div className="grid gap-8 mb-16">
                  {[
                    { title: 'Medically Backed', desc: 'Content reviewed by gynaecologists and wellness experts.' },
                    { title: 'Daily Check-ins', desc: 'Mood, symptoms, and energy tracking with AI insights.' },
                    { title: 'Safety Protocols', desc: 'Proactive wellness support and trusted adult alerts.' }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 items-start group">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0 border border-rose-100 group-hover:bg-rose-500 group-hover:text-white transition-all duration-500">
                        <Zap size={20} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">{item.title}</h4>
                        <p className="text-base text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-rose-500 text-white p-10 rounded-[3rem] shadow-2xl shadow-rose-900/20 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-1000" />
                  <h4 className="font-bold text-white mb-4 text-xl tracking-tight flex items-center gap-3">
                    <Shield size={24} /> Privacy First
                  </h4>
                  <p className="text-rose-50 leading-relaxed font-medium">
                    Fully encrypted and private. Girls control their data—we never share health logs with third parties without explicit consent.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute -inset-20 bg-rose-200/30 blur-[120px] rounded-full animate-pulse" />
                <MockupPhone color="bg-[#FDF2F8]">
                  <div className="p-8 h-full flex flex-col items-center justify-center">
                    <div className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em] mb-12">Cycle Timeline</div>
                    <div className="relative">
                       <motion.div 
                         animate={{ rotate: 360 }}
                         transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                         className="absolute -inset-8 border-2 border-rose-100 border-dashed rounded-full" 
                       />
                       <div className="w-56 h-56 rounded-full border-[16px] border-rose-100 flex flex-col items-center justify-center bg-white shadow-xl">
                          <div className="text-5xl font-black text-rose-500 tracking-tighter">Day 14</div>
                          <div className="text-[10px] font-black text-rose-300 uppercase mt-2">Follicular</div>
                       </div>
                    </div>
                    <div className="mt-16 w-full space-y-4">
                       {[
                         { icon: <Activity size={16} />, label: "Health Insights", value: "High Energy" },
                         { icon: <Heart size={16} />, label: "Mood Today", value: "Feeling Great" }
                       ].map((item, i) => (
                         <div key={i} className="bg-white p-5 rounded-2xl shadow-md border border-rose-50 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-400">{item.icon}</div>
                            <div className="flex-1">
                               <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.label}</div>
                               <div className="text-sm font-bold text-slate-900">{item.value}</div>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                </MockupPhone>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Section 3.4 — Pillar 3: Gamified Education */}
        <section className="py-40 bg-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 z-0 opacity-[0.03]" 
               style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #0ea5e9 2px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="absolute top-0 left-0 w-64 h-64 bg-sky-100/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
            <div className="grid lg:grid-cols-2 gap-32 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1 relative"
              >
                <div className="absolute -inset-10 bg-sky-100/50 blur-[100px] rounded-full scale-75" />
                <MockupPhone color="bg-[#E0F2FE]">
                  <div className="p-8 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-12">
                       <div className="text-2xl font-black text-sky-600 tracking-tighter">Rewards</div>
                       <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full text-xs font-bold text-sky-700 shadow-sm border border-sky-100">
                          <Sparkles size={14} className="text-sky-400" /> 2,450
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       {[
                         { icon: "🏆", label: "Early Bird" },
                         { icon: "⭐", label: "Top Learner" },
                         { icon: "🔥", label: "7 Day Streak" },
                         { icon: "💎", label: "Goal Getter" }
                       ].map((item, i) => (
                         <motion.div 
                           key={i} 
                           whileHover={{ y: -5 }}
                           className="bg-white p-6 rounded-[2.5rem] shadow-md border border-sky-50 flex flex-col items-center gap-3"
                         >
                           <div className="text-4xl">{item.icon}</div>
                           <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">{item.label}</div>
                         </motion.div>
                       ))}
                    </div>
                    <div className="mt-auto p-8 bg-sky-600 rounded-[3rem] text-white shadow-2xl shadow-sky-900/20 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl translate-x-1/2 -translate-y-1/2" />
                       <div className="text-[10px] font-black opacity-60 mb-2 uppercase tracking-widest">Level Progress</div>
                       <div className="text-xl font-bold">Explorer II</div>
                       <div className="h-2 w-full bg-white/20 rounded-full mt-6 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: "65%" }}
                            transition={{ duration: 1.5 }}
                            className="h-full bg-white" 
                          />
                       </div>
                    </div>
                  </div>
                </MockupPhone>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-1 lg:order-2"
              >
                <div className="w-20 h-20 rounded-[2rem] bg-sky-50 text-sky-500 flex items-center justify-center text-4xl mb-10 shadow-xl shadow-sky-900/5 border border-sky-100">
                  <Zap size={32} />
                </div>
                <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-8 tracking-tighter leading-none">Gamified <br /> Education</h2>
                <div className="w-20 h-1.5 bg-sky-400 rounded-full mb-10" />
                <p className="text-xl text-slate-500 mb-12 leading-relaxed font-medium max-w-xl">
                  Learning that doesn't feel like learning. We believe education sticks when it's joyful.
                </p>
                
                <div className="grid gap-8 mb-16">
                  {[
                    { title: 'Daily Quests', desc: 'Short modules (5–10 mins) that fit her daily routine.' },
                    { title: 'Achievement Badges', desc: 'Unlock milestones across 20+ life skill categories.' },
                    { title: 'Safe Competition', desc: 'Optional moderated school leaderboards to foster growth.' }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 items-start group">
                      <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-500 shrink-0 border border-sky-100 group-hover:bg-sky-500 group-hover:text-white transition-all duration-500">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">{item.title}</h4>
                        <p className="text-base text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Section 3.5 — Pillar 4: Support Circles */}
        <section className="py-40 bg-[#FAF9FF] relative overflow-hidden">
          {/* Background Graphics */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,_#F3E8FF_0%,_transparent_40%)] opacity-50" />
          <div className="absolute bottom-0 right-0 w-1/2 h-full bg-purple-50/30 skew-x-12 translate-x-1/4" />

          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
            <div className="grid lg:grid-cols-2 gap-32 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="w-20 h-20 rounded-[2rem] bg-purple-50 text-purple-500 flex items-center justify-center text-4xl mb-10 shadow-xl shadow-purple-900/5 border border-purple-100">
                  <Users size={32} />
                </div>
                <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-8 tracking-tighter leading-none">Expert-Led <br /> Support Circles</h2>
                <div className="w-20 h-1.5 bg-purple-400 rounded-full mb-10" />
                <p className="text-xl text-slate-500 mb-12 leading-relaxed font-medium max-w-xl">
                  Real experts. Real conversations. Moderated group sessions led by qualified professionals in a safe, anonymous environment.
                </p>
                
                <div className="grid sm:grid-cols-2 gap-6 mb-12">
                  {[
                    { name: 'Wellness Circle', desc: 'Mental health and emotional wellbeing' },
                    { name: 'Body Circle', desc: 'Puberty and physical development' },
                    { name: 'Ambition Circle', desc: 'Career goals and future planning' },
                    { name: 'Bond Circle', desc: 'Healthy relationships and boundaries' }
                  ].map((circle) => (
                    <div key={circle.name} className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-lg hover:shadow-purple-900/5 transition-all group">
                      <h4 className="font-bold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">{circle.name}</h4>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">{circle.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-900 text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl" />
                   <div className="flex items-center gap-5 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center">
                        <Shield size={24} className="text-white" />
                      </div>
                      <h4 className="text-2xl font-bold tracking-tight">Safe & Verified</h4>
                   </div>
                   <p className="text-lg text-slate-400 leading-relaxed font-medium">
                     Every session is moderated by trained Infano professionals. We ensure a kind, respectful, and safe space for every girl.
                   </p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute -inset-10 bg-purple-200/50 blur-[100px] rounded-full" />
                <MockupPhone color="bg-[#F3E8FF]">
                  <div className="p-0 h-full flex flex-col bg-[#0F172A] text-white overflow-hidden">
                    <div className="flex-1 p-10 flex flex-col items-center justify-center text-center relative">
                       <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-purple-900/20 to-transparent" />
                       <motion.div 
                         animate={{ scale: [1, 1.1, 1] }}
                         transition={{ duration: 4, repeat: Infinity }}
                         className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center text-5xl mb-8 relative border border-white/10"
                       >
                          👩‍⚕️
                          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full border-4 border-slate-900" />
                       </motion.div>
                       <div className="text-2xl font-bold tracking-tight">Dr. Sarah Jain</div>
                       <div className="text-xs font-black text-purple-400 uppercase mt-2 tracking-[0.2em]">Live: Body Confidence</div>
                       
                       <div className="mt-12 flex gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5"><Heart size={24} /></div>
                          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5"><Users size={24} /></div>
                       </div>
                    </div>
                    <div className="h-28 bg-white/5 backdrop-blur-2xl p-8 flex items-center justify-between border-t border-white/5">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                          <div className="text-sm font-bold opacity-60">124 Watching</div>
                       </div>
                       <button className="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20">Join Circle</button>
                    </div>
                  </div>
                </MockupPhone>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Section 3.6 — Pillar 5: Peer Community */}
        <section className="py-40 bg-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] opacity-[0.02]" />
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-pink-100/30 rounded-full blur-[120px] translate-x-1/2" />

          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
            <div className="grid lg:grid-cols-2 gap-32 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1 relative"
              >
                <div className="absolute -inset-10 bg-pink-100/50 blur-[100px] rounded-full scale-75" />
                <MockupPhone color="bg-[#FCE7F3]">
                  <div className="p-8 h-full flex flex-col">
                    <div className="text-2xl font-bold mb-10 tracking-tight">Community</div>
                    <div className="space-y-6">
                       {[
                         { user: "Aanya", text: "Finished my 7-day streak! 🔥", likes: 24, bg: "bg-white" },
                         { user: "Riya", text: "The Courage Code story is so relatable.", likes: 12, bg: "bg-white" },
                         { user: "Maya", text: "Joining the Wellness Circle today!", likes: 45, bg: "bg-white" }
                       ].map((post, i) => (
                         <motion.div 
                            key={i} 
                            whileHover={{ x: 10 }}
                            className={`${post.bg} p-6 rounded-3xl shadow-md border border-pink-100`}
                         >
                           <div className="flex items-center gap-4 mb-4">
                              <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm" />
                              <div className="text-sm font-bold">{post.user}</div>
                           </div>
                           <div className="text-sm text-slate-600 mb-4 leading-relaxed">{post.text}</div>
                           <div className="flex items-center gap-2 text-xs font-bold text-pink-500 bg-pink-50 w-fit px-3 py-1 rounded-full">
                              <Heart size={12} className="fill-current" /> {post.likes}
                           </div>
                         </motion.div>
                       ))}
                    </div>
                  </div>
                </MockupPhone>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-1 lg:order-2"
              >
                <div className="w-20 h-20 rounded-[2rem] bg-pink-50 text-pink-500 flex items-center justify-center text-4xl mb-10 shadow-xl shadow-pink-900/5 border border-pink-100">
                  <Users size={32} />
                </div>
                <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-8 tracking-tighter leading-none">Peer <br /> Community</h2>
                <div className="w-20 h-1.5 bg-pink-400 rounded-full mb-10" />
                <p className="text-xl text-slate-500 mb-12 leading-relaxed font-medium max-w-xl">
                  Connect with girls who get it. A moderated environment designed for genuine friendship and mutual growth.
                </p>
                
                <div className="grid gap-8">
                  {[
                    { title: 'Interest-Based Groups', desc: 'Art, sport, coding, books, and wellness-focused circles.' },
                    { title: 'No DM Policy', desc: 'Fully moderated—no direct messaging for maximum safety.' },
                    { title: 'Positive Feedback', desc: 'Structured around achievement and growth, not comparison.' }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 items-start group">
                      <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 shrink-0 border border-pink-100 group-hover:bg-pink-500 group-hover:text-white transition-all duration-500">
                        <Users size={20} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">{item.title}</h4>
                        <p className="text-base text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Section 3.7 — Pillar 6: The Book */}
        <section className="py-40 bg-slate-900 relative overflow-hidden">
          {/* Background Graphics */}
          <div className="absolute inset-0 z-0">
             <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/20 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/3" />
             <div className="absolute bottom-0 left-0 w-1/2 h-full bg-accent/10 blur-[150px] rounded-full -translate-x-1/3 translate-y-1/3" />
          </div>

          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
            <div className="max-w-6xl mx-auto bg-white rounded-[5rem] p-16 md:p-32 text-center shadow-[0_50px_100px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden border border-white/10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-3 px-6 py-2 bg-primary/10 rounded-full mb-10">
                  <BookOpen size={20} className="text-primary" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">The Offline Companion</span>
                </div>
                <h2 className="text-5xl md:text-8xl font-bold text-slate-900 mb-8 tracking-tighter leading-none">Pillar 6: The Book</h2>
                <p className="text-xl md:text-3xl text-slate-400 mb-16 leading-relaxed font-medium max-w-4xl mx-auto">
                  A beautiful, honest, and expert-backed guide covering everything an adolescent girl deserves to understand.
                </p>
                <Link href="/the-book" className="px-16 py-8 bg-slate-900 text-white rounded-[2.5rem] font-bold text-2xl hover:bg-primary transition-all shadow-2xl active:scale-95 inline-flex items-center gap-4 group">
                  Explore The Book <ArrowRight size={28} className="transition-transform group-hover:translate-x-2" />
                </Link>
              </motion.div>
                   <FaqSection 
          title="Platform Details"
          items={ECOSYSTEM_FAQS}
          theme="light"
        />
       </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function MockupPhone({ children, color = "bg-slate-100" }: any) {
  return (
    <div className="relative mx-auto w-[320px] h-[640px] p-4 bg-slate-900 rounded-[3rem] shadow-2xl">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20" />
      <div className={`relative w-full h-full rounded-[2.2rem] overflow-hidden ${color} z-10`}>
        {children}
      </div>
    </div>
  );
}
