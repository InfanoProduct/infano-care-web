import { cssStyle } from '../../style';

export function ParentsDesignSection03() {
  return (
<section style={cssStyle("background: #FFFFFF; padding: 72px 0")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 36px")}>
    <div style={cssStyle("display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; align-items: center")}>
      <div style={cssStyle("position: relative; height: 320px; border-radius: 28px; background: #D8ECF8; overflow: hidden; ")}>
        <img src="/schools-template/img/sch-11.webp" alt="Child proudly showing a stamped Growing Up Passport" loading="lazy" style={cssStyle("position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 40% 40%; display: block")} />
      </div>
      <div style={cssStyle("display: flex; flex-direction: column; gap: 14px")}>
        <div style={cssStyle("max-width: 760px; ")}>
          <div className="hand" style={cssStyle("font-size: 28px; color: #C2456A")}>
            {"Growing Up Passport"}
          </div>
          <h2 style={cssStyle("margin: 2px 0 10px; font-weight: 900; font-size: clamp(30px, 4cqi, 46px); line-height: 1.1; color: #3D2C4A")}>
            {"Progress you can hold"}
          </h2>
        </div>
        <p style={cssStyle("margin: 0; font-size: 17px")}>
          {"Each child carries a pocket Growing Up Passport from Grade 4. After every session it gets a stamp and a line in their own words. Their reflections are never collected; it’s theirs to keep and, if they choose, to share with you."}
        </p>
      </div>
    </div>
  </div>
</section>
  );
}
