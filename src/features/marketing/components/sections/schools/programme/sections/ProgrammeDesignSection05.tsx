import { cssStyle } from '../../style';

export function ProgrammeDesignSection05() {
  return (
<section style={cssStyle("background: transparent; padding: 72px 0")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 36px")}>
    <div style={cssStyle("display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; align-items: center")}>
      <div style={cssStyle("position: relative; height: 320px; border-radius: 28px; background: #D4EFE4; overflow: hidden; ")}>
        <img src="/schools-template/img/sch-07.webp" alt="Diverse students including a student with a hearing aid, smiling" loading="lazy" style={cssStyle("position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 50%; display: block")} />
      </div>
      <div style={cssStyle("display: flex; flex-direction: column; gap: 14px")}>
        <div style={cssStyle("max-width: 760px; ")}>
          <div className="hand" style={cssStyle("font-size: 28px; color: #C2456A")}>
            {"Every student, included"}
          </div>
          <h2 style={cssStyle("margin: 2px 0 10px; font-weight: 900; font-size: clamp(30px, 4cqi, 46px); line-height: 1.1; color: #3D2C4A")}>
            {"Room for every child"}
          </h2>
        </div>
        <ul style={cssStyle("margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 8px")}>
          <li>
            {"A student uncomfortable in either Apart group can, with parent and counsellor agreement, join the session that suits them or get a one-to-one recap."}
          </li>
          <li>
            {"Accessible formats for students with disabilities: large print, visual aids, sign-supported videos."}
          </li>
          <li>
            {"Any student can opt out of an Apart session at a parent’s request; the content stays available at home."}
          </li>
          <li>
            {"Library tie-in: "}
            <em>
              {"My Body, My Boundary"}
            </em>
            {" (Grades 4–5), "}
            <em>
              {"Gigi: The Awkward Age"}
            </em>
            {" (Grades 5–8), "}
            <em>
              {"Pressure Proof"}
            </em>
            {" (Grade 9)."}
          </li>
        </ul>
      </div>
    </div>
  </div>
</section>
  );
}
