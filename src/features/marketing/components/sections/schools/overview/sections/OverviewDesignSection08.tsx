import { cssStyle } from '../../style';

export function OverviewDesignSection08() {
  return (
<section style={cssStyle("background: #2E2240; color: #FFFFFF; padding: 72px 0")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 36px")}>
    <div style={cssStyle("max-width: 760px; margin: 0 auto; text-align: center")}>
      <div className="hand" style={cssStyle("font-size: 28px; color: #F4A3B4")}>
        {"Safe by design"}
      </div>
      <h2 style={cssStyle("margin: 2px 0 10px; font-weight: 900; font-size: clamp(30px, 4cqi, 46px); line-height: 1.1; color: #FFFFFF")}>
        {"Built for sensitive topics, in a real classroom"}
      </h2>
      <p style={cssStyle("margin: 0; font-size: 18px; color: #E7DDEE")}>
        {"Nothing explicit. Age-right and NCERT-aligned. Every word reviewed by our clinical and child-safety experts."}
      </p>
    </div>
    <div style={cssStyle("display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px")}>
      <div style={cssStyle("background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.14); border-radius: 24px; padding: 22px; display: flex; flex-direction: column; gap: 10px")}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#F4A3B4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 8a3 3 0 1 0 0 .1M16 8a3 3 0 1 0 0 .1M3 20c0-4 2-6 5-6s5 2 5 6M11 20c0-4 2-6 5-6s5 2 5 6">
          </path>
        </svg>
        <strong style={cssStyle("font-size: 19px")}>
          {"Two adults, always"}
        </strong>
        <span style={cssStyle("font-size: 15px; color: #E7DDEE")}>
          {"A class teacher is present in every session. Facilitators are police-verified and certified over 40 hours."}
        </span>
      </div>
      <div style={cssStyle("background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.14); border-radius: 24px; padding: 22px; display: flex; flex-direction: column; gap: 10px")}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#F4A3B4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 11h14v10H5zM8 11V8a4 4 0 0 1 8 0v3">
          </path>
        </svg>
        <strong style={cssStyle("font-size: 19px")}>
          {"No student logins"}
        </strong>
        <span style={cssStyle("font-size: 15px; color: #E7DDEE")}>
          {"We never collect students’ names or roll numbers. Surveys are anonymous, reported for groups of 10+."}
        </span>
      </div>
      <div style={cssStyle("background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.14); border-radius: 24px; padding: 22px; display: flex; flex-direction: column; gap: 10px")}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#F4A3B4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z">
          </path>
        </svg>
        <strong style={cssStyle("font-size: 19px")}>
          {"A safeguarding protocol"}
        </strong>
        <span style={cssStyle("font-size: 15px; color: #E7DDEE")}>
          {"Any disclosure goes to your designated safeguarding lead the same day, following POCSO procedure."}
        </span>
      </div>
      <div style={cssStyle("background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.14); border-radius: 24px; padding: 22px; display: flex; flex-direction: column; gap: 10px")}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#F4A3B4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z">
          </path>
        </svg>
        <strong style={cssStyle("font-size: 19px")}>
          {"Parents see it first"}
        </strong>
        <span style={cssStyle("font-size: 15px; color: #E7DDEE")}>
          {"A parent preview before the year starts, opt-in letters for sensitive modules, and “growing up and wellbeing” language throughout."}
        </span>
      </div>
    </div>
  </div>
</section>
  );
}
