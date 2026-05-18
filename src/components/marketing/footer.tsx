'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Camera, Video, Briefcase, ArrowRight, Shield, Heart, Star } from 'lucide-react';
import { InstagramIcon, LinkedinIcon, TwitterIcon, FacebookIcon } from '../icons';

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
    { name: 'For Girls', href: '/parents' },
  ],
  legal: [
    { name: 'Terms and Conditions', href: '/legal#terms' },
    { name: 'Privacy Policies', href: '/legal#privacy' },
    { name: 'Cancellations and Refund', href: '/legal#refund' },
    { name: 'Pricing Policy', href: '/legal#pricing' },
    { name: 'Shipping Policy', href: '/legal#shipping' },
  ],
  contact: [
    { name: 'Contact Us', href: '/contact' },
    { name: 'support@infano.care', href: 'mailto:support@infano.care' },
  ],
  social: [
    { name: 'Instagram', href: 'https://www.instagram.com/infano.care/' },
    { name: 'YouTube', href: 'https://www.youtube.com/channel/UCjJ06NX_nNaWoezl3-QeeLg' },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/company/infanocare/' },
    { name: 'WhatsApp Community', href: '#' },
  ],
};

const socialLinks = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/infano.care/',
    icon: <InstagramIcon size={20} />,
    color: 'hover:text-pink-500 hover:border-pink-500/20',
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/infanocare/',
    icon: <LinkedinIcon size={20} />,
    color: 'hover:text-blue-600 hover:border-blue-600/20',
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/channel/UCjJ06NX_nNaWoezl3-QeeLg',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </svg>
    ),
    color: 'hover:text-red-500 hover:border-red-500/20',
  },
  {
    name: 'WhatsApp',
    href: 'https://wa.me/message/INFANOCARE',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
      </svg>
    ),
    color: 'hover:text-green-500 hover:border-green-500/20',
  },
];

export function MarketingFooter() {
  const pathname = usePathname();
  return (
    <footer className="relative bg-[#FAF9FF] pt-20 pb-10 overflow-hidden">
      {/* Background Graphics */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[35%] h-[35%] bg-accent/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-primary/[0.03] select-none uppercase tracking-tighter">
          Infano
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        {/* Pre-footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#ff1f56] rounded-[3rem] p-8 md:p-16 mb-20 border border-white/10 backdrop-blur-sm flex flex-col lg:flex-row items-center justify-between gap-10 shadow-[0_40px_80px_-20px_rgba(255,31,86,0.4)]"
        >
          <div className="max-w-2xl text-center lg:text-left">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Build the skills to <span className="">bloom with confidence.</span>
            </h2>
            <p className="text-white/80 text-lg">
              Join 10,000+ girls and families on the journey to holistic wellness.
            </p>
          </div>
          <Link href="/contact" className=" bg-white text-pink-500 hover:text-pink-600 font-semibold item-center justify-center  flex flex-row px-10 py-5 rounded-full transition-all duration-300 group whitespace-nowrap ">
            Get Started Now <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={20} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-20">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="relative flex flex-col mb-8 w-48 md:w-56 lg:w-64 h-16 md:h-20 lg:h-24 group -ml-2">
              <Image 
                src="/logo/infano-logo-for-light-bg.png" 
                alt="Infano" 
                fill
                className="object-contain object-left"
              />
            </Link>
            <div className="flex items-center gap-2 mb-8 -mt-4">
              <div className="h-px w-8 bg-primary" />
              <span className="text-xs font-black text-primary uppercase tracking-[0.3em]">
                Growing Together
              </span>
            </div>
            <p className="text-base text-slate-600 mb-8 max-w-sm leading-relaxed font-medium">
              India's most holistic ecosystem for adolescent and young adult girls—blending story-led learning, wellness tracking, and expert guidance.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className={`w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 border border-slate-200 transition-all duration-300 ${social.color} hover:bg-slate-50 hover:border-primary/20 shadow-sm`}
                  aria-label={social.name}
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-slate-900 font-bold mb-6 uppercase tracking-widest text-xs">Platform</h4>
            <ul className="space-y-4">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  {pathname === link.href ? (
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center group w-full text-left"
                    >
                      <span className="h-1 w-0 bg-primary mr-0 group-hover:w-2 group-hover:mr-2 transition-all rounded-full" />
                      {link.name}
                    </button>
                  ) : (
                    <Link href={link.href} className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center group">
                      <span className="h-1 w-0 bg-primary mr-0 group-hover:w-2 group-hover:mr-2 transition-all rounded-full" />
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 font-bold mb-6 uppercase tracking-widest text-xs">Audiences</h4>
            <ul className="space-y-4">
              {footerLinks.audiences.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors flex items-center group">
                    <span className="h-1 w-0 bg-primary mr-0 group-hover:w-2 group-hover:mr-2 transition-all rounded-full" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 font-bold mb-6 uppercase tracking-widest text-xs">Contact</h4>
            <ul className="space-y-4">
              {footerLinks.contact.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors flex items-center group truncate">
                    <span className="h-1 w-0 bg-primary mr-0 group-hover:w-2 group-hover:mr-2 transition-all rounded-full" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 font-bold mb-6 uppercase tracking-widest text-xs">Legal</h4>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors flex items-center group">
                    <span className="h-1 w-0 bg-primary mr-0 group-hover:w-2 group-hover:mr-2 transition-all rounded-full" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <p className="text-sm text-slate-500 font-medium">
              &copy; {new Date().getFullYear()} BerryBird Technologies Private Limited. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-200">
                <Shield size={12} className="text-primary" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Safe Space</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-200">
                <Star size={12} className="text-yellow-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Expert Verified</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 max-w-2xl relative group overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Heart size={40} className="text-primary" />
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500 text-center lg:text-left font-medium relative z-10">
              <strong className="text-slate-900 uppercase tracking-widest text-[10px] mr-2">Disclaimer:</strong>
              Infano.care is a safe, moderated platform. All content is reviewed by qualified mental health and medical professionals.
              The platform is built to provide support and education, but is not a substitute for professional clinical advice.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
