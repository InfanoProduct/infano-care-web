import { cssStyle } from '../../style';

export function PricingDesignSection01() {
  return (
<section style={cssStyle("background: #FFFFFF; padding: 72px 0")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 36px")}>
    <div style={cssStyle("max-width: 760px; margin: 0 auto; text-align: center")}>
      <div className="hand" style={cssStyle("font-size: 28px; color: #C2456A")}>
        {"Compare packages"}
      </div>
      <h2 style={cssStyle("margin: 2px 0 10px; font-weight: 900; font-size: clamp(30px, 4cqi, 46px); line-height: 1.1; color: #3D2C4A")}>
        {"Most CBSE, ICSE and State-board schools choose Complete"}
      </h2>
    </div>
    <div style={cssStyle("background: #FFFFFF; border: 1px solid #F1E4E8; border-radius: 26px; overflow-x: auto")}>
      <table style={cssStyle("width: 100%; border-collapse: collapse; font-size: 15px; min-width: 820px")}>
        <thead>
          <tr>
            <th style={cssStyle("padding: 16px; text-align: left; vertical-align: bottom")}>
              {"What’s included"}
            </th>
            <th style={cssStyle("padding: 16px; text-align: center; min-width: 170px; ")}>
              <div style={cssStyle("font-size: 20px; font-weight: 900")}>
                {"Essential"}
              </div>
              <div style={cssStyle("font-size: 30px; font-weight: 900")}>
                {"₹350"}
              </div>
              <div style={cssStyle("font-size: 12px; font-weight: 700; color: #6E5B7A")}>
                {"per student · min ₹1.25 L"}
              </div>
            </th>
            <th style={cssStyle("padding: 16px; text-align: center; min-width: 170px; background: #FDEFF0")}>
              <div style={cssStyle("font-size: 20px; font-weight: 900")}>
                {"Complete ★"}
              </div>
              <div style={cssStyle("font-size: 30px; font-weight: 900")}>
                {"₹650"}
              </div>
              <div style={cssStyle("font-size: 12px; font-weight: 700; color: #6E5B7A")}>
                {"per student · min ₹2.5 L"}
              </div>
            </th>
            <th style={cssStyle("padding: 16px; text-align: center; min-width: 170px; ")}>
              <div style={cssStyle("font-size: 20px; font-weight: 900")}>
                {"Signature"}
              </div>
              <div style={cssStyle("font-size: 30px; font-weight: 900")}>
                {"₹950"}
              </div>
              <div style={cssStyle("font-size: 12px; font-weight: 700; color: #6E5B7A")}>
                {"per student · min ₹4.0 L"}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; font-weight: 700")}>
              {"Grades covered"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              {"5–8"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; background: #FFF7F8")}>
              {"4–9"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              {"4–12"}
            </td>
          </tr>
          <tr>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; font-weight: 700")}>
              {"Student touchpoints per grade per year"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              {"3"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; background: #FFF7F8")}>
              {"6 (3 Infano + 3 teacher-led)"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              {"6 + Grades 10–12 modules"}
            </td>
          </tr>
          <tr>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; font-weight: 700")}>
              {"All-staff menstrual-health sensitisation"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              {"1 / year"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; background: #FFF7F8")}>
              {"1 / year"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              {"1 / year"}
            </td>
          </tr>
          <tr>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; font-weight: 700")}>
              {"Staff mental-health training by a certified professional"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              {"2 / year"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; background: #FFF7F8")}>
              {"2 / year"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              {"2 / year + leadership"}
            </td>
          </tr>
          <tr>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; font-weight: 700")}>
              {"POCSO, child protection and anti-bullying training"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              <span style={cssStyle("color: #B9A9B8")}>
                {"—"}
              </span>
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; background: #FFF7F8")}>
              {"1 / year"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              {"1 / year"}
            </td>
          </tr>
          <tr>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; font-weight: 700")}>
              {"Parent sessions"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              {"1"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; background: #FFF7F8")}>
              {"2 + Talk Tonight cards"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              {"3 + Talk Tonight cards + 10 LIVE Cohort seats"}
            </td>
          </tr>
          <tr>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; font-weight: 700")}>
              {"Growing Up Passport for every student"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              <span style={cssStyle("color: #B9A9B8")}>
                {"—"}
              </span>
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; background: #FFF7F8")}>
              <span style={cssStyle("color: #2F7F62; font-weight: 900")}>
                {"✓"}
              </span>
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              <span style={cssStyle("color: #2F7F62; font-weight: 900")}>
                {"✓"}
              </span>
            </td>
          </tr>
          <tr>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; font-weight: 700")}>
              {"Ask-Anything Box and theme report"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              <span style={cssStyle("color: #B9A9B8")}>
                {"—"}
              </span>
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; background: #FFF7F8")}>
              <span style={cssStyle("color: #2F7F62; font-weight: 900")}>
                {"✓"}
              </span>
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              <span style={cssStyle("color: #2F7F62; font-weight: 900")}>
                {"✓"}
              </span>
            </td>
          </tr>
          <tr>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; font-weight: 700")}>
              {"Smartboard lesson packs"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              <span style={cssStyle("color: #B9A9B8")}>
                {"—"}
              </span>
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; background: #FFF7F8")}>
              <span style={cssStyle("color: #2F7F62; font-weight: 900")}>
                {"✓"}
              </span>
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              <span style={cssStyle("color: #2F7F62; font-weight: 900")}>
                {"✓"}
              </span>
            </td>
          </tr>
          <tr>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; font-weight: 700")}>
              {"Infano Champions"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              <span style={cssStyle("color: #B9A9B8")}>
                {"—"}
              </span>
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; background: #FFF7F8")}>
              <span style={cssStyle("color: #2F7F62; font-weight: 900")}>
                {"✓"}
              </span>
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              <span style={cssStyle("color: #2F7F62; font-weight: 900")}>
                {"✓ + Champions summit"}
              </span>
            </td>
          </tr>
          <tr>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; font-weight: 700")}>
              {"Mirror Survey (before and after)"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              <span style={cssStyle("color: #2F7F62; font-weight: 900")}>
                {"✓"}
              </span>
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; background: #FFF7F8")}>
              <span style={cssStyle("color: #2F7F62; font-weight: 900")}>
                {"✓ + termly pulse"}
              </span>
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              <span style={cssStyle("color: #2F7F62; font-weight: 900")}>
                {"✓ + termly pulse"}
              </span>
            </td>
          </tr>
          <tr>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; font-weight: 700")}>
              {"Inspection-ready file"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              <span style={cssStyle("color: #2F7F62; font-weight: 900")}>
                {"✓"}
              </span>
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; background: #FFF7F8")}>
              <span style={cssStyle("color: #2F7F62; font-weight: 900")}>
                {"✓"}
              </span>
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              <span style={cssStyle("color: #2F7F62; font-weight: 900")}>
                {"✓"}
              </span>
            </td>
          </tr>
          <tr>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; font-weight: 700")}>
              {"School dashboard and report"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              {"Annual summary"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; background: #FFF7F8")}>
              {"Termly"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              {"Termly + leadership review"}
            </td>
          </tr>
          <tr>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; font-weight: 700")}>
              {"Annual Impact Report + Partner School audit"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              <span style={cssStyle("color: #B9A9B8")}>
                {"—"}
              </span>
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; background: #FFF7F8")}>
              <span style={cssStyle("color: #2F7F62; font-weight: 900")}>
                {"✓"}
              </span>
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              <span style={cssStyle("color: #2F7F62; font-weight: 900")}>
                {"✓ + independent evaluation"}
              </span>
            </td>
          </tr>
          <tr>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; font-weight: 700")}>
              {"Growing Up Together Fest"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              <span style={cssStyle("color: #B9A9B8")}>
                {"—"}
              </span>
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; background: #FFF7F8")}>
              <span style={cssStyle("color: #B9A9B8")}>
                {"—"}
              </span>
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              <span style={cssStyle("color: #2F7F62; font-weight: 900")}>
                {"✓"}
              </span>
            </td>
          </tr>
          <tr>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; font-weight: 700")}>
              {"Counsellor support (monthly case consultation)"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              <span style={cssStyle("color: #B9A9B8")}>
                {"—"}
              </span>
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; background: #FFF7F8")}>
              <span style={cssStyle("color: #B9A9B8")}>
                {"—"}
              </span>
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              <span style={cssStyle("color: #2F7F62; font-weight: 900")}>
                {"✓"}
              </span>
            </td>
          </tr>
          <tr>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; font-weight: 700")}>
              {"Library school editions"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              {"Optional"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; background: #FFF7F8")}>
              {"Optional"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              {"One grade’s set included"}
            </td>
          </tr>
          <tr>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; font-weight: 700")}>
              {"MHM Compliance Pack (pads, dispensers, corner, restock)"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              {"Add-on"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; background: #FFF7F8")}>
              {"Add-on"}
            </td>
            <td style={cssStyle("padding: 12px 16px; border-top: 1px solid #F1E4E8; text-align: center; ")}>
              {"Add-on, setup included"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</section>
  );
}
