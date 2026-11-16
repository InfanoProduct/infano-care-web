import { cssStyle } from '../../style';

export function RequirementsDesignSection02() {
  return (
<section style={cssStyle("background: transparent; padding: 72px 0")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 36px")}>
    <div style={cssStyle("display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; align-items: center")}>
      <div style={cssStyle("position: relative; height: 340px; border-radius: 28px; background: #FFE3CC; overflow: hidden; ")}>
        <img src="/schools-template/img/sch-08.webp" alt="Clipboard checklist and anonymous survey slips on a school desk" loading="lazy" style={cssStyle("position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 50%; display: block")} />
      </div>
      {" "}
      <div style={cssStyle("background: #FFF4C7; border-radius: 30px; padding: 30px; display: flex; flex-direction: column; gap: 12px")}>
        <div className="hand" style={cssStyle("font-size: 28px; color: #C2456A")}>
          {"The inspection reality"}
        </div>
        <h2 style={cssStyle("margin: 0; font-weight: 900; font-size: clamp(26px, 3cqi, 36px); line-height: 1.15")}>
          {"Inspectors now look for gaps, not achievements"}
        </h2>
        <p style={cssStyle("margin: 0")}>
          {"The 1 September 2026 order called yes/no reports “non-application of mind” and ordered surprise inspections of all schools. An inspector may ask girls, anonymously, whether pads are available, whether they missed school and whether they were taught."}
        </p>
        <p style={cssStyle("margin: 0; font-weight: 800")}>
          {"Infano runs that same survey first, so you can fix gaps before anyone arrives."}
        </p>
      </div>
    </div>
  </div>
</section>
  );
}
