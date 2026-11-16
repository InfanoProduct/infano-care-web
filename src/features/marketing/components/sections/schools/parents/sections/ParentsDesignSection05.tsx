import Link from 'next/link';
import { cssStyle } from '../../style';

export function ParentsDesignSection05() {
  return (
<section style={cssStyle("background: #FFFFFF; padding: 72px 0")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 36px")}>
    <div style={cssStyle("background: #E3DAF5; border-radius: 32px; padding: 34px; display: flex; flex-wrap: wrap; gap: 24px; align-items: center")}>
      <div style={cssStyle("flex: 2 1 400px")}>
        <div className="hand" style={cssStyle("font-size: 28px; color: #5A4385")}>
          {"Keep the conversation going"}
        </div>
        <h2 style={cssStyle("margin: 0; font-weight: 900; font-size: clamp(24px, 3cqi, 34px)")}>
          {"Girlhood: HerNext, the home course for girls aged 9 to 15"}
        </h2>
        <p style={cssStyle("margin: 6px 0 0")}>
          {"15 expert video lessons, games and a private diary, plus a parent space. Completely optional, and separate from school."}
        </p>
      </div>
      <Link href="/course/girlhood-hernext" style={cssStyle("min-height: 56px; padding: 0 24px; border-radius: 999px; border: 2px solid #3D2C4A; background: transparent; color: #3D2C4A; font-weight: 800; font-size: 17px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center")}>
        {"Discover HerNext"}
      </Link>
    </div>
  </div>
</section>
  );
}
