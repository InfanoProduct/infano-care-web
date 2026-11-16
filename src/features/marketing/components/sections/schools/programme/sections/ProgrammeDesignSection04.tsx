import { cssStyle } from '../../style';

export function ProgrammeDesignSection04() {
  return (
<section style={cssStyle("background: #FFFFFF; padding: 72px 0")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 36px")}>
    <div style={cssStyle("max-width: 760px; margin: 0 auto; text-align: center")}>
      <div className="hand" style={cssStyle("font-size: 28px; color: #C2456A")}>
        {"For parents"}
      </div>
      <h2 style={cssStyle("margin: 2px 0 10px; font-weight: 900; font-size: clamp(30px, 4cqi, 46px); line-height: 1.1; color: #3D2C4A")}>
        {"Home and school, on the same page"}
      </h2>
    </div>
    <div style={cssStyle("display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px")}>
      <div style={cssStyle("background: #D8ECF8; border-radius: 24px; padding: 22px; display: flex; flex-direction: column; gap: 8px")}>
        <strong style={cssStyle("font-size: 19px")}>
          {"Parent preview"}
        </strong>
        <span style={cssStyle("font-size: 15px")}>
          {"Before the year starts, parents see every session and ask questions. The best way to prevent objections."}
        </span>
      </div>
      <div style={cssStyle("background: #D4EFE4; border-radius: 24px; padding: 22px; display: flex; flex-direction: column; gap: 8px")}>
        <strong style={cssStyle("font-size: 19px")}>
          {"Parent sessions"}
        </strong>
        <span style={cssStyle("font-size: 15px")}>
          {"Talking about puberty, spotting distress and online safety, in English and the local language."}
        </span>
      </div>
      <div style={cssStyle("background: #FFF4C7; border-radius: 24px; padding: 22px; display: flex; flex-direction: column; gap: 8px")}>
        <strong style={cssStyle("font-size: 19px")}>
          {"Talk Tonight cards"}
        </strong>
        <span style={cssStyle("font-size: 15px")}>
          {"After every session, a card with two dinner-table questions, shared on class WhatsApp groups."}
        </span>
      </div>
      <div style={cssStyle("background: #E3DAF5; border-radius: 24px; padding: 22px; display: flex; flex-direction: column; gap: 8px")}>
        <strong style={cssStyle("font-size: 19px")}>
          {"Parents App (optional)"}
        </strong>
        <span style={cssStyle("font-size: 15px")}>
          {"Weekly prompts for families who opt in. Never required, and separate from the school contract."}
        </span>
      </div>
    </div>
  </div>
</section>
  );
}
