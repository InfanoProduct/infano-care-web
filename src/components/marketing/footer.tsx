import Link from 'next/link';

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
  ],
  legal: [
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Use', href: '#' },
    { name: 'Child Safety Policy', href: '#' },
    { name: 'Accessibility Statement', href: '#' },
  ],
  contact: [
    { name: 'Contact Us', href: '/contact' },
    { name: 'hello@infano.care', href: 'mailto:hello@infano.care' },
    { name: 'support@infano.care', href: 'mailto:support@infano.care' },
    { name: 'schools@infano.care', href: 'mailto:schools@infano.care' },
  ],
  social: [
    { name: 'Instagram', href: '#' },
    { name: 'YouTube', href: '#' },
    { name: 'LinkedIn', href: '#' },
    { name: 'WhatsApp Community', href: '#' },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex flex-col mb-6">
              <span className="font-heading font-bold text-3xl tracking-tight text-white">
                Infano.care
              </span>
              <span className="text-sm font-medium text-primary-light mt-1">
                Empowering Girls. Nurturing Women. Growing Together.
              </span>
            </Link>
            <p className="text-sm text-slate-400 mb-6 max-w-sm leading-relaxed">
              India's most holistic ecosystem for adolescent and young adult girls — blending story-led learning, menstrual wellness, mental health, expert guidance, and peer community.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm hover:text-primary-light transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Audiences</h4>
            <ul className="space-y-3">
              {footerLinks.audiences.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm hover:text-primary-light transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="text-white font-semibold mt-8 mb-4">Social</h4>
            <ul className="space-y-3">
              {footerLinks.social.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm hover:text-primary-light transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              {footerLinks.contact.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm hover:text-primary-light transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm hover:text-primary-light transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 text-center md:text-left">
            &copy; {new Date().getFullYear()} Infano.care. All rights reserved.
          </p>
          <div className="bg-slate-800/50 p-4 rounded-xl max-w-2xl">
            <p className="text-xs text-slate-400 text-center">
              <strong className="text-slate-300">Disclaimer:</strong> Infano.care is a safe, moderated platform. All content is reviewed by qualified mental health and medical professionals.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
