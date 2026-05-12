import Link from 'next/link';
import { ArrowRight, Mail, MapPin, Phone, Building2, UserCircle, BookOpen, Handshake, MessageSquare } from 'lucide-react';

export default function ContactPage() {
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
            Whether you're a school ready to partner, a parent ready to enrol, or simply curious about what Infano.care is — reach out. Our team responds within one working day.
          </p>
        </div>
      </section>

      {/* Section 10.2 — Contact Pathways */}
      <section className="py-12 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 border border-border rounded-2xl bg-slate-50 hover:border-primary transition-colors">
              <Building2 className="text-primary mb-4" size={32} />
              <h3 className="font-bold text-lg mb-2">I Represent a School</h3>
              <p className="text-sm text-muted-foreground mb-4">Book a 45-minute consultation with our School Partnerships team.</p>
              <a href="mailto:schools@infano.care" className="text-primary font-semibold text-sm flex items-center hover:underline">
                schools@infano.care <ArrowRight size={16} className="ml-1" />
              </a>
            </div>

            <div className="p-6 border border-border rounded-2xl bg-slate-50 hover:border-secondary transition-colors">
              <UserCircle className="text-secondary mb-4" size={32} />
              <h3 className="font-bold text-lg mb-2">I'm a Parent or Carer</h3>
              <p className="text-sm text-muted-foreground mb-4">Enrol your daughter or ask a question.</p>
              <a href="mailto:parents@infano.care" className="text-secondary font-semibold text-sm flex items-center hover:underline">
                parents@infano.care <ArrowRight size={16} className="ml-1" />
              </a>
            </div>

            <div className="p-6 border border-border rounded-2xl bg-slate-50 hover:border-accent transition-colors">
              <BookOpen className="text-accent mb-4" size={32} />
              <h3 className="font-bold text-lg mb-2">I Want the Book</h3>
              <p className="text-sm text-muted-foreground mb-4">Order online or enquire about bulk school adoption.</p>
              <a href="mailto:books@infano.care" className="text-accent font-semibold text-sm flex items-center hover:underline">
                books@infano.care <ArrowRight size={16} className="ml-1" />
              </a>
            </div>

            <div className="p-6 border border-border rounded-2xl bg-slate-50 hover:border-blue-500 transition-colors">
              <Handshake className="text-blue-500 mb-4" size={32} />
              <h3 className="font-bold text-lg mb-2">I Want to Partner</h3>
              <p className="text-sm text-muted-foreground mb-4">Corporate CSR, NGO collaboration, or media.</p>
              <a href="mailto:partnerships@infano.care" className="text-blue-500 font-semibold text-sm flex items-center hover:underline">
                partnerships@infano.care <ArrowRight size={16} className="ml-1" />
              </a>
            </div>

            <div className="p-6 border border-border rounded-2xl bg-slate-50 hover:border-slate-800 transition-colors">
              <MessageSquare className="text-slate-700 mb-4" size={32} />
              <h3 className="font-bold text-lg mb-2">General Enquiry</h3>
              <p className="text-sm text-muted-foreground mb-4">Anything else.</p>
              <a href="mailto:hello@infano.care" className="text-slate-800 font-semibold text-sm flex items-center hover:underline">
                hello@infano.care <ArrowRight size={16} className="ml-1" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section 10.3 — School Enquiry Form */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="glass-card bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-slate-100">
            <h2 className="text-3xl font-bold font-heading mb-2 text-center">School Enquiry Form</h2>
            <p className="text-center text-muted-foreground mb-8">Fill out the form below and we'll be in touch within one working day.</p>

            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">School Name *</label>
                  <input type="text" className="w-full p-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">School Type</label>
                  <select className="w-full p-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50">
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
                  <input type="text" className="w-full p-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Total Number of Girls (Grades 6–12)</label>
                  <input type="number" className="w-full p-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Your Name and Role</label>
                  <input type="text" className="w-full p-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email Address *</label>
                  <input type="email" className="w-full p-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone Number</label>
                  <input type="tel" className="w-full p-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Preferred Consultation Time</label>
                  <select className="w-full p-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option>Morning (9AM - 12PM)</option>
                    <option>Afternoon (12PM - 4PM)</option>
                    <option>Evening (4PM - 6PM)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">What are your main goals for this programme?</label>
                <textarea rows={3} className="w-full p-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"></textarea>
              </div>

              <div className="pt-4 text-center">
                <button type="button" className="btn-primary w-full md:w-auto px-12 py-4">
                  Request a School Consultation &rarr;
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

      {/* Section 10.5 — Office & Regional Contacts & 10.6 Newsletter */}
      <section className="py-24 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-2xl font-bold font-heading mb-8">Office & Contacts</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="text-muted-foreground mt-1" />
                  <div>
                    <h4 className="font-bold">Head Office</h4>
                    <p className="text-muted-foreground">Bengaluru, India</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="text-muted-foreground mt-1" />
                  <div>
                    <h4 className="font-bold">Schools Enquiries</h4>
                    <p className="text-muted-foreground">schools@infano.care</p>
                    <p className="text-sm text-slate-400">Mon–Fri, 9am–6pm IST</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="text-muted-foreground mt-1" />
                  <div>
                    <h4 className="font-bold">Parent Support</h4>
                    <p className="text-muted-foreground">support@infano.care</p>
                    <p className="text-sm text-slate-400">Mon–Sat, 9am–8pm IST</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-border">
              <h2 className="text-2xl font-bold font-heading mb-4">Stay in the loop.</h2>
              <p className="text-muted-foreground mb-8">
                Monthly updates on adolescent girl wellness, new features, expert insights, and stories from the Infano community.
              </p>
              <form className="space-y-4">
                <input type="text" placeholder="Your Name" className="w-full p-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <input type="email" placeholder="Your Email" className="w-full p-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <select className="w-full p-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-muted-foreground">
                  <option value="" disabled selected>I am a...</option>
                  <option>School</option>
                  <option>Parent</option>
                  <option>Educator</option>
                  <option>Other</option>
                </select>
                <button type="button" className="btn-primary w-full py-3">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
