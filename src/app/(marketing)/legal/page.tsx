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
      { id: 'return-policy', title: 'Physical Products' },
      { id: 'cancel-terms', title: 'Digital & Programs' },
      { id: 'refund-timeline', title: 'Refund Timelines (5-7 Days)' },
      { id: 'refund-contact', title: 'Support & Queries' },
    ]
  },
  { 
    id: 'pricing', 
    title: 'Pricing Policy', 
    icon: CreditCard,
    subsections: [
      { id: 'pricing-structure', title: 'Multi-Currency Structure' },
      { id: 'payment-methods', title: 'Payment Methods & Security' },
      { id: 'taxes-fees', title: 'Taxes & Shipping Fees' },
      { id: 'price-changes', title: 'Price Adjustments' },
      { id: 'pricing-contact', title: 'Billing Support' },
    ]
  },
  { 
    id: 'shipping', 
    title: 'Shipping Policy', 
    icon: Truck,
    subsections: [
      { id: 'order-processing', title: 'Processing & Dispatch' },
      { id: 'delivery-time', title: 'Domestic & International Delivery' },
      { id: 'shipping-charges', title: 'Shipping Fees' },
      { id: 'tracking-order', title: 'Shipment Tracking' },
      { id: 'shipping-support', title: 'Shipping Support' },
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
                <a href="mailto:connect@infano.care" className="group/btn block w-full py-3 bg-primary text-white rounded-xl text-center text-xs font-bold transition-all hover:bg-primary-dark shadow-sm hover:shadow-lg hover:-translate-y-0.5 relative z-10">
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
                              If you believe that any copyrighted work has been copied and is accessible on the Infano platform in a way that constitutes copyright infringement, please send us a detailed mail with all relevant information, evidence and your contact information to <span className="text-primary font-bold">connect@infano.care</span>.
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
                                These Terms and Conditions are governed by the laws of India. Any action, suit, or other legal proceeding, which is commenced to resolve any matter arising under or relating to the Infano Platform or these Terms and Conditions, shall be subject to the jurisdiction of the courts at Bangalore, India. Questions and Concerns about the Terms and Conditions should be sent to us at <span className="text-primary font-bold underline">connect@infano.care</span>
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
                              <a href="mailto:connect@infano.care" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all hover:shadow-lg hover:-translate-y-0.5">
                                connect@infano.care
                              </a>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  )}

                  {/* Refund and Cancellation Content */}
                  {activeSection === 'refund' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                      <section id="refund-header" className="group/section">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 group-hover/section:scale-110 transition-transform duration-500">
                            <AlertCircle size={24} />
                          </div>
                          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Cancellations, Returns & <span className="text-primary">Refund Policy</span></h2>
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
                              Thank you for choosing Infano (operated by <strong>Berrybird Technologies Private Limited</strong>, “we”, “us”, “our”). Our platform infano.care (the “Website”) is referred to as the “Infano Platform”. Please read this Cancellations, Return, and Refund Policy carefully before making any purchases or transactions on the Infano Platform.
                            </p>
                            <p>
                              By purchasing physical products (such as the printed Gigi Book), digital books, webinars, workshops, or enrolling in our programs and consultation sessions, you acknowledge and agree to the terms outlined in this policy.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="return-policy" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Physical Products (Gigi Book & Merchandise)
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
                            <p>
                              We take utmost care in packaging and delivering all printed books and merchandise.
                            </p>
                            <ul className="space-y-2 mt-4">
                              <li><strong>Order Cancellations:</strong> You can cancel your order before it has been dispatched from our facility by writing to us at <span className="font-bold text-primary">connect@infano.care</span> with your Order ID. Once an order has been shipped, it cannot be cancelled.</li>
                              <li><strong>Damaged, Defective or Incorrect Items:</strong> In the rare event that your product arrives damaged, misprinted, or defective, please notify us within <strong>7 days of delivery</strong> along with photographs of the packaging and product. Upon verification, we will promptly ship a free replacement or initiate a full refund.</li>
                              <li><strong>General Returns:</strong> Due to the nature of printed publications and hygiene standards, items without physical damage or defect are non-returnable once opened.</li>
                            </ul>
                          </div>
                        </div>
                      </section>

                      <section id="cancel-terms" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Digital Products, Programs & Webinars
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
                            <ul className="space-y-2">
                              <li><strong>Digital Downloads (eBooks/Handbooks):</strong> All sales of instantly downloadable digital content are final and non-refundable once the download link or digital access has been generated.</li>
                              <li><strong>Live Webinars & Workshops:</strong> Registrations may be cancelled up to 24 hours prior to the scheduled session time for a full refund or credit toward a future session. No refunds are provided for unattended or missed live sessions.</li>
                              <li><strong>1-on-1 Expert Sessions & Cohort Programs:</strong> Rescheduling requests made at least 24 hours in advance will be accommodated free of charge. Cancellations prior to commencement are eligible for a refund minus administrative processing charges.</li>
                            </ul>
                          </div>
                        </div>
                      </section>

                      <section id="refund-timeline" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Refund Process & Timelines
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
                            <p>
                              When a refund is approved by our team:
                            </p>
                            <ul className="space-y-2 mt-4">
                              <li>The refund will be credited directly to your <strong>original payment method</strong> (Credit Card, Debit Card, Net Banking, UPI, or International Payment gateway).</li>
                              <li><strong>Domestic Refunds (India):</strong> Processed and reflected in your account within <strong>5 to 7 business days</strong>.</li>
                              <li><strong>International Refunds (US, UK, Global):</strong> Processed within <strong>7 to 10 business days</strong>, depending on your bank or card issuer's foreign settlement policies.</li>
                            </ul>
                          </div>
                        </div>
                      </section>

                      <section id="refund-contact" className="scroll-mt-32 pt-8 border-t border-slate-100 pb-12">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Raising Queries & Support
                          </h3>
                          <div className="prose prose-slate max-w-none">
                            <div className="bg-primary/5 border border-primary/20 p-8 rounded-2xl shadow-sm">
                              <p className="text-sm font-bold mb-2 text-primary uppercase tracking-widest">Support</p>
                              <p className="text-xl font-bold mb-4 text-slate-800">Need Help with an Order or Refund?</p>
                              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                                Our support team is here to assist you with any questions regarding orders, replacements, cancellations, or billing.
                              </p>
                              <div className="flex flex-wrap items-center gap-4">
                                <a href="mailto:connect@infano.care" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all hover:shadow-lg hover:-translate-y-0.5">
                                  connect@infano.care
                                </a>
                              </div>
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
                            Multi-Currency Pricing Structure
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-lg">
                            <p>
                              Welcome to Infano.care! We believe in transparent, upfront, and fair pricing for all our users globally. Our platform supports localized, multi-currency pricing to provide a seamless checkout experience for customers worldwide:
                            </p>
                            <ul className="space-y-2 mt-4 text-base">
                              <li><strong>India (Domestic):</strong> All prices are displayed and processed in <strong>Indian Rupees (INR - ₹)</strong>. Applicable Goods & Services Tax (GST) is calculated and itemized transparently.</li>
                              <li><strong>United States & International:</strong> Prices for customers in the United States and global regions are displayed and billed in <strong>US Dollars (USD - $)</strong>.</li>
                              <li><strong>United Kingdom:</strong> Prices for customers in the UK are displayed and billed in <strong>British Pounds (GBP - £)</strong>.</li>
                            </ul>
                          </div>
                        </div>
                      </section>

                      <section id="payment-methods" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Accepted Payment Methods & Security
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
                            <p>
                              We accept a comprehensive range of secure domestic and international payment options:
                            </p>
                            <ul className="space-y-2 mt-4">
                              <li><strong>Credit & Debit Cards:</strong> Visa, MasterCard, American Express, Diners Club, Maestro, and RuPay (both Domestic and International cards).</li>
                              <li><strong>UPI & Digital Wallets:</strong> Google Pay, PhonePe, Paytm, BHIM, and other major UPI providers (for India).</li>
                              <li><strong>Net Banking:</strong> Supported across all major Indian banks.</li>
                              <li><strong>Cash on Delivery (COD):</strong> Available for eligible physical book orders within select PIN codes in India.</li>
                            </ul>
                            <p className="mt-4 text-sm font-medium text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
                              🔒 <strong>Security Guarantee:</strong> All payment transactions are processed through leading, RBI-authorized, PCI-DSS Level 1 compliant payment gateways (such as Razorpay). We do not store or capture any card numbers, CVVs, or bank credentials on our servers.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="taxes-fees" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Taxes, Shipping & Additional Fees
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed">
                            <p>
                              All prices displayed on product pages are transparent. Any applicable delivery charges, COD handling charges, or regional taxes are clearly itemized on the checkout summary before you confirm payment. There are no hidden fees.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="price-changes" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Price Adjustments & Promotions
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed">
                            <p>
                              Infano reserves the right to modify prices, launch promotional discounts, or introduce seasonal offers. Any price change will not affect orders that have already been confirmed and paid for.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="pricing-contact" className="scroll-mt-32 pt-8 border-t border-slate-100 pb-12">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Billing Support
                          </h3>
                          <div className="prose prose-slate max-w-none">
                            <div className="bg-primary/5 border border-primary/20 p-8 rounded-2xl shadow-sm">
                              <p className="text-sm font-bold mb-2 text-primary uppercase tracking-widest">Billing Support</p>
                              <p className="text-xl font-bold mb-4 text-slate-800">Questions regarding Invoices or Pricing?</p>
                              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                                For any billing inquiries, payment confirmation receipts, or tax invoices, please write to our finance team at <span className="font-bold text-primary">connect@infano.care</span>.
                              </p>
                              <a href="mailto:connect@infano.care" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all hover:shadow-lg hover:-translate-y-0.5">
                                connect@infano.care
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
                          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Shipping & <span className="text-primary">Delivery Policy</span></h2>
                        </div>
                      </section>

                      <section id="order-processing" className="scroll-mt-32">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Order Processing & Dispatch
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-lg">
                            <p>
                              All physical book orders (such as the printed Gigi Book) and merchandise placed on Infano.care are processed and dispatched within <span className="font-bold">1–2 business days</span> (excluding Sundays and national holidays).
                            </p>
                            <p>
                              Upon dispatch, you will automatically receive an order confirmation email and SMS containing your package tracking details.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="delivery-time" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Delivery Timelines & Courier Partners
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
                            <p>We partner with premier logistics providers (including Blue Dart, DTDC, Delhivery, India Post, and international freight partners) to ensure fast and secure delivery:</p>
                            <ul className="space-y-2 mt-4">
                              <li><strong>Domestic Delivery (Within India):</strong> Estimated <strong>3 to 7 business days</strong> depending on your city and state.</li>
                              <li><strong>International Delivery (USA, UK & Worldwide):</strong> Estimated <strong>7 to 14 business days</strong> via international courier services with door-to-door tracking.</li>
                              <li><strong>Digital Products & eBooks:</strong> Access is delivered instantly to your registered email and dashboard upon successful payment completion.</li>
                            </ul>
                          </div>
                        </div>
                      </section>

                      <section id="shipping-charges" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Shipping Fees
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed">
                            <p>
                              Shipping fees (if applicable) are calculated dynamically at checkout based on destination country, weight, and delivery method. All shipping costs are displayed clearly before final payment confirmation.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="tracking-order" className="scroll-mt-32 pt-8 border-t border-slate-100">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Shipment Tracking & Support
                          </h3>
                          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed">
                            <p>
                              Once dispatched, you can track your parcel in real time using the tracking number sent to your email/SMS. If you experience any transit delay or delivery issues, please reach out to <span className="font-bold text-primary underline">connect@infano.care</span> and our logistics team will assist you immediately.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section id="shipping-support" className="scroll-mt-32 pt-8 border-t border-slate-100 pb-12">
                        <div className="pl-0 md:pl-16">
                          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-primary/20 rounded-full" />
                            Customer Support & Operating Hours
                          </h3>
                          <div className="prose prose-slate max-w-none">
                            <div className="bg-primary/5 border border-primary/20 p-8 rounded-2xl shadow-sm">
                              <p className="text-sm font-bold mb-2 text-primary uppercase tracking-widest">Order & Shipping Support</p>
                              <p className="text-xl font-bold mb-4 text-slate-800">Need Help with Shipping?</p>
                              <div className="space-y-4 mb-6">
                                <p className="flex items-center gap-3">
                                  <span className="text-xl">📧</span>
                                  <span className="font-bold text-primary">connect@infano.care</span>
                                </p>
                                <p className="flex items-center gap-3 text-slate-500">
                                  <span className="text-xl">🕐</span>
                                  <span>Monday–Saturday, 9:30 AM – 6:30 PM IST</span>
                                </p>
                              </div>
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
