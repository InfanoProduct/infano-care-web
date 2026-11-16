import { cssStyle } from '../../style';

export function RequirementsDesignSection00() {
  return (
<section style={cssStyle("background: #D8ECF8; padding: 60px 0 44px")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 14px; align-items: center; text-align: center")}>
    <span style={cssStyle("display: inline-block; background: #FFFFFF; color: #2F6494; border-radius: 999px; padding: 3px 12px; font-size: 12px; font-weight: 800; letter-spacing: .06em")}>
      {"READINESS SELF-CHECK · 2 MINUTES"}
    </span>
    {" "}
    <h1 style={cssStyle("margin: 0; font-weight: 900; font-size: clamp(40px, 5.6cqi, 66px); line-height: 1.05")}>
      {"The new rules,"}
      <br />
      <span style={cssStyle("color: #C2456A")}>
        {"made simple"}
      </span>
    </h1>
    {" "}
    <p style={cssStyle("margin: 0; max-width: 700px; font-size: 19px; color: #4A3A57")}>
      {"Twelve questions an inspector, a parent or your board can ask. Answer honestly; nobody sees this but you."}
    </p>
  </div>
</section>
  );
}
