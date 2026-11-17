import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { cssStyle } from './style';

const navigation = [
  { label: 'Overview', href: '/schools' },
  { label: 'Programme', href: '/schools/programme' },
  { label: 'Requirements', href: '/schools/requirements' },
  { label: 'Packages', href: '/schools/packages' },
  { label: 'For parents', href: '/schools/parents' },
];

type SchoolTemplateShellProps = {
  pageClass: 'hm' | 'pg' | 'rq' | 'pr' | 'hc' | 'pa';
  activePage: string;
  children: ReactNode;
};

export function SchoolTemplateShell({
  pageClass,
  activePage,
  children,
}: SchoolTemplateShellProps) {
  return (
    <div className={`sx ${pageClass}`} style={cssStyle("container-type: inline-size; position: relative; width: 100%; min-height: 100%; background: #FFFAF6; color: #3D2C4A; font-family: var(--font-noto-sans), 'Noto Sans', system-ui, sans-serif; font-size: 17px; line-height: 1.6; overflow-x: hidden")}>
      <header style={cssStyle('background: #2E2240; position: sticky; top: 0; z-index: 30')}>
        <div style={cssStyle('max-width: 1200px; margin: 0 auto; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; gap: 14px')}>
          <Link href="/" style={cssStyle('display: inline-flex; align-items: center; gap: 8px; text-decoration: none; color: #FFFFFF')}>
            <span style={cssStyle('position: relative; display: inline-block; flex: 0 0 120px; width: 120px; height: 68px')}>
              <Image
                src="/logo/infano-logo-for-dark-bg.png"
                alt="Infano"
                fill
                sizes="120px"
                style={{ objectFit: 'contain' }}
              />
            </span>
            <span className="hand" style={cssStyle('font-size: 22px; color: #F4A3B4')}>for schools</span>
          </Link>
          <nav className="nav-links" aria-label="For Schools" style={cssStyle('display: flex; gap: 4px; flex-wrap: wrap')}>
            {navigation.map((item) => {
              const isActive = item.href === activePage;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  style={cssStyle(`min-height: 40px; padding: 0 14px; display: inline-flex; align-items: center; border-radius: 999px; text-decoration: none; font-weight: 700; font-size: 15px; ${isActive ? 'background: #FFFFFF; color: #3D2C4A' : 'color: #EFE6F2'}`)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Link href="/schools/health-check" style={cssStyle('min-height: 44px; padding: 0 18px; display: inline-flex; align-items: center; border-radius: 999px; background: #F4A3B4; color: #3D2C4A; font-weight: 800; text-decoration: none; white-space: nowrap')}>
            Free Health Check
          </Link>
        </div>
      </header>
      {children}
      <footer style={cssStyle('background: #2E2240; color: #EFE6F2; padding: 48px 0 26px')}>
        <div style={cssStyle('max-width: 1200px; margin: 0 auto; padding: 0 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 26px')}>
          <div style={cssStyle('display: flex; flex-direction: column; gap: 8px')}>
            <Link href="/" style={cssStyle('display: inline-flex; align-items: center; gap: 8px; text-decoration: none; color: #FFFFFF')}>
              <span style={cssStyle('position: relative; display: inline-block; flex: 0 0 120px; width: 120px; height: 68px')}>
                <Image
                  src="/logo/infano-logo-for-dark-bg.png"
                  alt="Infano"
                  fill
                  sizes="120px"
                  style={{ objectFit: 'contain' }}
                />
              </span>
              <span className="hand" style={cssStyle('color: #F4A3B4')}>for schools</span>
            </Link>
            <span style={cssStyle('font-size: 14px')}>Growing Up Together: puberty, menstrual health and wellbeing for co-ed schools, Grades 4 to 9.</span>
          </div>
          <div style={cssStyle('display: flex; flex-direction: column; gap: 6px; font-size: 14px')}>
            <strong style={cssStyle('color: #FFFFFF')}>For Schools</strong>
            <Link href="/schools/programme" style={cssStyle('color: #EFE6F2')}>The programme</Link>
            <Link href="/schools/requirements" style={cssStyle('color: #EFE6F2')}>Requirements self-check</Link>
            <Link href="/schools/packages" style={cssStyle('color: #EFE6F2')}>Packages and pricing</Link>
            <Link href="/schools/parents" style={cssStyle('color: #EFE6F2')}>For parents</Link>
          </div>
          <div style={cssStyle('display: flex; flex-direction: column; gap: 6px; font-size: 14px')}>
            <strong style={cssStyle('color: #FFFFFF')}>Talk to us</strong>
            <a href="mailto:connect@infano.care" style={cssStyle('color: #EFE6F2')}>connect@infano.care</a>
            <a href="https://wa.me/919243019243" style={cssStyle('color: #EFE6F2')}>WhatsApp +91 92430 19243</a>
            <Link href="/schools/health-check" style={cssStyle('color: #EFE6F2')}>Book a free Health Check</Link>
          </div>
        </div>
        <div style={cssStyle('max-width: 1200px; margin: 28px auto 0; padding: 18px 24px 0; border-top: 1px solid rgba(255,255,255,.15); display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px; font-size: 13px; color: #CBBBD3')}>
          <span>© 2026 BerryBird Technologies Private Limited</span>
          <span>Infano helps schools meet and evidence their requirements. Schools remain responsible for their statutory obligations.</span>
        </div>
      </footer>
    </div>
  );
}
