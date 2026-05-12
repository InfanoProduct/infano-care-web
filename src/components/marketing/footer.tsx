'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Camera, Video, Briefcase, MessageCircle, ArrowRight, Shield, Heart, Star } from 'lucide-react';

const footerLinks = {
  platform: [
    { name: 'About Infano', href: '/about' },
    { name: 'The Ecosystem', href: '/ecosystem' },
    { name: 'The Book', href: '/the-book' },
    { name: 'The Circle', href: '/the-circle' },
    { name: 'Impact', href: '/impact' },
  ],
  audiences: [
    { name: 'For Schools', href: '/schools' },
    { name: 'For Parents', href: '/parents' },
    { name: 'For Girls', href: '/girls' },
  ],
  legal: [
    { name: 'Terms and Conditions', href: '/legal#terms' },
    { name: 'Privacy Policies', href: '/legal#privacy' },
    { name: 'Cancellations and Refund', href: '/legal#refund' },
    { name: 'Pricing Policy', href: '/legal#pricing' },
    { name: 'Shipping Policy', href: '/legal#shipping' },
    { name: 'Terms and Conditions', href: '/legal#terms' },
    { name: 'Privacy Policies', href: '/legal#privacy' },
    { name: 'Cancellations and Refund', href: '/legal#refund' },
    { name: 'Pricing Policy', href: '/legal#pricing' },
    { name: 'Shipping Policy', href: '/legal#shipping' },
  ],
  contact: [
    { name: 'Contact Us', href: '/contact' },
    { name: 'hello@infano.care', href: 'mailto:hello@infano.care' },
    { name: 'support@infano.care', href: 'mailto:support@infano.care' },
    { name: 'schools@infano.care', href: 'mailto:schools@infano.care' },
  ],
  social: [
    { name: 'Instagram', href: 'https://www.instagram.com/infano.care/' },
    { name: 'YouTube', href: 'https://www.youtube.com/channel/UCjJ06NX_nNaWoezl3-QeeLg' },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/company/infanocare/' },
    { name: 'Instagram', href: 'https://www.instagram.com/infano.care/' },
    { name: 'YouTube', href: 'https://www.youtube.com/channel/UCjJ06NX_nNaWoezl3-QeeLg' },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/company/infanocare/' },
    { name: 'WhatsApp Community', href: '#' },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="relative bg-[#020617] pt-20 pb-10 overflow-hidden">
      {/* Background Graphics */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[35%] h-[35%] bg-accent/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-white/[0.02] select-none uppercase tracking-tighter">
          Infano
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        {/* Pre-footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-[3rem] p-8 md:p-16 mb-20 border border-white/5 backdrop-blur-sm flex flex-col lg:flex-row items-center justify-between gap-10"
        >
          <div className="max-w-2xl text-center lg:text-left">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Build the skills to <span className="premium-gradient-text">bloom with confidence.</span>
            </h2>
            <p className="text-slate-400 text-lg">
              Join 10,000+ girls and families on the journey to holistic wellness.
            </p>
          </div>
          <Link href="/contact" className="btn-primary group whitespace-nowrap text-lg px-10 py-5">
            Get Started Now <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={20} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-20">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex flex-col mb-8">
              <span className="font-heading font-bold text-4xl tracking-tight text-white mb-2">
                Infano.care
              </span>
              <div className="flex items-center gap-2">
                <div className="h-px w-8 bg-primary-light" />
                <span className="text-xs font-black text-primary-light uppercase tracking-[0.3em]">
                  Growing Together
                </span>
              </div>
            </Link>
            <p className="text-base text-slate-400 mb-8 max-w-sm leading-relaxed font-medium">
              India's most holistic ecosystem for adolescent and young adult girls—blending story-led learning, wellness tracking, and expert guidance.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 border border-white/5 transition-all duration-300 ${social.color} hover:bg-white/10 hover:border-white/20`}
                  aria-label={social.name}
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Platform</h4>
            <ul className="space-y-4">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center group">
                    <span className="h-1 w-0 bg-primary mr-0 group-hover:w-2 group-hover:mr-2 transition-all rounded-full" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Audiences</h4>
            <ul className="space-y-4">
              {footerLinks.audiences.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center group">
                    <span className="h-1 w-0 bg-primary mr-0 group-hover:w-2 group-hover:mr-2 transition-all rounded-full" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Contact</h4>
            <ul className="space-y-4">
              {footerLinks.contact.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center group truncate">
                    <span className="h-1 w-0 bg-primary mr-0 group-hover:w-2 group-hover:mr-2 transition-all rounded-full" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Legal</h4>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    scroll={false}
                    className="text-sm hover:text-primary-light transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <p className="text-sm text-slate-500 font-medium">
              &copy; {new Date().getFullYear()} Infano.care. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                <Shield size={12} className="text-primary-light" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Safe Space</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                <Star size={12} className="text-yellow-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Expert Verified</span>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.02] backdrop-blur-md p-6 rounded-[2rem] border border-white/5 max-w-2xl relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Heart size={40} className="text-primary-light" />
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400 text-center lg:text-left font-medium relative z-10">
              <strong className="text-white uppercase tracking-widest text-[10px] mr-2">Disclaimer:</strong>
              Infano.care is a safe, moderated platform. All content is reviewed by qualified mental health and medical professionals.
              The platform is built to provide support and education, but is not a substitute for professional clinical advice.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
