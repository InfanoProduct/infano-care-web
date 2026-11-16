import { cssStyle } from '../../style';

export function PricingDesignSection00() {
  return (
<section style={cssStyle("background: #D4EFE4; padding: 60px 0 40px")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 14px; align-items: center; text-align: center")}>
    <span style={cssStyle("display: inline-block; background: #FFFFFF; color: #24735A; border-radius: 999px; padding: 3px 12px; font-size: 12px; font-weight: 800; letter-spacing: .06em")}>
      {"PACKAGES AND PRICING"}
    </span>
    {" "}
    <h1 style={cssStyle("margin: 0; font-weight: 900; font-size: clamp(40px, 5.6cqi, 66px); line-height: 1.05")}>
      {"Priced per student."}
      <br />
      <span style={cssStyle("color: #C2456A")}>
        {"Planned for the whole year."}
      </span>
    </h1>
    {" "}
    <p style={cssStyle("margin: 0; max-width: 700px; font-size: 19px; color: #4A3A57")}>
      {"One partner instead of a pad vendor, a brand talk, an outside trainer and a survey tool. Prices are per enrolled student in the covered grades, per academic year, plus GST."}
    </p>
  </div>
</section>
  );
}
