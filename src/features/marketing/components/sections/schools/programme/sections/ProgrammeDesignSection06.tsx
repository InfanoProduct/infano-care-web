import Link from 'next/link';
import { cssStyle } from '../../style';

export function ProgrammeDesignSection06() {
  return (
<section style={cssStyle("background: transparent; padding: 72px 0")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 36px")}>
    <div style={cssStyle("background: #2E2240; color: #FFFFFF; border-radius: 32px; padding: 36px; display: flex; flex-wrap: wrap; gap: 20px; align-items: center; justify-content: space-between")}>
      <div>
        <div className="hand" style={cssStyle("font-size: 28px; color: #F4A3B4")}>
          {"See it in your classroom"}
        </div>
        <h2 style={cssStyle("margin: 0; font-weight: 900; font-size: clamp(26px, 3cqi, 36px)")}>
          {"Watch a live 35-minute Together session, free"}
        </h2>
      </div>
      <Link href="/schools/health-check" style={cssStyle("min-height: 56px; padding: 0 26px; border-radius: 999px; border: none; background: #C2456A; color: #FFFFFF; font-weight: 800; font-size: 17px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #F4A3B4; color: #3D2C4A")}>
        {"Book a Health Check and demo"}
      </Link>
    </div>
  </div>
</section>
  );
}
