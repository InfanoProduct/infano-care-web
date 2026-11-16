import Link from 'next/link';
import { cssStyle } from '../../style';

export function PricingDesignSection02() {
  return (
<section style={cssStyle("background: #FDEFF0; padding: 72px 0")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 36px")}>
    <div style={cssStyle("display: flex; flex-wrap: wrap; justify-content: space-between; gap: 18px; align-items: flex-end")}>
      <div style={cssStyle("max-width: 760px; ")}>
        <div className="hand" style={cssStyle("font-size: 28px; color: #C2456A")}>
          {"Add-on to any package"}
        </div>
        <h2 style={cssStyle("margin: 2px 0 10px; font-weight: 900; font-size: clamp(30px, 4cqi, 46px); line-height: 1.1; color: #3D2C4A")}>
          {"MHM Compliance Pack"}
        </h2>
        <p style={cssStyle("margin: 0; font-size: 18px; color: #5E4B6B")}>
          {"Free compliant pads, dispensers, a stocked MHM corner and the logs an inspector asks for. One supplier, one restock promise, one file."}
        </p>
      </div>
      <span style={cssStyle("background: #FFFFFF; border-radius: 999px; padding: 8px 16px; font-weight: 800; font-size: 15px")}>
        {"For every girl in school, Grade 4 up"}
      </span>
    </div>
    <div style={cssStyle("display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start")}>
      <div style={cssStyle("background: #FFFFFF; border: 1px solid #F1E4E8; border-radius: 26px; overflow-x: auto; flex: 2 1 560px; min-width: 0")}>
        <table style={cssStyle("width: 100%; border-collapse: collapse; font-size: 15px; min-width: 640px")}>
          <thead>
            <tr style={cssStyle("background: #FFFFFF; text-align: left")}>
              <th style={cssStyle("padding: 14px")}>
                {"What’s included"}
              </th>
              <th style={cssStyle("padding: 14px")}>
                {"Details"}
              </th>
              <th style={cssStyle("padding: 14px")}>
                {"Who handles it"}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cssStyle("padding: 14px; border-top: 1px solid #F1E4E8; vertical-align: top")}>
                <span style={cssStyle("display: inline-flex; gap: 10px; align-items: center; font-weight: 800")}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C2456A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z">
                    </path>
                  </svg>
                  {"Free, compliant pads"}
                </span>
              </td>
              <td style={cssStyle("padding: 14px; border-top: 1px solid #F1E4E8; font-size: 15px; color: #4A3A57")}>
                {"Biodegradable, compostable pads meeting ISO 17088 read with IS 5405, the standard set in September 2026. Free to every girl."}
              </td>
              <td style={cssStyle("padding: 14px; border-top: 1px solid #F1E4E8; font-size: 14px; font-weight: 700; white-space: nowrap")}>
                {"Infano"}
              </td>
            </tr>
            <tr>
              <td style={cssStyle("padding: 14px; border-top: 1px solid #F1E4E8; vertical-align: top")}>
                <span style={cssStyle("display: inline-flex; gap: 10px; align-items: center; font-weight: 800")}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C2456A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 8h16v12H4zM4 8l2-4h12l2 4M10 12h4">
                    </path>
                  </svg>
                  {"Dispensers in girls’ toilets"}
                </span>
              </td>
              <td style={cssStyle("padding: 14px; border-top: 1px solid #F1E4E8; font-size: 15px; color: #4A3A57")}>
                {"A dispenser or vending machine inside girls’ toilets, or a named place and person where that isn’t possible."}
              </td>
              <td style={cssStyle("padding: 14px; border-top: 1px solid #F1E4E8; font-size: 14px; font-weight: 700; white-space: nowrap")}>
                {"Infano"}
              </td>
            </tr>
            <tr>
              <td style={cssStyle("padding: 14px; border-top: 1px solid #F1E4E8; vertical-align: top")}>
                <span style={cssStyle("display: inline-flex; gap: 10px; align-items: center; font-weight: 800")}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C2456A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 5h16v14H4zM8 9h8M8 13h5">
                    </path>
                  </svg>
                  {"A stocked MHM corner"}
                </span>
              </td>
              <td style={cssStyle("padding: 14px; border-top: 1px solid #F1E4E8; font-size: 15px; color: #4A3A57")}>
                {"Spare innerwear in sizes, a spare uniform, disposal bags, wipes, a heat pad and a private chair. Your nurse holds any medicine, per school policy."}
              </td>
              <td style={cssStyle("padding: 14px; border-top: 1px solid #F1E4E8; font-size: 14px; font-weight: 700; white-space: nowrap")}>
                {"Infano with your school"}
              </td>
            </tr>
            <tr>
              <td style={cssStyle("padding: 14px; border-top: 1px solid #F1E4E8; vertical-align: top")}>
                <span style={cssStyle("display: inline-flex; gap: 10px; align-items: center; font-weight: 800")}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C2456A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z">
                    </path>
                  </svg>
                  {"Safe disposal"}
                </span>
              </td>
              <td style={cssStyle("padding: 14px; border-top: 1px solid #F1E4E8; font-size: 15px; color: #4A3A57")}>
                {"A covered bin in every toilet, cleared by a local authorised vendor. We guide you and brief your cleaners, ayahs and nurse."}
              </td>
              <td style={cssStyle("padding: 14px; border-top: 1px solid #F1E4E8; font-size: 14px; font-weight: 700; white-space: nowrap")}>
                {"Your school, with our guidance"}
              </td>
            </tr>
            <tr>
              <td style={cssStyle("padding: 14px; border-top: 1px solid #F1E4E8; vertical-align: top")}>
                <span style={cssStyle("display: inline-flex; gap: 10px; align-items: center; font-weight: 800")}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C2456A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4">
                    </path>
                  </svg>
                  {"Restock within 72 hours"}
                </span>
              </td>
              <td style={cssStyle("padding: 14px; border-top: 1px solid #F1E4E8; font-size: 15px; color: #4A3A57")}>
                {"A monthly restock, plus a refill within 72 hours of any low-stock alert. Nobody waits for a pad."}
              </td>
              <td style={cssStyle("padding: 14px; border-top: 1px solid #F1E4E8; font-size: 14px; font-weight: 700; white-space: nowrap")}>
                {"Infano"}
              </td>
            </tr>
            <tr>
              <td style={cssStyle("padding: 14px; border-top: 1px solid #F1E4E8; vertical-align: top")}>
                <span style={cssStyle("display: inline-flex; gap: 10px; align-items: center; font-weight: 800")}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C2456A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5">
                    </path>
                  </svg>
                  {"Checks and logs"}
                </span>
              </td>
              <td style={cssStyle("padding: 14px; border-top: 1px solid #F1E4E8; font-size: 15px; color: #4A3A57")}>
                {"Champions check the corner every month. Supply, restock and check logs go straight into your inspection-ready file."}
              </td>
              <td style={cssStyle("padding: 14px; border-top: 1px solid #F1E4E8; font-size: 14px; font-weight: 700; white-space: nowrap")}>
                {"Champions + Infano"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <aside style={cssStyle("flex: 1 1 300px; background: #2E2240; color: #FFFFFF; border-radius: 28px; padding: 26px; display: flex; flex-direction: column; gap: 12px")}>
        <span style={cssStyle("font-size: 13px; font-weight: 800; letter-spacing: .1em; color: #F4A3B4")}>
          {"PRICING"}
        </span>
        <strong style={cssStyle("font-size: 28px; line-height: 1.15")}>
          {"Priced in your proposal"}
        </strong>
        <span style={cssStyle("font-size: 15px; color: #E7DDEE")}>
          {"Based on the number of girls, toilets and dispensers in your school."}
        </span>
        <ul style={cssStyle("margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 6px; font-size: 15px")}>
          <li>
            {"A one-time setup: dispensers, corner and bins guidance"}
          </li>
          <li>
            {"Monthly pad supply, billed quarterly in advance"}
          </li>
          <li>
            {"Setup included with Signature"}
          </li>
          <li>
            {"Available only with a programme package"}
          </li>
        </ul>
        <Link href="/schools/health-check" style={cssStyle("min-height: 56px; padding: 0 26px; border-radius: 999px; border: none; background: #C2456A; color: #FFFFFF; font-weight: 800; font-size: 17px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #F4A3B4; color: #3D2C4A")}>
          {"Ask for an MHM quote"}
        </Link>
      </aside>
    </div>
  </div>
</section>
  );
}
