import Link from 'next/link';
import { cssStyle } from '../../style';

export function OverviewDesignSection11() {
  return (
<section style={cssStyle("padding: 72px 0")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px")}>
    {" "}
    <div style={cssStyle("position: relative; overflow: hidden; background: #FDEFF0; border-radius: 36px; padding: 44px 36px; display: flex; flex-wrap: wrap; gap: 30px; align-items: center")}>
      {" "}
      <div style={cssStyle("flex: 2 1 420px; display: flex; flex-direction: column; gap: 14px")}>
        {" "}
        <div className="hand" style={cssStyle("font-size: 30px; color: #C2456A")}>
          {"Free · 45 minutes · no obligation"}
        </div>
        {" "}
        <h2 style={cssStyle("margin: 0; font-weight: 900; font-size: clamp(30px, 4cqi, 46px); line-height: 1.1")}>
          {"Know where you stand before the inspector does"}
        </h2>
        {" "}
        <ol style={cssStyle("margin: 0; padding-left: 22px; display: flex; flex-direction: column; gap: 4px")}>
          <li>
            {"A walk-through with our requirements checklist"}
          </li>
          <li>
            {"A sample anonymous survey of 20 girls and 20 boys, with your permission"}
          </li>
          <li>
            {"A one-page gap report within 5 days: what’s in place, what’s missing, and the fix"}
          </li>
        </ol>
        {" "}
        <div style={cssStyle("display: flex; flex-wrap: wrap; gap: 12px")}>
          <Link href="/schools/health-check" style={cssStyle("min-height: 56px; padding: 0 26px; border-radius: 999px; border: none; background: #C2456A; color: #FFFFFF; font-weight: 800; font-size: 17px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px")}>
            {"Book a free Health Check"}
          </Link>
          <a href="https://wa.me/919243019243" style={cssStyle("min-height: 56px; padding: 0 24px; border-radius: 999px; border: 2px solid #3D2C4A; background: transparent; color: #3D2C4A; font-weight: 800; font-size: 17px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center")}>
            {"WhatsApp us"}
          </a>
        </div>
        {" "}
      </div>
      {" "}
      <div style={cssStyle("flex: 1 1 260px")}>
        <div style={cssStyle("position: relative; height: 300px; border-radius: 28px; background: #F9D5D3; overflow: hidden; ")}>
          <img src="/schools-template/img/sch-05.webp" alt="Principal and facilitator walking through a school corridor" loading="lazy" style={cssStyle("position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; display: block")} />
        </div>
      </div>
      {" "}
    </div>
  </div>
</section>
  );
}
