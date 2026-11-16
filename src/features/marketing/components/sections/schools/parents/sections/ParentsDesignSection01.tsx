import { cssStyle } from '../../style';

export function ParentsDesignSection01() {
  return (
<section style={cssStyle("background: #FFFFFF; padding: 72px 0")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 36px")}>
    <div style={cssStyle("max-width: 760px; margin: 0 auto; text-align: center")}>
      <div className="hand" style={cssStyle("font-size: 28px; color: #C2456A")}>
        {"Our promises to you"}
      </div>
      <h2 style={cssStyle("margin: 2px 0 10px; font-weight: 900; font-size: clamp(30px, 4cqi, 46px); line-height: 1.1; color: #3D2C4A")}>
        {"Four things you can count on"}
      </h2>
    </div>
    <div style={cssStyle("display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px")}>
      <div style={cssStyle("background: #FFFFFF; border: 1px solid #F1E4E8; border-radius: 26px; padding: 22px; display: flex; flex-direction: column; gap: 10px")}>
        <span style={cssStyle("width: 52px; height: 52px; border-radius: 16px; background: #D8ECF8; display: grid; place-items: center")}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3D2C4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z">
            </path>
          </svg>
        </span>
        <strong style={cssStyle("font-size: 18px")}>
          {"You see it first"}
        </strong>
        <span style={cssStyle("font-size: 15px; color: #4A3A57")}>
          {"A parent preview before the year starts, with a facilitator to answer your questions."}
        </span>
      </div>
      <div style={cssStyle("background: #FFFFFF; border: 1px solid #F1E4E8; border-radius: 26px; padding: 22px; display: flex; flex-direction: column; gap: 10px")}>
        <span style={cssStyle("width: 52px; height: 52px; border-radius: 16px; background: #FDEFF0; display: grid; place-items: center")}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3D2C4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z">
            </path>
          </svg>
        </span>
        <strong style={cssStyle("font-size: 18px")}>
          {"Nothing explicit, ever"}
        </strong>
        <span style={cssStyle("font-size: 15px; color: #4A3A57")}>
          {"NCERT-aligned, age-right content about growing up and wellbeing."}
        </span>
      </div>
      <div style={cssStyle("background: #FFFFFF; border: 1px solid #F1E4E8; border-radius: 26px; padding: 22px; display: flex; flex-direction: column; gap: 10px")}>
        <span style={cssStyle("width: 52px; height: 52px; border-radius: 16px; background: #E3DAF5; display: grid; place-items: center")}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3D2C4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 11h14v10H5zM8 11V8a4 4 0 0 1 8 0v3">
            </path>
          </svg>
        </span>
        <strong style={cssStyle("font-size: 18px")}>
          {"No accounts for children"}
        </strong>
        <span style={cssStyle("font-size: 15px; color: #4A3A57")}>
          {"Surveys are anonymous; the school only sees group results."}
        </span>
      </div>
      <div style={cssStyle("background: #FFFFFF; border: 1px solid #F1E4E8; border-radius: 26px; padding: 22px; display: flex; flex-direction: column; gap: 10px")}>
        <span style={cssStyle("width: 52px; height: 52px; border-radius: 16px; background: #D4EFE4; display: grid; place-items: center")}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3D2C4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 8a3 3 0 1 0 0 .1M16 8a3 3 0 1 0 0 .1M3 20c0-4 2-6 5-6s5 2 5 6M11 20c0-4 2-6 5-6s5 2 5 6">
            </path>
          </svg>
        </span>
        <strong style={cssStyle("font-size: 18px")}>
          {"A teacher is always present"}
        </strong>
        <span style={cssStyle("font-size: 15px; color: #4A3A57")}>
          {"Every session has two adults, and facilitators are verified and certified."}
        </span>
      </div>
    </div>
  </div>
</section>
  );
}
