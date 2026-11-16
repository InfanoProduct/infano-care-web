import { cssStyle } from '../../style';

export function ProgrammeDesignSection03() {
  return (
<section style={cssStyle("background: transparent; padding: 72px 0")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 36px")}>
    <div style={cssStyle("max-width: 760px; margin: 0 auto; text-align: center")}>
      <div className="hand" style={cssStyle("font-size: 28px; color: #C2456A")}>
        {"For your staff"}
      </div>
      <h2 style={cssStyle("margin: 2px 0 10px; font-weight: 900; font-size: clamp(30px, 4cqi, 46px); line-height: 1.1; color: #3D2C4A")}>
        {"Every adult in the building, ready"}
      </h2>
    </div>
    <div style={cssStyle("background: #FFFFFF; border: 1px solid #F1E4E8; border-radius: 26px; overflow-x: auto")}>
      <table style={cssStyle("width: 100%; border-collapse: collapse; font-size: 15px; min-width: 680px")}>
        <thead>
          <tr style={cssStyle("background: #FDEFF0; text-align: left")}>
            <th style={cssStyle("padding: 12px")}>
              {"Module"}
            </th>
            <th style={cssStyle("padding: 12px")}>
              {"Who"}
            </th>
            <th style={cssStyle("padding: 12px")}>
              {"When"}
            </th>
            <th style={cssStyle("padding: 12px")}>
              {"Delivered by"}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={cssStyle("padding: 12px; border-top: 1px solid #F1E4E8; font-weight: 700")}>
              {"Menstrual health and the “first 5 minutes” protocol"}
            </td>
            <td style={cssStyle("padding: 12px; border-top: 1px solid #F1E4E8")}>
              {"All teachers, male and female; support staff"}
            </td>
            <td style={cssStyle("padding: 12px; border-top: 1px solid #F1E4E8")}>
              {"Apr–May"}
            </td>
            <td style={cssStyle("padding: 12px; border-top: 1px solid #F1E4E8")}>
              {"Infano trainer"}
            </td>
          </tr>
          <tr>
            <td style={cssStyle("padding: 12px; border-top: 1px solid #F1E4E8; font-weight: 700")}>
              {"Psychological first aid, warning signs, referral"}
            </td>
            <td style={cssStyle("padding: 12px; border-top: 1px solid #F1E4E8")}>
              {"All teaching and non-teaching staff"}
            </td>
            <td style={cssStyle("padding: 12px; border-top: 1px solid #F1E4E8")}>
              {"Twice a year (Jun, Nov)"}
            </td>
            <td style={cssStyle("padding: 12px; border-top: 1px solid #F1E4E8")}>
              {"Certified mental-health professional"}
            </td>
          </tr>
          <tr>
            <td style={cssStyle("padding: 12px; border-top: 1px solid #F1E4E8; font-weight: 700")}>
              {"POCSO, child protection, bullying and cyberbullying"}
            </td>
            <td style={cssStyle("padding: 12px; border-top: 1px solid #F1E4E8")}>
              {"All teachers; bus and security staff (short version)"}
            </td>
            <td style={cssStyle("padding: 12px; border-top: 1px solid #F1E4E8")}>
              {"Once a year"}
            </td>
            <td style={cssStyle("padding: 12px; border-top: 1px solid #F1E4E8")}>
              {"Infano trainer"}
            </td>
          </tr>
          <tr>
            <td style={cssStyle("padding: 12px; border-top: 1px solid #F1E4E8; font-weight: 700")}>
              {"Champions training"}
            </td>
            <td style={cssStyle("padding: 12px; border-top: 1px solid #F1E4E8")}>
              {"2 teacher Champions"}
            </td>
            <td style={cssStyle("padding: 12px; border-top: 1px solid #F1E4E8")}>
              {"Apr + Oct refresher"}
            </td>
            <td style={cssStyle("padding: 12px; border-top: 1px solid #F1E4E8")}>
              {"Infano"}
            </td>
          </tr>
          <tr>
            <td style={cssStyle("padding: 12px; border-top: 1px solid #F1E4E8; font-weight: 700")}>
              {"MHM briefing"}
            </td>
            <td style={cssStyle("padding: 12px; border-top: 1px solid #F1E4E8")}>
              {"Cleaners, ayahs, nurse"}
            </td>
            <td style={cssStyle("padding: 12px; border-top: 1px solid #F1E4E8")}>
              {"Apr"}
            </td>
            <td style={cssStyle("padding: 12px; border-top: 1px solid #F1E4E8")}>
              {"Infano ops"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</section>
  );
}
