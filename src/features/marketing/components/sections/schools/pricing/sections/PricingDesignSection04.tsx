import { cssStyle } from '../../style';

export function PricingDesignSection04() {
  return (
<section style={cssStyle("background: #FFFFFF; padding: 72px 0")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 36px")}>
    <div style={cssStyle("max-width: 760px; margin: 0 auto; text-align: center")}>
      <div className="hand" style={cssStyle("font-size: 28px; color: #C2456A")}>
        {"Making it fit your budget"}
      </div>
      <h2 style={cssStyle("margin: 2px 0 10px; font-weight: 900; font-size: clamp(30px, 4cqi, 46px); line-height: 1.1; color: #3D2C4A")}>
        {"Four ways schools fund it"}
      </h2>
    </div>
    <div style={cssStyle("display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px")}>
      <div style={cssStyle("background: #D8ECF8; border-radius: 24px; padding: 22px; display: flex; flex-direction: column; gap: 8px")}>
        <strong style={cssStyle("font-size: 18px")}>
          {"Your health and wellness budget"}
        </strong>
        <span style={cssStyle("font-size: 15px")}>
          {"Many schools already budget for wellness sessions and counselling."}
        </span>
      </div>
      <div style={cssStyle("background: #FFF4C7; border-radius: 24px; padding: 22px; display: flex; flex-direction: column; gap: 8px")}>
        <strong style={cssStyle("font-size: 18px")}>
          {"A per-student wellness fee"}
        </strong>
        <span style={cssStyle("font-size: 15px")}>
          {"Some schools add a wellness line to annual fees. Your decision."}
        </span>
      </div>
      <div style={cssStyle("background: #FFE3CC; border-radius: 24px; padding: 22px; display: flex; flex-direction: column; gap: 8px")}>
        <strong style={cssStyle("font-size: 18px")}>
          {"Supply you must buy anyway"}
        </strong>
        <span style={cssStyle("font-size: 15px")}>
          {"Free pads and an MHM corner are now required, so the MHM Compliance Pack replaces a cost you already have."}
        </span>
      </div>
      <div style={cssStyle("background: #E3DAF5; border-radius: 24px; padding: 22px; display: flex; flex-direction: column; gap: 8px")}>
        <strong style={cssStyle("font-size: 18px")}>
          {"CSR co-funding"}
        </strong>
        <span style={cssStyle("font-size: 15px")}>
          {"Partner with a company to co-fund the programme for a government school too."}
        </span>
      </div>
    </div>
  </div>
</section>
  );
}
