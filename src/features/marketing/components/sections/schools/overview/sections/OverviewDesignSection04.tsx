import Link from 'next/link';
import { cssStyle } from '../../style';

export function OverviewDesignSection04() {
  return (
<section style={cssStyle("background: #FDEFF0; padding: 72px 0")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 36px")}>
    <div style={cssStyle("display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 36px; align-items: center")}>
      <div style={cssStyle("display: flex; flex-direction: column; gap: 14px")}>
        <div style={cssStyle("max-width: 760px; ")}>
          <div className="hand" style={cssStyle("font-size: 28px; color: #C2456A")}>
            {"MHM Compliance Pack · add to any package"}
          </div>
          <h2 style={cssStyle("margin: 2px 0 10px; font-weight: 900; font-size: clamp(30px, 4cqi, 46px); line-height: 1.1; color: #3D2C4A")}>
            {"Free pads, a stocked corner, and the logs to prove it"}
          </h2>
        </div>
        <p style={cssStyle("margin: 0; font-size: 17px")}>
          {"Since January 2026 every school must give girls free pads, an MHM corner and safe disposal, and since September the pads must meet a new standard. We supply and look after all of it, so no girl misses class because of her period."}
        </p>
        <div style={cssStyle("background: #FFFFFF; border-radius: 18px; padding: 14px 16px; font-size: 15px; border-left: 6px solid #C2456A")}>
          <strong>
            {"For every girl, from Grade 4 up."}
          </strong>
          {" The order covers Classes 6 to 12, but periods don’t always wait, so the pack covers every girl in your school."}
        </div>
      </div>
      <div style={cssStyle("position: relative; height: 360px; border-radius: 28px; background: #F9D5D3; overflow: hidden; ")}>
        <img src="/schools-template/img/sch-12.webp" alt="A calm MHM corner in a school with a pad dispenser and a stocked shelf" loading="lazy" style={cssStyle("position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 50%; display: block")} />
      </div>
    </div>
    <div style={cssStyle("display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px")}>
      <div className="lift" style={cssStyle("background: #FFFFFF; border: 1px solid #F1E4E8; border-radius: 26px; padding: 22px; display: flex; flex-direction: column; gap: 10px")}>
        <span style={cssStyle("width: 56px; height: 56px; border-radius: 18px; background: #FDEFF0; display: grid; place-items: center")}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3D2C4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z">
            </path>
          </svg>
        </span>
        <strong style={cssStyle("font-size: 19px")}>
          {"Free, compliant pads"}
        </strong>
        <span style={cssStyle("font-size: 15px; color: #4A3A57")}>
          {"Biodegradable, compostable pads meeting ISO 17088 read with IS 5405, the standard set in September 2026. Free to every girl."}
        </span>
      </div>
      <div className="lift" style={cssStyle("background: #FFFFFF; border: 1px solid #F1E4E8; border-radius: 26px; padding: 22px; display: flex; flex-direction: column; gap: 10px")}>
        <span style={cssStyle("width: 56px; height: 56px; border-radius: 18px; background: #D8ECF8; display: grid; place-items: center")}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3D2C4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 8h16v12H4zM4 8l2-4h12l2 4M10 12h4">
            </path>
          </svg>
        </span>
        <strong style={cssStyle("font-size: 19px")}>
          {"Dispensers in girls’ toilets"}
        </strong>
        <span style={cssStyle("font-size: 15px; color: #4A3A57")}>
          {"A dispenser or vending machine inside girls’ toilets, or a named place and person where that isn’t possible."}
        </span>
      </div>
      <div className="lift" style={cssStyle("background: #FFFFFF; border: 1px solid #F1E4E8; border-radius: 26px; padding: 22px; display: flex; flex-direction: column; gap: 10px")}>
        <span style={cssStyle("width: 56px; height: 56px; border-radius: 18px; background: #FFF4C7; display: grid; place-items: center")}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3D2C4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 5h16v14H4zM8 9h8M8 13h5">
            </path>
          </svg>
        </span>
        <strong style={cssStyle("font-size: 19px")}>
          {"A stocked MHM corner"}
        </strong>
        <span style={cssStyle("font-size: 15px; color: #4A3A57")}>
          {"Spare innerwear in sizes, a spare uniform, disposal bags, wipes, a heat pad and a private chair. Your nurse holds any medicine, per school policy."}
        </span>
      </div>
      <div className="lift" style={cssStyle("background: #FFFFFF; border: 1px solid #F1E4E8; border-radius: 26px; padding: 22px; display: flex; flex-direction: column; gap: 10px")}>
        <span style={cssStyle("width: 56px; height: 56px; border-radius: 18px; background: #D4EFE4; display: grid; place-items: center")}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3D2C4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z">
            </path>
          </svg>
        </span>
        <strong style={cssStyle("font-size: 19px")}>
          {"Safe disposal"}
        </strong>
        <span style={cssStyle("font-size: 15px; color: #4A3A57")}>
          {"A covered bin in every toilet, cleared by a local authorised vendor. We guide you and brief your cleaners, ayahs and nurse."}
        </span>
      </div>
      <div className="lift" style={cssStyle("background: #FFFFFF; border: 1px solid #F1E4E8; border-radius: 26px; padding: 22px; display: flex; flex-direction: column; gap: 10px")}>
        <span style={cssStyle("width: 56px; height: 56px; border-radius: 18px; background: #FFE3CC; display: grid; place-items: center")}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3D2C4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4">
            </path>
          </svg>
        </span>
        <strong style={cssStyle("font-size: 19px")}>
          {"Restock within 72 hours"}
        </strong>
        <span style={cssStyle("font-size: 15px; color: #4A3A57")}>
          {"A monthly restock, plus a refill within 72 hours of any low-stock alert. Nobody waits for a pad."}
        </span>
      </div>
      <div className="lift" style={cssStyle("background: #FFFFFF; border: 1px solid #F1E4E8; border-radius: 26px; padding: 22px; display: flex; flex-direction: column; gap: 10px")}>
        <span style={cssStyle("width: 56px; height: 56px; border-radius: 18px; background: #E3DAF5; display: grid; place-items: center")}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3D2C4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5">
            </path>
          </svg>
        </span>
        <strong style={cssStyle("font-size: 19px")}>
          {"Checks and logs"}
        </strong>
        <span style={cssStyle("font-size: 15px; color: #4A3A57")}>
          {"Champions check the corner every month. Supply, restock and check logs go straight into your inspection-ready file."}
        </span>
      </div>
    </div>
    <div style={cssStyle("display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; align-items: center")}>
      <Link href="/schools/packages" style={cssStyle("min-height: 56px; padding: 0 24px; border-radius: 999px; border: 2px solid #3D2C4A; background: transparent; color: #3D2C4A; font-weight: 800; font-size: 17px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center")}>
        {"See what’s included"}
      </Link>
      <span style={cssStyle("font-size: 14px; color: #6E5B7A")}>
        {"Priced in your proposal, based on your girls and toilets."}
      </span>
    </div>
  </div>
</section>
  );
}
