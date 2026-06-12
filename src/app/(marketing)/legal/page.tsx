'use client';

import { useState, useEffect } from 'react';
import { Shield, Lock, AlertCircle, Scale, FileText, ChevronRight, ChevronDown, Truck, CreditCard, ArrowRight } from 'lucide-react';

const sections = [
  { 
    id: 'terms', 
    title: 'Terms and Conditions', 
    icon: Scale,
    subsections: [
      { id: 'agreement', title: 'Agreement to terms' },
      { id: 'usage', title: 'Use of platform and services' },
      { id: 'intellectual', title: 'Intellectual property' },
      { id: 'user-info', title: 'Treatment of user information' },
      { id: 'third-party', title: 'Third party content' },
      { id: 'infringement', title: 'Infringement' },
      { id: 'mobile', title: 'Relationship with operators' },
      { id: 'disclaimer', title: 'Disclaimer of warranties' },
    ]
  },
  { 
    id: 'privacy', 
    title: 'Privacy Policies', 
    icon: Lock,
    subsections: [
      { id: 'feel-secure', title: 'We want you to' },
      { id: 'info-collected', title: 'What info is collected?' },
      { id: 'who-collects', title: 'Who collects info?' },
      { id: 'how-used', title: 'How is info used?' },
      { id: 'sharing', title: 'With whom shared?' },
      { id: 'updates', title: 'Policy updates' },
    ]
  },
  { 
    id: 'refund', 
    title: 'Cancellations and Refund Policy', 
    icon: AlertCircle,
    subsections: [
      { id: 'refund-intro', title: 'Introduction' },
      { id: 'request-cancel', title: 'How to request' },
      { id: 'cancel-terms', title: 'Cancellations' },
      { id: 'disbursal', title: 'Refund Disbursal' },
      { id: 'refund-contact', title: 'Contact Us' },
    ]
  },
  { 
    id: 'pricing', 
    title: 'Pricing Policy', 
    icon: CreditCard,
    subsections: [
      { id: 'pricing-structure', title: 'Pricing Structure' },
      { id: 'sub-plans', title: 'Subscription Plans' },
      { id: 'one-time', title: 'One-Time Purchases' },
      { id: 'free-features', title: 'Free Features' },
      { id: 'payment-methods', title: 'Payment Methods' },
      { id: 'billing-renewal', title: 'Billing and Renewal' },
      { id: 'pricing-refunds', title: 'Refunds and Cancellations' },
      { id: 'taxes-fees', title: 'Taxes and Fees' },
      { id: 'price-changes', title: 'Price Changes' },
      { id: 'pricing-contact', title: 'Contact Information' },
    ]
  },
  { 
    id: 'shipping', 
    title: 'Shipping Policy', 
    icon: Truck,
    subsections: [
      { id: 'order-processing', title: 'Order Processing' },
      { id: 'delivery-time', title: 'Shipping & Delivery Time' },
      { id: 'shipping-charges', title: 'Shipping Charges' },
      { id: 'tracking-order', title: 'Tracking Your Order' },
      { id: 'address-accuracy', title: 'Address Accuracy' },
      { id: 'international-shipping', title: 'International Shipping' },
      { id: 'damaged-lost', title: 'Damaged or Lost Packages' },
      { id: 'order-change', title: 'Change or Cancellation' },
      { id: 'shipping-support', title: 'Customer Support' },
    ]
  },
];

