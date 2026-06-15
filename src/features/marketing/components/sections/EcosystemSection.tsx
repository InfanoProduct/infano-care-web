'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle, BookOpen, Star, Activity, Calendar, Heart, Shield, Brain, Users } from 'lucide-react';
import { SuperpowerCard } from '../cards/SuperpowerCard';

const SUPERPOWERS = [
  {
    title: "Story-Based Learning",
    desc: "Interactive journeys that teach essential life skills through engaging narratives.",
    image: "/S3Img1.png",
    link: "/ecosystem",
    features: [
      { icon: <PlayCircle size={14} />, label: "Video Lessons" },
      { icon: <BookOpen size={14} />, label: "Interactive" },
      { icon: <Star size={14} />, label: "Quests" },
      { icon: <Activity size={14} />, label: "Badges" },
    ]
  },
  {
    title: "AI Wellness & Cycle Tracker",
    desc: "AI-powered, stigma-free tracking that demystifies cycles with medical accuracy.",
    image: "/S3Img2.png",
    link: "/ecosystem",
    features: [
      { icon: <Calendar size={14} />, label: "Cycle Tracking" },
      { icon: <Heart size={14} />, label: "Insights" },
      { icon: <Shield size={14} />, label: "Private" },
      { icon: <Activity size={14} />, label: "Med-Backed" },
    ]
  },
  {
    title: "Mental Wellness",
    desc: "Safe tools for mood tracking, mindfulness, and professional mental health support.",
    image: "/S3Img3.png",
    link: "/ecosystem",
    features: [
      { icon: <Brain size={14} />, label: "Mood Tracking" },
      { icon: <Activity size={14} />, label: "Mindfulness" },
      { icon: <Heart size={14} />, label: "Safe Space" },
      { icon: <Shield size={14} />, label: "Expert Content" },
    ]
  },
  {
    title: "Gamified Education",
    desc: "Learning that feels like play, keeping girls engaged with rewards and challenges.",
    image: "/S3Img4.png",
    link: "/ecosystem",
    features: [
      { icon: <Activity size={14} />, label: "Streaks" },
      { icon: <Star size={14} />, label: "Rewards" },
      { icon: <Users size={14} />, label: "Challenges" },
      { icon: <PlayCircle size={14} />, label: "Leaderboards" },
    ]
  },
  {
    title: "Expert-Led Circles",
    desc: "Live and async sessions with qualified doctors, counsellors, and mentors.",
    image: "/S3Img5.png",
    link: "/ecosystem",
    features: [
      { icon: <Users size={14} />, label: "Mentors" },
      { icon: <Calendar size={14} />, label: "Live Q&A" },
      { icon: <Activity size={14} />, label: "Workshops" },
      { icon: <PlayCircle size={14} />, label: "Sessions" },
    ]
  },
  {
    title: "Peer Community",
    desc: "A secure space to make friends, share stories, and learn from each other.",
    image: "/S3Img6.png",
    link: "/ecosystem",
    features: [
      { icon: <Users size={14} />, label: "Safe Groups" },
      { icon: <Activity size={14} />, label: "Peer Support" },
      { icon: <Shield size={14} />, label: "Moderated" },
      { icon: <Heart size={14} />, label: "Friends" },
    ]
  }
];

export function EcosystemSection() {
  return (
    <section className="pt-8 pb-8 lg:pt-10 lg:pb-20 bg-white relative overflow-hidden">
      {/* Background Graphic Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] translate-y-1/3 -translate-x-1/4" />

        {/* Subtle decorative shapes */}
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-10 w-24 h-24 border border-primary/10 rounded-[30%_70%_70%_30%/30%_30%_70%_70%]"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-20 w-32 h-32 border border-accent/10 rounded-full"
        />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4 inline-block">The Infano Universe</span>
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6 tracking-tight text-slate-900">
              One ecosystem. <br />
              <span className="text-primary">Six superpowers</span> for your girl.
            </h2>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-16">
          {SUPERPOWERS.map((superpower, index) => (
            <SuperpowerCard
              key={index}
              {...superpower}
              index={index}
              priority={index < 3}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Link href="/ecosystem" className="btn-secondary group px-10 py-5 text-lg">
            Explore the Full Ecosystem <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
