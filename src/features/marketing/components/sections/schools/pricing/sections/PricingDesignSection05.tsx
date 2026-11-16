import Link from 'next/link';
import { cssStyle } from '../../style';

export function PricingDesignSection05() {
  return (
<section style={cssStyle("background: transparent; padding: 72px 0")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 36px")}>
    <div style={cssStyle("background: #FDEFF0; border-radius: 32px; padding: 36px; display: flex; flex-wrap: wrap; gap: 20px; align-items: center; justify-content: space-between")}>
      <div style={cssStyle("max-width: 640px")}>
        <div className="hand" style={cssStyle("font-size: 28px; color: #C2456A")}>
          {"Founding schools"}
        </div>
        <h2 style={cssStyle("margin: 0; font-weight: 900; font-size: clamp(26px, 3cqi, 36px)")}>
          {"The first 20 schools get 20% off year 1"}
        </h2>
        <p style={cssStyle("margin: 6px 0 0")}>
          {"In return for a case study, a principal quote and a parent-preview video. Choose three years and save another 10%."}
        </p>
      </div>
      <Link href="/schools/health-check" style={cssStyle("min-height: 56px; padding: 0 26px; border-radius: 999px; border: none; background: #C2456A; color: #FFFFFF; font-weight: 800; font-size: 17px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px")}>
        {"Start with a free Health Check"}
      </Link>
    </div>
  </div>
</section>
  );
}
