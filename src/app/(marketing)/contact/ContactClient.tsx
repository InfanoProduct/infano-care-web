'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Mail, MapPin, Phone, Building2, UserCircle, Handshake, CheckCircle2, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';

export function ContactClient() {
  const [selectedCard, setSelectedCard] = useState('school');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolType: 'CBSE',
    cityState: '',
    totalGirls: '',
    contactName: '',
    email: '',
    phone: '',
    preferredTime: 'Morning (9AM - 12PM)',
    goals: '',
    details: '',
    ngoDetail: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiClient.post('/enquiry/submit', {
        ...formData,
        type: selectedCard,
        totalGirls: formData.totalGirls ? parseInt(formData.totalGirls) : undefined
      });
      toast.success('Enquiry submitted successfully! We\'ll be in touch soon.');
      setFormData({
        schoolName: '',
        schoolType: 'CBSE',
        cityState: '',
        totalGirls: '',
        contactName: '',
        email: '',
        phone: '',
        preferredTime: 'Morning (9AM - 12PM)',
        goals: '',
        details: '',
        ngoDetail: ''
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormTitle = () => {
    switch (selectedCard) {
      case 'school': return 'School Enquiry Form';
      case 'parent': return 'Parent/Carer Enquiry Form';
      case 'partner': return 'Partnership Enquiry Form';
      default: return 'Enquiry Form';
    }
  };

  const getButtonText = () => {
    switch (selectedCard) {
      case 'school': return 'Request a School Consultation';
      case 'parent': return 'Send Parent Enquiry';
      case 'partner': return 'Submit Partnership Request';
      default: return 'Submit Enquiry';
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Section 10.1 — Hero */}
      <section className="pt-24 pb-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6 text-foreground">
            We'd love to hear from you. <br />
            <span className="text-primary">Every great partnership starts with a conversation.</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Whether you're a school ready to partner, a parent ready to enrol, or a potential partner — reach out. Our team responds within one working day.
          </p>
        </div>
      </section>

      {/* Section 10.2 — Contact Pathways */}
      <section className="py-12 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              onClick={() => setSelectedCard('school')}
              className={`p-6 border-2 rounded-2xl cursor-pointer transition-all relative ${
                selectedCard === 'school' ? 'border-primary bg-white shadow-lg scale-[1.02]' : 'border-border bg-slate-50 hover:border-primary/50'
              }`}
            >
              {selectedCard === 'school' && <CheckCircle2 className="absolute top-4 right-4 text-primary" size={20} />}
              <Building2 className="text-primary mb-4" size={32} />
              <h3 className="font-bold text-lg mb-2">I Represent a School</h3>
              <p className="text-sm text-muted-foreground mb-4">Book a 45-minute consultation with our School Partnerships team.</p>
              <div className="text-primary font-semibold text-sm flex items-center">
                Fill the form below <ArrowRight size={16} className="ml-1" />
              </div>
            </div>

            <div 
              onClick={() => setSelectedCard('parent')}
              className={`p-6 border-2 rounded-2xl cursor-pointer transition-all relative ${
                selectedCard === 'parent' ? 'border-emerald-500 bg-white shadow-lg scale-[1.02]' : 'border-border bg-slate-50 hover:border-emerald-500/50'
              }`}
            >
              {selectedCard === 'parent' && <CheckCircle2 className="absolute top-4 right-4 text-emerald-500" size={20} />}
              <UserCircle className="text-emerald-500 mb-4" size={32} />
              <h3 className="font-bold text-lg mb-2">I'm a Parent or Carer</h3>
              <p className="text-sm text-muted-foreground mb-4">Enrol your daughter or ask a question.</p>
              <div className="text-emerald-500 font-semibold text-sm flex items-center">
                Fill the form below <ArrowRight size={16} className="ml-1" />
              </div>
            </div>

            <div 
              onClick={() => setSelectedCard('partner')}
              className={`p-6 border-2 rounded-2xl cursor-pointer transition-all relative ${
                selectedCard === 'partner' ? 'border-blue-500 bg-white shadow-lg scale-[1.02]' : 'border-border bg-slate-50 hover:border-blue-500/50'
              }`}
            >
              {selectedCard === 'partner' && <CheckCircle2 className="absolute top-4 right-4 text-blue-500" size={20} />}
              <Handshake className="text-blue-500 mb-4" size={32} />
              <h3 className="font-bold text-lg mb-2">I Want to Partner</h3>
              <p className="text-sm text-muted-foreground mb-4">Corporate CSR, NGO collaboration, or media.</p>
              <div className="text-blue-500 font-semibold text-sm flex items-center">
                Fill the form below <ArrowRight size={16} className="ml-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 10.3 — Dynamic Enquiry Form */}
      <section className="py-24 bg-slate-50" id="enquiry-form">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="glass-card bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-slate-100">
            <h2 className="text-3xl font-bold font-heading mb-2 text-center">{getFormTitle()}</h2>
            <p className="text-center text-muted-foreground mb-8">Fill out the form below and we'll be in touch within one working day.</p>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {selectedCard === 'school' && (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">School Name *</label>
                      <input 
                        type="text" 
                        name="schoolName"
                        value={formData.schoolName}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50" 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">School Type</label>
                      <select 
                        name="schoolType"
                        value={formData.schoolType}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option>CBSE</option>
                        <option>ICSE</option>
                        <option>IB</option>
                        <option>State Board</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">City and State</label>
                      <input 
                        type="text" 
                        name="cityState"
                        value={formData.cityState}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Total Number of Girls (Grades 6–12)</label>
                      <input 
                        type="number" 
                        name="totalGirls"
                        value={formData.totalGirls}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50" 
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {selectedCard === 'school' ? 'Your Name and Role' : 'Your Full Name *'}
                  </label>
                  <input 
                    type="text" 
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50" 
                    required={selectedCard !== 'school'}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email Address *</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50" 
                    required 
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone Number *</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50" 
                    required
                  />
                </div>
                {selectedCard === 'school' ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Preferred Consultation Time</label>
                    <select 
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option>Morning (9AM - 12PM)</option>
                      <option>Afternoon (12PM - 4PM)</option>
                      <option>Evening (4PM - 6PM)</option>
                    </select>
                  </div>
                ) : selectedCard === 'partner' ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Organization/NGO Detail *</label>
                    <input 
                      type="text" 
                      name="ngoDetail"
                      value={formData.ngoDetail}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50" 
                      required
                    />
                  </div>
                ) : null}
              </div>

              {(selectedCard === 'school' || selectedCard === 'partner') && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {selectedCard === 'partner' ? 'What are your partnership goals? *' : 'What are your main goals for this programme?'}
                  </label>
                  <textarea 
                    name="goals"
                    value={formData.goals}
                    onChange={handleInputChange}
                    rows={3} 
                    className="w-full p-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required={selectedCard === 'partner'}
                  ></textarea>
                </div>
              )}

              {selectedCard === 'parent' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Tell us more about your enquiry *</label>
                  <textarea 
                    name="details"
                    value={formData.details}
                    onChange={handleInputChange}
                    rows={4} 
                    placeholder="E.g. I want to enrol my daughter, I have a question about the curriculum..."
                    className="w-full p-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  ></textarea>
                </div>
              )}

              <div className="pt-4 text-center">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-primary w-full md:w-auto px-12 py-4 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      {getButtonText()} &rarr;
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Section 10.4 — Parent Enrolment CTA */}
      <section className="py-24 bg-primary text-white text-center">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">Ready to give your daughter the support she deserves?</h2>
          <p className="text-lg text-primary-100 mb-10">
            It takes less than 5 minutes to enrol. Start your 14-day free trial today — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-8 py-4 bg-white text-primary rounded-full font-bold hover:bg-slate-100 transition-colors shadow-lg">
              Start Free Trial &rarr;
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white/30 text-white rounded-full font-bold hover:bg-white/10 transition-colors">
              Available on iOS and Android
            </button>
          </div>
        </div>
      </section>

      {/* Section 10.5 — Office & Regional Contacts */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-heading mb-4">Office & Contacts</h2>
            <p className="text-muted-foreground">Reach out to us directly through any of the channels below.</p>
          </div>
          <div className="bg-slate-50 p-10 rounded-3xl border border-border space-y-8 shadow-sm">
            
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <MapPin className="text-primary mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800">Address 1</h4>
                  <p className="text-muted-foreground mt-1">Naya Raipur, Chhattisgarh</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <MapPin className="text-primary mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800">Address 2</h4>
                  <p className="text-muted-foreground mt-1">Sarjapur, Bangalore</p>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            <div className="grid sm:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <Mail className="text-primary mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800">Schools Enquiries</h4>
                  <p className="text-muted-foreground mt-1">connect@infano.care</p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Mon–Fri, 9am–6pm IST</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="text-primary mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800">Parent Support</h4>
                  <p className="text-muted-foreground mt-1">connect@infano.care</p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Mon–Sat, 9am–8pm IST</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
