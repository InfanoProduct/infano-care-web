import { cssStyle } from '../../style';

export function OverviewDesignSection02() {
  return (
<section style={cssStyle("background: #FFFFFF; padding: 72px 0")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 36px")}>
    <div style={cssStyle("max-width: 760px; margin: 0 auto; text-align: center")}>
      <div className="hand" style={cssStyle("font-size: 28px; color: #C2456A")}>
        {"Sound familiar?"}
      </div>
      <h2 style={cssStyle("margin: 2px 0 10px; font-weight: 900; font-size: clamp(30px, 4cqi, 46px); line-height: 1.1; color: #3D2C4A")}>
        {"What principals tell us"}
      </h2>
    </div>
    <div style={cssStyle("display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 22px")}>
      <div style={cssStyle("background: #FFF4C7; transform: rotate(-2deg); border-radius: 6px 6px 22px 6px; padding: 20px 18px 24px; box-shadow: 0 10px 20px rgba(61,44,74,.08)")}>
        <span className="hand" style={cssStyle("font-size: 25px; line-height: 1.2; color: #3D2C4A")}>
          {"“We got the circular, but no one knows how to teach this, especially to boys.”"}
        </span>
      </div>
      <div style={cssStyle("background: #FDEFF0; transform: rotate(1.5deg); border-radius: 6px 6px 22px 6px; padding: 20px 18px 24px; box-shadow: 0 10px 20px rgba(61,44,74,.08)")}>
        <span className="hand" style={cssStyle("font-size: 25px; line-height: 1.2; color: #3D2C4A")}>
          {"“Our counsellor is one person for 1,200 children.”"}
        </span>
      </div>
      <div style={cssStyle("background: #D8ECF8; transform: rotate(-1deg); border-radius: 6px 6px 22px 6px; padding: 20px 18px 24px; box-shadow: 0 10px 20px rgba(61,44,74,.08)")}>
        <span className="hand" style={cssStyle("font-size: 25px; line-height: 1.2; color: #3D2C4A")}>
          {"“Parents may object. We can’t be in the newspapers.”"}
        </span>
      </div>
      <div style={cssStyle("background: #D4EFE4; transform: rotate(2deg); border-radius: 6px 6px 22px 6px; padding: 20px 18px 24px; box-shadow: 0 10px 20px rgba(61,44,74,.08)")}>
        <span className="hand" style={cssStyle("font-size: 25px; line-height: 1.2; color: #3D2C4A")}>
          {"“There is no free period in the timetable.”"}
        </span>
      </div>
      <div style={cssStyle("background: #E3DAF5; transform: rotate(-1.5deg); border-radius: 6px 6px 22px 6px; padding: 20px 18px 24px; box-shadow: 0 10px 20px rgba(61,44,74,.08)")}>
        <span className="hand" style={cssStyle("font-size: 25px; line-height: 1.2; color: #3D2C4A")}>
          {"“We need proof for the inspector, not just photos.”"}
        </span>
      </div>
      <div style={cssStyle("background: #FFE3CC; transform: rotate(1deg); border-radius: 6px 6px 22px 6px; padding: 20px 18px 24px; box-shadow: 0 10px 20px rgba(61,44,74,.08)")}>
        <span className="hand" style={cssStyle("font-size: 25px; line-height: 1.2; color: #3D2C4A")}>
          {"“Our male teachers are uncomfortable. Some female teachers too.”"}
        </span>
      </div>
    </div>
    <div style={cssStyle("text-align: center; font-size: clamp(22px, 2.6cqi, 30px); font-weight: 900")}>
      {"Today it’s a pad vendor, a one-off brand talk and an overloaded counsellor."}
      <br />
      <span style={cssStyle("color: #C2456A")}>
        {"Infano gives you one programme, one file and one report."}
      </span>
    </div>
  </div>
</section>
  );
}
