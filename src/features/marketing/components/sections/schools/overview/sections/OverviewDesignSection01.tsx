import Link from 'next/link';
import { cssStyle } from '../../style';

export function OverviewDesignSection01() {
  return (
<section style={cssStyle("background: transparent; padding: 72px 0")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 36px")}>
    <div style={cssStyle("max-width: 760px; margin: 0 auto; text-align: center")}>
      <div className="hand" style={cssStyle("font-size: 28px; color: #C2456A")}>
        {"Since January 2026"}
      </div>
      <h2 style={cssStyle("margin: 2px 0 10px; font-weight: 900; font-size: clamp(30px, 4cqi, 46px); line-height: 1.1; color: #3D2C4A")}>
        {"This is no longer optional"}
      </h2>
      <p style={cssStyle("margin: 0; font-size: 18px; color: #5E4B6B")}>
        {"New Supreme Court and CBSE directions mean every school, government or private, must teach, train, stock and prove it. And inspectors now ask your students directly."}
      </p>
    </div>
    <div style={cssStyle("display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px")}>
      <div className="lift" style={cssStyle("background: #D8ECF8; border-radius: 26px; padding: 22px; display: flex; flex-direction: column; gap: 8px")}>
        <span style={cssStyle("font-weight: 900; font-size: 30px; line-height: 1")}>
          {"Jan 2026"}
        </span>
        <strong style={cssStyle("font-size: 18px")}>
          {"Supreme Court"}
        </strong>
        <span style={cssStyle("font-size: 15px; color: #4A3A57")}>
          {"Free pads, MHM corners, safe disposal, student training on puberty, and every teacher (male and female) sensitised."}
        </span>
      </div>
      <div className="lift" style={cssStyle("background: #D4EFE4; border-radius: 26px; padding: 22px; display: flex; flex-direction: column; gap: 8px")}>
        <span style={cssStyle("font-weight: 900; font-size: 30px; line-height: 1")}>
          {"Mar 2026"}
        </span>
        <strong style={cssStyle("font-size: 18px")}>
          {"CBSE circular"}
        </strong>
        <span style={cssStyle("font-size: 15px; color: #4A3A57")}>
          {"“Schools shall conduct training” on menstrual health. Compliance reported in March and April."}
        </span>
      </div>
      <div className="lift" style={cssStyle("background: #E3DAF5; border-radius: 26px; padding: 22px; display: flex; flex-direction: column; gap: 8px")}>
        <span style={cssStyle("font-weight: 900; font-size: 30px; line-height: 1")}>
          {"Feb 2026"}
        </span>
        <strong style={cssStyle("font-size: 18px")}>
          {"Mental health"}
        </strong>
        <span style={cssStyle("font-size: 15px; color: #4A3A57")}>
          {"Staff trained twice a year by certified professionals, parent sensitisation and an annual wellness report."}
        </span>
      </div>
      <div className="lift" style={cssStyle("background: #FFE3CC; border-radius: 26px; padding: 22px; display: flex; flex-direction: column; gap: 8px")}>
        <span style={cssStyle("font-weight: 900; font-size: 30px; line-height: 1")}>
          {"Sep 2026"}
        </span>
        <strong style={cssStyle("font-size: 18px")}>
          {"Surprise inspections"}
        </strong>
        <span style={cssStyle("font-size: 15px; color: #4A3A57")}>
          {"District teams visit unannounced and ask students anonymously: were you taught, can you get a pad?"}
        </span>
      </div>
    </div>
    <div style={cssStyle("display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; align-items: center")}>
      <Link href="/schools/requirements" style={cssStyle("min-height: 56px; padding: 0 26px; border-radius: 999px; border: none; background: #C2456A; color: #FFFFFF; font-weight: 800; font-size: 17px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px")}>
        {"Take the 2-minute readiness check"}
      </Link>
      <span style={cssStyle("font-size: 14px; color: #6E5B7A")}>
        {"We help you meet and evidence the requirements. We never certify compliance."}
      </span>
    </div>
  </div>
</section>
  );
}