export default function LegalPage() {
  const [activeSection, setActiveSection] = useState('');
  const [activeSubSection, setActiveSubSection] = useState('');

  // Effect 1: Handle URL hash changes and initial load
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      
      // Default to terms if no hash
      if (!hash) {
        setActiveSection('terms');
        setActiveSubSection('agreement');
        return;
      }

      // Check if it's a main section
      const section = sections.find(s => s.id === hash);
      if (section) {
        setActiveSection(hash);
        if (section.subsections && section.subsections.length > 0) {
          setActiveSubSection(section.subsections[0].id);
        } else {
          setActiveSubSection('');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Check if it's a subsection across all sections
      for (const s of sections) {
        const sub = s.subsections?.find(sub => sub.id === hash);
        if (sub) {
          setActiveSection(s.id);
          setActiveSubSection(hash);
          setTimeout(() => {
            const element = document.getElementById(hash);
            if (element) {
              const top = element.getBoundingClientRect().top + window.pageYOffset - 120;
              window.scrollTo({ top, behavior: 'smooth' });
            }
          }, 400);
          return;
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    
    // Check again after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(handleHash, 200);
    
    return () => {
      window.removeEventListener('hashchange', handleHash);
      clearTimeout(timeoutId);
    };
  }, []);

  // Effect 2: Handle Scroll Spy for the active section
  useEffect(() => {
    if (!activeSection) return;

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0) {
          const id = entry.target.id;
          
          for (const section of sections) {
            const sub = section.subsections?.find(s => s.id === id);
            if (sub) {
              setActiveSubSection(prev => {
                if (prev !== id) return id;
                return prev;
              });
              return;
            }
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const targets = document.querySelectorAll('section[id]');
    targets.forEach(target => observer.observe(target));

    return () => observer.disconnect();
  }, [activeSection]);

  const scrollToSection = (id: string, subId?: string) => {
    if (!subId && activeSection === id) {
      setActiveSection('');
      return;
    }
    setActiveSection(id);
    if (subId) {
      setActiveSubSection(subId);
      setTimeout(() => {
        const element = document.getElementById(subId);
        if (element) {
          const top = element.getBoundingClientRect().top + window.pageYOffset - 120;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-32 pb-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Navigation */}
          <aside className="lg:w-96 shrink-0">
            <div className="sticky top-28 space-y-6">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-4">Policy Hub</p>
                <div className="space-y-3">
                  {sections.map((section) => (
                    <div key={section.id} className="relative">
                      <button
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-500 group ${
                          activeSection === section.id
                            ? 'bg-primary text-white shadow-2xl shadow-primary/30 ring-4 ring-primary/10 scale-[1.02]'
                            : 'hover:bg-white text-slate-600 hover:text-primary shadow-sm hover:shadow-xl hover:translate-x-1'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-xl transition-colors duration-300 ${
                            activeSection === section.id ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-primary/10'
                          }`}>
                            <section.icon size={20} className={activeSection === section.id ? 'text-white' : 'text-slate-400 group-hover:text-primary'} />
                          </div>
                          <span className="font-bold text-sm tracking-tight">{section.title}</span>
                        </div>
                        {section.subsections && (
                          <div className={`transition-all duration-300 ${activeSection === section.id ? 'opacity-100 text-white' : 'opacity-40 group-hover:opacity-100'}`}>
                            {activeSection === section.id ? (
                              <ChevronDown size={18} />
                            ) : (
                              <ChevronRight size={18} />
                            )}
                          </div>
                        )}
                      </button>
                      
                      {/* Subsections list in sidebar */}
                      {activeSection === section.id && section.subsections && (
                        <div className="mt-4 ml-6 pl-6 border-l-2 border-primary/20 space-y-2 animate-in slide-in-from-top-4 duration-500">
                          {section.subsections.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => scrollToSection(section.id, sub.id)}
                              className={`w-full text-left px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 relative group/sub ${
                                activeSubSection === sub.id
                                  ? 'text-primary bg-primary/5 shadow-inner'
                                  : 'text-slate-500 hover:text-primary hover:bg-white hover:shadow-sm'
                              }`}
                            >
                              {activeSubSection === sub.id && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full -ml-4 shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                              )}
                              <span className="relative z-10">{sub.title}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Contact Card */}
              <div className="bg-primary/5 border border-primary/10 p-6 rounded-3xl shadow-sm overflow-hidden relative group">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-700" />
                <h4 className="font-bold text-slate-800 mb-2 relative z-10">Need Help?</h4>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed relative z-10">Our legal team is here to clarify any questions you might have.</p>
                <a href="mailto:infano.care@gmail.com" className="group/btn block w-full py-3 bg-primary text-white rounded-xl text-center text-xs font-bold transition-all hover:bg-primary-dark shadow-sm hover:shadow-lg hover:-translate-y-0.5 relative z-10">
                  <div className="flex items-center justify-center gap-2">
                    <span>Email Us</span>
                    <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                  </div>
                </a>
              </div>
            </div>
          </aside>

          {/* Content Area */}
          <div className="flex-1 max-w-4xl">
            <div className="glass-card min-h-[600px] p-8 md:p-16 rounded-[2.5rem] border-white/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] bg-white/70 backdrop-blur-xl relative overflow-hidden">
              {/* Decorative Background Element */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              
              {!activeSection ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-in fade-in zoom-in duration-500">
                  <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-300 mb-8">
                    <FileText size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">Select a Policy</h3>
                  <p className="text-slate-500 max-w-xs">Please select a section from the sidebar to view our detailed policies and terms.</p>
                </div>
              ) : (
                <div className="relative z-10">
                  {/* Top Meta Info */}
                  <div className="flex items-center justify-between mb-12 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/5 rounded-full border border-primary/10">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">Official Policy</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400">Last Updated: May 2024</span>
                  </div>

                  {/* Terms and Conditions Content */}
                  {activeSection === 'terms' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                      <section id="agreement" className="scroll-mt-32 group/section">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 group-hover/section:scale-110 transition-transform duration-500">
                            <Scale size={24} />
                          </div>
                          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Terms & <span className="text-primary">Conditions</span></h2>
                        </div>
                        
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Agreement to terms
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-lg">
                            <p>
                              All references to "you" or "your", as applicable, means the person that accesses, uses, and/or participates in the Infano Platform (as defined below) in any manner ("Users"). If you use the Infano Platform on behalf of an entity, you represent and warrant that you have the authority to bind that entity. Your acceptance of the Terms and Conditions will be deemed an acceptance by the entity you represent and "you" and "your" herein shall refer to such entity.
                            </p>
                            <p>
                              These Terms and Conditions (the "Terms and Conditions”, “Terms”) govern your use of our application infano.care (the "Website") and any assignees and permitted licenses thereof. The Website and the App are jointly referred to as the "Infano Platform". The Infano Platform is currently owned and operated by Berrybird Technologies Private Limited ("Berrybird Technologies"), a company incorporated under the Companies Act, 2013 and having its registered office at BERRYBIRD TECHNOLOGIES PRIVATE LIMITED, S Y. NO.210 KUDLUBUILDERS PVT LTD, E BLOCK, PLOT NO 005, Bangalore, Karnataka 560100, India.
                            </p>
                            <p className="bg-slate-50 p-6 rounded-2xl border-l-4 border-primary text-slate-700 italic">
                              "We", "us", and "our" herein shall refer to Berrybird Technologies and our associates/partners/successors/permitted assigns. Please read these Terms and Conditions thoroughly and carefully before you use the Infano Platform as they contain provisions that define your limits, legal rights, and obligations with respect to your participation.
                            </p>
                            <p>
                              These Terms and Conditions constitute a legally binding agreement between Berrybird Technologies and you. By installing, downloading, or even merely using the Infano Platform, you shall be contracting with Berrybird Technologies and you signify your acceptance to the Terms and other Berrybird Technologies policies (including but not limited to the Privacy Policy) as posted on the Infano Platform from time to time.
                            </p>
                            <p>
                              Berrybird Technologies reserves the right to modify these terms from time to time at our sole discretion and without any notice. Changes to our Terms and Conditions become effective on the date they are posted and your continued use of the Infano platform after any changes to Terms will signify your agreement to be bound by them.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="usage" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Use of platform and services
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
                            <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              Membership Eligibility Criteria
                            </h4>
                            <p>
                              You need not register with Berrybird Technologies to simply visit and view the Infano Platform, but to access and participate in certain features of the Infano Platform, you will need to create a password-protected account ("Account"). To create an Account, you must submit your name, mobile number, and/or email address through the Registration page/screen on the Infano Platform and create a password.
                            </p>
                            <p>
                              We reserve the right to suspend or terminate your Account and your access to the Services if any User Content provided during the registration process or thereafter proves to be inaccurate, not current, or incomplete; if it is believed that your actions may cause legal liability for you, other Users or us; and/or if you are found to be non-compliant with these Terms and Conditions.
                            </p>

                            <h4 className="text-lg font-bold text-slate-800 mt-12 mb-4 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              Use of the Platform
                            </h4>
                            <p>You agree and undertake that you shall not host, post, upload, display, modify, publish, transmit, update or share any information content/material that:</p>
                            <ul className="space-y-2">
                              <li>Belongs to another person and to which you don't have any right to; copyrighted content owned by a third party unless you have express consent.</li>
                              <li>Violates/infringes any patent, trademark, trade secret, copyright, or any other proprietary or privacy rights of any third party.</li>
                              <li>Is obscene, pornographic, vulgar, provocative, defamatory, indecent, libelous, hateful, or racially, ethnically objectionable, disparaging, threatening, or impersonating another person.</li>
                              <li>Promotes or provides any instructional information about illegal activities.</li>
                              <li>Contains software viruses or any other computer codes, files or programs that would interrupt, destroy or limit functionality.</li>
                              <li>Threatens the unity, integrity, defense, security, or sovereignty of India, friendly relations with foreign states, or public order.</li>
                            </ul>

                            <h4 className="text-lg font-bold text-slate-800 mt-12 mb-4 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              Submission of content
                            </h4>
                            <p>
                              When you submit content to the Infano platform, you simultaneously grant us an irrevocable, worldwide, royalty-free license to publish, display, modify, distribute and syndicate your content worldwide. You confirm and warrant that you have the required authority to grant the above license to us.
                            </p>
                            <p>
                              All remarks, suggestions, comments, or other information that you send to the Infano Platform will not be treated as confidential. However, we retain the right, which we may or may not exercise, in our sole discretion, to review, edit or delete from the Infano Platform any such material which we deem to be illegal, offensive, or otherwise inappropriate.
                            </p>

                            <h4 className="text-lg font-bold text-slate-800 mt-12 mb-4 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              Discretion
                            </h4>
                            <p>
                              It is possible that other Users (including unauthorized Users or 'hackers') may post or transmit offensive or obscene materials on the Infano Platform and that you may be involuntarily exposed to such materials. We do not approve of such unauthorized uses, but by using the Infano Platform, you acknowledge and agree that we are not responsible for the use of any personal information that you publicly disclose or share with others on the Infano Platform.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="intellectual" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Intellectual property
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
                            <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              Copyright
                            </h4>
                            <p>
                              The content, organization, graphics, design, compilation, magnetic translation, digital conversion and other matters related to the Infano Platform are protected under applicable copyrights, trademarks and other proprietary rights. You may not copy, reproduce, republish, upload, post, transmit or distribute materials on the Infano Platform in any way.
                            </p>

                            <h4 className="text-lg font-bold text-slate-800 mt-12 mb-4 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              Limited Right to Use
                            </h4>
                            <p>
                              The viewing, printing or downloading of any content, graphic, form or document from the Infano Platform grants you only a limited, nonexclusive license for use solely by you for your own personal use and not for republication, distribution, assignment, sublicense, sale, or other use.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="user-info" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Treatment of user information
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed">
                            <p>User information submitted on the Infano Platform is processed in accordance with our Privacy Policy.</p>
                            <p>
                              Berrybird Technologies reserves the right to release current or past User information that Berrybird Technologies believes is in violation of the Terms and Conditions or used to commit unlawful acts, or if the information is subpoenaed, or a request is received from the law enforcement agencies.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="third-party" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Third party content
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed">
                            <p>
                              Some content on the Infano Platform may be generated by our own team and from our contributors, while other content may be sourced from reliable sources which are duly acknowledged or otherwise permitted under licence.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="infringement" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Infringement
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed">
                            <p>
                              If you believe that any copyrighted work has been copied and is accessible on the Infano platform in a way that constitutes copyright infringement, please send us a detailed mail with all relevant information, evidence and your contact information to <span className="text-primary font-bold">infano.care@gmail.com</span>.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="mobile" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Relationship with operators
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
                            <p>
                              In the event the Infano Platform is accessed on a mobile device, it is not associated, affiliated, sponsored, endorsed or in any way linked to any operator, including Apple, Google, Android (each being an "Operator").
                            </p>
                            <ul className="space-y-2">
                              <li>The license granted to you for the Infano Platform is limited to a non-transferable license to use the Infano Platform on a mobile device that you own or control.</li>
                              <li>We are solely responsible for providing any maintenance and support services with respect to the Infano Platform as required under applicable law.</li>
                              <li>Operators have no obligation whatsoever to furnish any maintenance and support services.</li>
                              <li>You and we acknowledge that we, not the relevant Operator, are responsible for addressing any claims related to the Infano Platform.</li>
                            </ul>
                          </div>
                        </div>
                      </section>

                      <section id="disclaimer" className="scroll-mt-32 pt-8 border-t border-slate-100 pb-12">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Disclaimer & Liability
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
                            <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              Warranties
                            </h4>
                            <p>
                              The Infano Platform aims to project accurate, reliable information at all times. However, we do not guarantee that access to the Infano Platform will be uninterrupted, timely, error free, or free of viruses. We reserve the right to suspend or withdraw access to the Infano Platform to you personally, or to all Users temporarily or permanently at any time without notice.
                            </p>

                            <h4 className="text-lg font-bold text-slate-800 mt-12 mb-4 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              Liability
                            </h4>
                            <p>
                              In no case shall Berrybird Technologies, our directors, officers, employees, or affiliates be liable for any injury, loss, claim, or any direct, indirect, incidental, punitive, special, or consequential damages of any kind, including lost profits, revenue, or data, arising from your use of any of the service or any products procured using the service.
                            </p>

                            <h4 className="text-lg font-bold text-slate-800 mt-12 mb-4 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              Indemnification
                            </h4>
                            <p>
                              You agree to indemnify, defend and hold harmless Berrybird Technologies and our parent, subsidiaries, affiliates, partners, officers, directors, agents, contractors, licensors, service providers, subcontractors, suppliers, interns and employees, harmless from any claim or demand, including reasonable attorneys’ fees, made by any third-party due to or arising out of your breach of these Terms and Conditions or the documents they incorporate by reference, or your violation of any law or the rights of a third-party.
                            </p>

                            <h4 className="text-lg font-bold text-slate-800 mt-12 mb-4 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              Severability
                            </h4>
                            <p>
                              In the event that any provision of these Terms and Conditions is determined to be unlawful, void or unenforceable, such provision shall nonetheless be enforceable to the fullest extent permitted by applicable law, and the unenforceable portion shall be deemed to be severed from these Terms and Conditions, such determination shall not affect the validity and enforceability of any other remaining provisions.
                            </p>

                            <h4 className="text-lg font-bold text-slate-800 mt-12 mb-4 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              Assignment
                            </h4>
                            <p>
                              Berrybird Technologies may, at its sole discretion, at any time, assign or transfer or sub contract or purport to assign or transfer or subcontract its obligations under these Terms and Conditions to any other person or entity. However, you shall not assign or transfer or sub contract or purport to assign or transfer or subcontract your obligations under these Terms and Conditions to any other entity or person.
                            </p>

                            <div className="mt-12 bg-primary/5 border border-primary/20 p-6 rounded-2xl shadow-sm">
                              <p className="text-sm font-bold text-primary mb-2 uppercase tracking-wide">Governing law and dispute resolution</p>
                              <p className="text-sm text-slate-600 leading-relaxed">
                                These Terms and Conditions are governed by the laws of India. Any action, suit, or other legal proceeding, which is commenced to resolve any matter arising under or relating to the Infano Platform or these Terms and Conditions, shall be subject to the jurisdiction of the courts at Bangalore, India. Questions and Concerns about the Terms and Conditions should be sent to us at <span className="text-primary font-bold underline">infano.care@gmail.com</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  )}

                  {/* Privacy Policies Content */}
                  {activeSection === 'privacy' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                      <section id="privacy-header" className="group/section">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 group-hover/section:scale-110 transition-transform duration-500">
                            <Lock size={24} />
                          </div>
                          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Privacy <span className="text-primary">Policies</span></h2>
                        </div>
                        
                        <div className="pl-0 md:pl-16">
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-lg">
                            <p className="font-medium text-slate-800 italic border-l-4 border-primary pl-6 py-2 bg-primary/5 rounded-r-2xl">
                              Berrybird Technologies Private Limited and our associates ("Berrybird Technologies", "we", "us" and "our") respect your privacy and are fully committed to protecting it.
                            </p>
                            <p className="mt-6">
                              This Privacy Policy outlines our practices for collecting, using, maintaining, protecting and disclosing your information. By accessing the services provided by the Infano Platform, you agree to the collection and use of your data in the manner provided in this policy.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="feel-secure" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            We want you to
                          </h3>
                          <div className="prose prose-slate max-w-none">
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none pl-0">
                              <li className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">✓</div>
                                <span>Feel comfortable using the Infano Platform</span>
                              </li>
                              <li className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">✓</div>
                                <span>Feel secure submitting information to us</span>
                              </li>
                              <li className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">✓</div>
                                <span>Contact us with your questions or concerns about privacy</span>
                              </li>
                              <li className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">✓</div>
                                <span>Know that using our sites means consenting to data collection</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </section>

                      <section id="info-collected" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            What information is collected?
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
                            <p>We will automatically receive and collect certain anonymous information in standard usage logs through our Web server, including:</p>
                            <ul>
                              <li>Webserver cookie stored on your hard drive</li>
                              <li>An IP address, assigned to the computer which you use</li>
                              <li>The domain server through which you access our service</li>
                              <li>The type of computer and web browser you're using</li>
                            </ul>
                            <p>We may collect the following personally identifiable information about you:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                              <ul>
                                <li>First and last name</li>
                                <li>Email address</li>
                                <li>Mobile phone number</li>
                              </ul>
                              <ul>
                                <li>Demographic profile (age, gender, address)</li>
                                <li>Financial information (for transactions)</li>
                                <li>Opinions of features on our websites</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section id="who-collects" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Who collects the information?
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed">
                            <p>We collect anonymous traffic information when you use the Platform. Personally identifiable information is collected when you register with us.</p>
                            <p>If you purchase a product or service, we request contact information (name, email, shipping address) and financial information (credit card details) for billing purposes and to fill your orders.</p>
                            <p>Please note that any information disclosed in areas like "Ask an Expert" or "Community" becomes public information. We are not responsible for the personally identifiable information you choose to submit in these forums.</p>
                          </div>
                        </div>
                      </section>

                      <section id="how-used" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            How is the information used?
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
                            <p>We use your personal information to:</p>
                            <ul>
                              <li>Provide personalized features and tailor the Platform to your interests</li>
                              <li>Get in touch with you for password retrieval and policy changes</li>
                              <li>Provide the services requested by you and process your orders</li>
                              <li>Send you special offers, newsletters, and invites to upcoming events</li>
                            </ul>
                            <p>Anonymous traffic information is used to diagnose server problems, administer the Platform, and track sessions to understand how people use our sites.</p>
                          </div>
                        </div>
                      </section>

                      <section id="sharing" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            With whom shared?
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed">
                            <p>We <span className="font-bold underline decoration-primary">do not share or rent</span> your email addresses or any of your personal information to any other person or organization for any purpose.</p>
                            <p>We reserve the right to disclose your personally identifiable information as required by law and when we believe that disclosure is necessary to protect our rights and/or comply with a judicial proceeding or legal process.</p>
                            <p>We follow generally accepted industry standards to protect the personal information submitted to us. However, no method of transmission over the Internet or electronic storage is 100% secure.</p>
                          </div>
                        </div>
                      </section>

                      <section id="updates" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Policy updates
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed">
                            <p>We reserve the right to change or update this policy at any time without prior notice. Such changes shall be effective immediately upon posting to this site.</p>
                            <div className="mt-12 bg-primary/5 border border-primary/20 p-8 rounded-2xl shadow-sm">
                              <p className="text-sm font-bold mb-2 text-primary uppercase tracking-widest">Contact Us</p>
                              <p className="text-xl font-bold mb-4 text-slate-800">Questions or Concerns?</p>
                              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                                If you have any questions about this Privacy Policy, please send us a detailed mail.
                              </p>
                              <a href="mailto:infano.care@gmail.com" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all hover:shadow-lg hover:-translate-y-0.5">
                                infano.care@gmail.com
                              </a>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  )}

                  {/* Cancellations and Refund Policy */}
                  {activeSection === 'refund' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                      <section id="refund-header" className="group/section">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 group-hover/section:scale-110 transition-transform duration-500">
                            <AlertCircle size={24} />
                          </div>
                          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Refund <span className="text-primary">Policy</span></h2>
                        </div>
                      </section>

                      <section id="refund-intro" className="scroll-mt-32">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Introduction
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-lg">
                            <p>
                              Thank you for choosing Infano (“Berrybird Technologies, we, us, our”). Our platform infano.care (the “Website”) referred to as the “Infano Platform”. Please read this Cancellations and Refund Policy (“Agreement”) prior to making any transactions on the Infano Platform.
                            </p>
                            <p>
                              This Agreement contains the terms regarding how we issue refunds to the Learners (“you, your”). All the live online classes, webinar, master classes or courses are considered (“Order”) hereafter in this agreement. This Agreement is hereby through this reference construed as part of our Terms and Conditions.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="request-cancel" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            How to request cancellations
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed">
                            <p>
                              You may cancel and place a request for a refund for your Order created through the Infano Platform by sending an email to <a href="mailto:assist.infanocare@gmail.com" className="text-primary font-bold">assist.infanocare@gmail.com</a> from the registered email address used when booking the Order.
                            </p>
                            <p className="font-medium text-slate-800 italic border-l-4 border-primary pl-6 py-2 bg-primary/5 rounded-r-2xl">
                              The decision of Infano with respect to refunds shall be considered as final.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="cancel-terms" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Cancellations
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
                            <p>For the purpose of this Agreement, “Learning Period” means the duration for which services are to be provided by the Instructors to Learners.</p>
                            <ul>
                              <li>Learners may cancel the Order for a refund solely if cancellations are requested before attending the regular class or watching permitted free recording of any course (“Cancellation Period”).</li>
                              <li>After the expiration of the Cancellation Period, we will not provide any refunds under any circumstances.</li>
                              <li>Notwithstanding anything in this Agreement, we do not provide any refund for webinar or masterclasses offered on our platform.</li>
                              <li>All the services provided to the learner shall be cancelled after the refund including but not limited to website account and user credentials.</li>
                            </ul>
                          </div>
                        </div>
                      </section>

                      <section id="disbursal" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Refund Disbursal
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed">
                            <p>
                              If you are determined to be eligible for a refund by Infano, we will disburse the applicable refund amount to your original payment method used to make your purchase as soon as we can but not less than <span className="font-bold">7 to 14 days</span> (subject to your appropriate payment method issuer policy) of receipt of your refund request.
                            </p>
                            <p>
                              Transaction charges deducted by your card issuer or the payment processor are non-refundable. However, there may be factors beyond our control which may cause delays with respect to your entitled refund, and with this regard we disclaim all liabilities.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="refund-contact" className="scroll-mt-32 pt-8 border-t border-slate-100 pb-12">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Contact Us
                          </h3>
                          <div className="prose prose-slate max-w-none">
                            <div className="bg-primary/5 border border-primary/20 p-8 rounded-2xl shadow-sm">
                              <p className="text-sm font-bold mb-2 text-primary uppercase tracking-widest">Support</p>
                              <p className="text-xl font-bold mb-4 text-slate-800">Need Help with a Refund?</p>
                              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                                Questions and Concerns about this Cancellations and Refund Policy should be sent to us.
                              </p>
                              <a href="mailto:infano.care@gmail.com" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all hover:shadow-lg hover:-translate-y-0.5">
                                infano.care@gmail.com
                              </a>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  )}

                  {/* Pricing Policy Content */}
                  {activeSection === 'pricing' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                      <section id="pricing-header" className="group/section">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 group-hover/section:scale-110 transition-transform duration-500">
                            <CreditCard size={24} />
                          </div>
                          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Pricing <span className="text-primary">Policy</span></h2>
                        </div>
                      </section>

                      <section id="pricing-structure" className="scroll-mt-32">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Pricing Structure
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-lg">
                            <p>
                              Welcome to Infano.care! Our Pricing Policy outlines the pricing structure and terms for accessing premium features, services, and products offered on our platform.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="sub-plans" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Subscription Plans
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed">
                            <p>
                              Our subscription plans provide access to premium features and content on a recurring basis. Subscription fees are billed at regular intervals (e.g., monthly, annually) and may vary based on the plan selected.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="one-time" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            One-Time Purchases
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed">
                            <p>
                              Some features or products on our platform may be available for purchase as one-time transactions. The pricing for one-time purchases is determined based on the specific product or service offered.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="free-features" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Free Features
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed">
                            <p>
                              We also offer certain features and content on our platform free of charge. These free features may be subject to limitations or restrictions as outlined in our Terms and Conditions.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="payment-methods" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Payment Methods
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed">
                            <p>
                              We accept various payment methods, including credit/debit cards, electronic funds transfer (EFT), and other online payment services. Payment processing is facilitated through secure third-party payment processors.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="billing-renewal" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Billing and Renewal
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed">
                            <p>
                              Subscription fees are billed automatically at the beginning of each billing cycle unless canceled or modified by the user. Users may manage their subscription preferences and billing details through their account settings.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="pricing-refunds" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Refunds and Cancellations
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed">
                            <p>
                              Refunds may be available for certain subscription plans or one-time purchases in accordance with our <a href="/legal#refund" className="text-primary font-bold">Refund Policy</a>. Users may cancel their subscription at any time, but refunds may be subject to applicable terms and conditions.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="taxes-fees" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Taxes and Fees
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed">
                            <p>
                              Prices displayed on our platform may be exclusive of taxes, fees, or other charges imposed by governmental authorities. Users are responsible for paying any applicable taxes or fees associated with their purchases.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="price-changes" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Price Changes
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed">
                            <p>
                              Infano.care reserves the right to modify or update pricing for its products and services at any time without prior notice. Any changes to pricing will be communicated to users in advance.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="pricing-contact" className="scroll-mt-32 pt-8 border-t border-slate-100 pb-12">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Contact Information
                          </h3>
                          <div className="prose prose-slate max-w-none">
                            <div className="bg-primary/5 border border-primary/20 p-8 rounded-2xl shadow-sm">
                              <p className="text-sm font-bold mb-2 text-primary uppercase tracking-widest">Billing Support</p>
                              <p className="text-xl font-bold mb-4 text-slate-800">Questions about Pricing?</p>
                              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                                If you have any questions or concerns about our Pricing Policy, please contact us.
                              </p>
                              <a href="mailto:infano.care@gmail.com" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all hover:shadow-lg hover:-translate-y-0.5">
                                infano.care@gmail.com
                              </a>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  )}

                  {/* Shipping Policy Content */}
                  {activeSection === 'shipping' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                      <section id="shipping-header" className="group/section">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 group-hover/section:scale-110 transition-transform duration-500">
                            <Truck size={24} />
                          </div>
                          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Shipping <span className="text-primary">Policy</span></h2>
                        </div>
                      </section>

                      <section id="order-processing" className="scroll-mt-32">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Order Processing
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-lg">
                            <p>
                              All confirmed book or merchandise orders placed through Infano.Care are processed within <span className="font-bold">2–3 business days</span> (excluding weekends and public holidays). Once your order is confirmed, you will receive an acknowledgment email or SMS with your order details.
                            </p>
                            <p>
                              If we experience a high volume of orders, or if any item is out of stock, we will notify you promptly via email or phone.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="delivery-time" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Shipping & Delivery Time
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
                            <p>We partner with trusted delivery services such as India Post, DTDC, and Blue Dart to ensure safe and timely delivery.</p>
                            <ul className="space-y-2">
                              <li><strong>Standard Shipping (Pan India):</strong> 5–7 business days</li>
                              <li><strong>Express Shipping (where available):</strong> 2–3 business days</li>
                              <li><strong>eBook Orders:</strong> Instant download link will be sent to your registered email address after successful payment.</li>
                            </ul>
                            <p className="text-sm italic text-slate-500 mt-4">
                              Delivery timelines may vary for remote areas or unforeseen circumstances like weather disruptions or courier delays.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="shipping-charges" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Shipping Charges
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
                            <ul className="space-y-3">
                              <li><strong>Orders above ₹999:</strong> Free Shipping</li>
                              <li><strong>Orders below ₹999:</strong> A nominal shipping fee (₹50–₹100) will apply based on your location.</li>
                            </ul>
                            <p className="mt-4 text-sm font-medium text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
                              Any applicable shipping charges will be shown at checkout before you make the payment.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="tracking-order" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Tracking Your Order
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed">
                            <p>
                              Once your order has been shipped, you will receive a tracking ID and courier partner details via email or SMS. You can track the shipment status using the courier’s official website or by contacting our support team at <span className="font-bold text-primary underline">connect@infano.care</span>.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="address-accuracy" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Address Accuracy
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed">
                            <p>
                              Please ensure that your delivery address, contact number, and pin code are correct. <span className="font-bold">Infano.Care</span> will not be responsible for failed deliveries caused by incorrect or incomplete addresses provided by the customer.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="international-shipping" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            International Shipping
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed">
                            <p>
                              Currently, we only ship within India. International orders may be supported in the future, and updates will be reflected on our website.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="damaged-lost" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Damaged or Lost Packages
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
                            <p>If you receive a damaged package or if your shipment is lost in transit:</p>
                            <ul className="space-y-2 mt-4">
                              <li>Report it to <span className="font-bold text-primary">connect@infano.care</span> within 48 hours of delivery (or expected delivery date).</li>
                              <li>Provide photos (in case of damage) and order details for quick resolution.</li>
                              <li>We will coordinate with our courier partners and provide a replacement or refund as per our Refund & Cancellation Policy.</li>
                            </ul>
                          </div>
                        </div>
                      </section>

                      <section id="order-change" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Change or Cancellation
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed">
                            <p>
                              Once the order has been shipped, cancellation or change of address will not be possible. If the order has not yet been shipped, please contact our support team immediately with your Order ID.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="shipping-support" className="scroll-mt-32 pt-8 border-t border-slate-100 pb-12">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Customer Support
                          </h3>
                          <div className="prose prose-slate max-w-none">
                            <div className="bg-primary/5 border border-primary/20 p-8 rounded-2xl shadow-sm">
                              <p className="text-sm font-bold mb-2 text-primary uppercase tracking-widest">Order Help</p>
                              <p className="text-xl font-bold mb-4 text-slate-800">Shipping or Order Query?</p>
                              <div className="space-y-4 mb-6">
                                <p className="flex items-center gap-3">
                                  <span className="text-xl">📧</span>
                                  <span className="font-bold text-primary">connect@infano.care</span>
                                </p>
                                <p className="flex items-center gap-3 text-slate-500">
                                  <span className="text-xl">🕐</span>
                                  <span>Monday–Friday, 10:00 AM – 6:00 PM</span>
                                </p>
                              </div>
                              <p className="text-xs text-slate-400 italic">
                                Reach out to us for any shipping-related concerns.
                              </p>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
