import Link from 'next/link';
import { cssStyle } from '../../style';

export function OverviewDesignSection00() {
  return (
<section style={cssStyle("position: relative; background: #2E2240; color: #FFFFFF; overflow: hidden")}>
  {" "}
  <svg aria-hidden="true" width="100%" height="100%" style={cssStyle("position: absolute; inset: 0; opacity: .08")}>
    <defs>
      <pattern id="sxdots" width="28" height="28" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.6" fill="#FFFFFF">
        </circle>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#sxdots)">
    </rect>
  </svg>
  {" "}
  <div style={cssStyle("position: relative; max-width: 1200px; margin: 0 auto; padding: 64px 24px 80px; display: flex; flex-wrap: wrap; gap: 44px; align-items: center")}>
    {" "}
    <div style={cssStyle("flex: 1 1 480px; display: flex; flex-direction: column; gap: 20px")}>
      {" "}
      <span style={cssStyle("display: inline-block; background: rgba(255,255,255,.14); color: #FFFFFF; border-radius: 999px; padding: 3px 12px; font-size: 12px; font-weight: 800; letter-spacing: .06em")}>
        {"INFANO FOR SCHOOLS · CO-ED · GRADES 4 TO 9"}
      </span>
      {" "}
      <h1 style={cssStyle("margin: 0; font-weight: 900; font-size: clamp(44px, 6.4cqi, 80px); line-height: 1.02")}>
        {"Growing Up "}
        <span style={cssStyle("color: #F4A3B4")}>
          {"Together"}
        </span>
      </h1>
      {" "}
      <p style={cssStyle("margin: 0; font-size: 20px; color: #E7DDEE; max-width: 560px")}>
        {"A done-for-you puberty, menstrual-health and wellbeing programme for Grades 4 to 9. Boys and girls learn the basics "}
        <strong style={cssStyle("color: #FFFFFF")}>
          {"together"}
        </strong>
        {", the private things "}
        <strong style={cssStyle("color: #FFFFFF")}>
          {"apart"}
        </strong>
        {", and respect "}
        <strong style={cssStyle("color: #FFFFFF")}>
          {"together again"}
        </strong>
        {". Your school stays inspection-ready, and parents see the change every term."}
      </p>
      {" "}
      <div style={cssStyle("display: flex; flex-wrap: wrap; gap: 12px")}>
        <Link href="/schools/health-check" style={cssStyle("min-height: 56px; padding: 0 26px; border-radius: 999px; border: none; background: #C2456A; color: #FFFFFF; font-weight: 800; font-size: 17px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #F4A3B4; color: #3D2C4A")}>
          {"Book a free Health Check"}
        </Link>
        <Link href="/schools/programme" style={cssStyle("min-height: 56px; padding: 0 24px; border-radius: 999px; border: 2px solid #3D2C4A; background: transparent; color: #3D2C4A; font-weight: 800; font-size: 17px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; border-color: #FFFFFF; color: #FFFFFF")}>
          {"See the programme"}
        </Link>
      </div>
      {" "}
      <div style={cssStyle("display: flex; flex-wrap: wrap; gap: 8px 18px; font-size: 14px; font-weight: 700; color: #E7DDEE")}>
        <span style={cssStyle("display: inline-flex; gap: 6px; align-items: center")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7FC3A3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12l5 5 9-10">
            </path>
          </svg>
          {"Co-ed by design"}
        </span>
        <span style={cssStyle("display: inline-flex; gap: 6px; align-items: center")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7FC3A3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12l5 5 9-10">
            </path>
          </svg>
          {"NCERT-aligned"}
        </span>
        <span style={cssStyle("display: inline-flex; gap: 6px; align-items: center")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7FC3A3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12l5 5 9-10">
            </path>
          </svg>
          {"No student logins"}
        </span>
        <span style={cssStyle("display: inline-flex; gap: 6px; align-items: center")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7FC3A3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12l5 5 9-10">
            </path>
          </svg>
          {"Verified facilitators"}
        </span>
      </div>
      {" "}
    </div>
    {" "}
    <div style={cssStyle("flex: 1 1 420px; position: relative; min-height: 460px")}>
      {" "}
      <div style={cssStyle("position: relative; height: 460px; border-radius: 28px; background: #4A3A5C; overflow: hidden; ")}>
        <img src="/schools-template/img/sch-01.webp" alt="Co-ed class in a circle with a facilitator" loading="lazy" style={cssStyle("position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 62% 50%; display: block")} />
      </div>
      {" "}
      <div className="float" style={cssStyle("--r: -6deg; position: absolute; left: -14px; top: 30px; background: #FFF4C7; color: #3D2C4A; border-radius: 18px; padding: 12px 14px; width: 180px; box-shadow: 0 16px 30px rgba(0,0,0,.25)")}>
        <div className="hand" style={cssStyle("font-size: 22px; line-height: 1")}>
          {"Ask-Anything Box"}
        </div>
        <div style={cssStyle("font-size: 13px")}>
          {"“Why do only girls get periods?” · answered next class"}
        </div>
      </div>
      {" "}
      <div className="float f2" style={cssStyle("--r: 5deg; position: absolute; right: -10px; top: 170px; background: #FFFFFF; color: #3D2C4A; border-radius: 18px; padding: 12px 14px; width: 190px; box-shadow: 0 16px 30px rgba(0,0,0,.25)")}>
        <div style={cssStyle("font-size: 11px; font-weight: 800; letter-spacing: .08em; color: #A8365A")}>
          {"TALK TONIGHT"}
        </div>
        <div style={cssStyle("font-size: 14px; font-weight: 700")}>
          {"Ask at dinner: “What surprised you today?”"}
        </div>
      </div>
      {" "}
      <div className="float f3" style={cssStyle("--r: -10deg; position: absolute; left: 30px; bottom: -6px; width: 104px; height: 104px; border-radius: 50%; border: 4px dashed #F4A3B4; display: grid; place-items: center; text-align: center; background: rgba(46,34,64,.85); font-size: 12px; font-weight: 800; line-height: 1.2; color: #FFFFFF")}>
        {"PASSPORT"}
        <br />
        {"STAMPED"}
        <br />
        {"GRADE 6"}
      </div>
      {" "}
    </div>
    {" "}
  </div>
  {" "}
</section>
  );
}
