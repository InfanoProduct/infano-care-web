import Link from 'next/link';
import { cssStyle } from '../../style';

export function OverviewDesignSection09() {
  return (
<section style={cssStyle("background: transparent; padding: 72px 0")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 36px")}>
    <div style={cssStyle("max-width: 760px; margin: 0 auto; text-align: center")}>
      <div className="hand" style={cssStyle("font-size: 28px; color: #C2456A")}>
        {"Packages"}
      </div>
      <h2 style={cssStyle("margin: 2px 0 10px; font-weight: 900; font-size: clamp(30px, 4cqi, 46px); line-height: 1.1; color: #3D2C4A")}>
        {"Pick the depth that fits your school"}
      </h2>
      <p style={cssStyle("margin: 0; font-size: 18px; color: #5E4B6B")}>
        {"Every package includes staff training, the Mirror Survey and an inspection-ready file. Add the MHM Compliance Pack to any of them."}
      </p>
    </div>
    <div style={cssStyle("display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; padding-top: 14px")}>
      <div className="lift" style={cssStyle("position: relative; background: #FFFFFF; border-radius: 28px; padding: 26px; display: flex; flex-direction: column; gap: 10px; border: 1px solid #F1E4E8")}>
        <span style={cssStyle("display: inline-block; background: #E3DAF5; color: #5A4385; border-radius: 999px; padding: 3px 12px; font-size: 12px; font-weight: 800; letter-spacing: .06em")}>
          {"GRADES 5 TO 8"}
        </span>
        <strong style={cssStyle("font-size: 22px; line-height: 1.2")}>
          {"Essential"}
        </strong>
        <span style={cssStyle("font-size: 15px; font-weight: 700; color: #5E4B6B")}>
          {"Get the essentials in place"}
        </span>
        <ul style={cssStyle("margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 15px")}>
          <li style={cssStyle("display: flex; gap: 8px; align-items: flex-start")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#24735A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12l5 5 9-10">
              </path>
            </svg>
            <span>
              {"3 sessions per grade each year"}
            </span>
          </li>
          <li style={cssStyle("display: flex; gap: 8px; align-items: flex-start")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#24735A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12l5 5 9-10">
              </path>
            </svg>
            <span>
              {"Staff menstrual-health and mental-health training"}
            </span>
          </li>
          <li style={cssStyle("display: flex; gap: 8px; align-items: flex-start")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#24735A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12l5 5 9-10">
              </path>
            </svg>
            <span>
              {"Mirror Survey, before and after"}
            </span>
          </li>
          <li style={cssStyle("display: flex; gap: 8px; align-items: flex-start")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#24735A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12l5 5 9-10">
              </path>
            </svg>
            <span>
              {"Inspection-ready file"}
            </span>
          </li>
        </ul>
      </div>
      <div className="lift" style={cssStyle("position: relative; background: #FFFFFF; border-radius: 28px; padding: 26px; display: flex; flex-direction: column; gap: 10px; border: 3px solid #C2456A")}>
        <span style={cssStyle("position: absolute; top: -14px; left: 24px; background: #C2456A; color: #FFFFFF; border-radius: 999px; padding: 4px 14px; font-size: 12px; font-weight: 900; letter-spacing: .08em")}>
          {"MOST CHOSEN"}
        </span>
        <span style={cssStyle("display: inline-block; background: #E3DAF5; color: #5A4385; border-radius: 999px; padding: 3px 12px; font-size: 12px; font-weight: 800; letter-spacing: .06em")}>
          {"GRADES 4 TO 9"}
        </span>
        <strong style={cssStyle("font-size: 22px; line-height: 1.2")}>
          {"Complete"}
        </strong>
        <span style={cssStyle("font-size: 15px; font-weight: 700; color: #5E4B6B")}>
          {"The full Growing Up Together programme"}
        </span>
        <ul style={cssStyle("margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 15px")}>
          <li style={cssStyle("display: flex; gap: 8px; align-items: flex-start")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#24735A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12l5 5 9-10">
              </path>
            </svg>
            <span>
              {"6 sessions per grade each year"}
            </span>
          </li>
          <li style={cssStyle("display: flex; gap: 8px; align-items: flex-start")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#24735A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12l5 5 9-10">
              </path>
            </svg>
            <span>
              {"Passport, Ask-Anything Box and Champions"}
            </span>
          </li>
          <li style={cssStyle("display: flex; gap: 8px; align-items: flex-start")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#24735A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12l5 5 9-10">
              </path>
            </svg>
            <span>
              {"Parent sessions and Talk Tonight cards"}
            </span>
          </li>
          <li style={cssStyle("display: flex; gap: 8px; align-items: flex-start")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#24735A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12l5 5 9-10">
              </path>
            </svg>
            <span>
              {"Termly dashboard, Impact Report, Partner School audit"}
            </span>
          </li>
        </ul>
      </div>
      <div className="lift" style={cssStyle("position: relative; background: #FFFFFF; border-radius: 28px; padding: 26px; display: flex; flex-direction: column; gap: 10px; border: 1px solid #F1E4E8")}>
        <span style={cssStyle("display: inline-block; background: #E3DAF5; color: #5A4385; border-radius: 999px; padding: 3px 12px; font-size: 12px; font-weight: 800; letter-spacing: .06em")}>
          {"GRADES 4 TO 12"}
        </span>
        <strong style={cssStyle("font-size: 22px; line-height: 1.2")}>
          {"Signature"}
        </strong>
        <span style={cssStyle("font-size: 15px; font-weight: 700; color: #5E4B6B")}>
          {"For whole-school wellbeing leaders"}
        </span>
        <ul style={cssStyle("margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 15px")}>
          <li style={cssStyle("display: flex; gap: 8px; align-items: flex-start")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#24735A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12l5 5 9-10">
              </path>
            </svg>
            <span>
              {"Everything in Complete"}
            </span>
          </li>
          <li style={cssStyle("display: flex; gap: 8px; align-items: flex-start")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#24735A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12l5 5 9-10">
              </path>
            </svg>
            <span>
              {"Modules for Grades 10 to 12"}
            </span>
          </li>
          <li style={cssStyle("display: flex; gap: 8px; align-items: flex-start")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#24735A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12l5 5 9-10">
              </path>
            </svg>
            <span>
              {"Monthly counsellor case consultation"}
            </span>
          </li>
          <li style={cssStyle("display: flex; gap: 8px; align-items: flex-start")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#24735A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12l5 5 9-10">
              </path>
            </svg>
            <span>
              {"Growing Up Together Fest and independent evaluation"}
            </span>
          </li>
        </ul>
      </div>
      <div className="lift" style={cssStyle("position: relative; background: #FDEFF0; border-radius: 28px; padding: 26px; display: flex; flex-direction: column; gap: 10px; border: 2px dashed #C2456A")}>
        <span style={cssStyle("display: inline-block; background: #FFF4C7; color: #8A6410; border-radius: 999px; padding: 3px 12px; font-size: 12px; font-weight: 800; letter-spacing: .06em")}>
          {"ADD-ON · EVERY GIRL IN SCHOOL"}
        </span>
        <strong style={cssStyle("font-size: 22px; line-height: 1.2")}>
          {"MHM Compliance Pack"}
        </strong>
        <span style={cssStyle("font-size: 15px; font-weight: 700; color: #5E4B6B")}>
          {"Add to any package"}
        </span>
        <ul style={cssStyle("margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 15px")}>
          <li style={cssStyle("display: flex; gap: 8px; align-items: flex-start")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#24735A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12l5 5 9-10">
              </path>
            </svg>
            <span>
              {"Free, compliant pads and dispensers"}
            </span>
          </li>
          <li style={cssStyle("display: flex; gap: 8px; align-items: flex-start")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#24735A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12l5 5 9-10">
              </path>
            </svg>
            <span>
              {"A stocked MHM corner"}
            </span>
          </li>
          <li style={cssStyle("display: flex; gap: 8px; align-items: flex-start")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#24735A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12l5 5 9-10">
              </path>
            </svg>
            <span>
              {"Restock within 72 hours"}
            </span>
          </li>
          <li style={cssStyle("display: flex; gap: 8px; align-items: flex-start")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#24735A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12l5 5 9-10">
              </path>
            </svg>
            <span>
              {"Monthly checks and logs"}
            </span>
          </li>
        </ul>
      </div>
    </div>
    <div style={cssStyle("display: flex; flex-wrap: wrap; justify-content: center; gap: 12px")}>
      <Link href="/schools/packages" style={cssStyle("min-height: 56px; padding: 0 24px; border-radius: 999px; border: 2px solid #3D2C4A; background: transparent; color: #3D2C4A; font-weight: 800; font-size: 17px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center")}>
        {"Compare packages and pricing"}
      </Link>
    </div>
  </div>
</section>
  );
}
