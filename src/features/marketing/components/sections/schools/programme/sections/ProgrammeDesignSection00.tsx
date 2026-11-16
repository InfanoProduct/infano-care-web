import { cssStyle } from '../../style';

export function ProgrammeDesignSection00() {
  return (
<section style={cssStyle("background: #E3DAF5; padding: 60px 0 40px")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-wrap: wrap; gap: 36px; align-items: center")}>
    {" "}
    <div style={cssStyle("flex: 1 1 460px; display: flex; flex-direction: column; gap: 16px")}>
      <span style={cssStyle("display: inline-block; background: #FFFFFF; color: #5A4385; border-radius: 999px; padding: 3px 12px; font-size: 12px; font-weight: 800; letter-spacing: .06em")}>
        {"THE PROGRAMME"}
      </span>
      {" "}
      <h1 style={cssStyle("margin: 0; font-weight: 900; font-size: clamp(40px, 5.6cqi, 66px); line-height: 1.05")}>
        {"36 sessions. 6 years."}
        <br />
        <span style={cssStyle("color: #C2456A")}>
          {"One way of growing up."}
        </span>
      </h1>
      {" "}
      <p style={cssStyle("margin: 0; font-size: 19px; color: #4A3A57")}>
        {"Six touchpoints per grade every year: three led by Infano facilitators (Together, Apart, Together again) and three led by your trained teachers with our smartboard packs. Each fits a 35 to 40 minute period."}
      </p>
      {" "}
      <div style={cssStyle("display: flex; flex-wrap: wrap; gap: 8px")}>
        <span style={cssStyle("display: inline-block; background: #FFFFFF; color: #5A4385; border-radius: 999px; padding: 3px 12px; font-size: 12px; font-weight: 800; letter-spacing: .06em")}>
          {"Together"}
        </span>
        <span style={cssStyle("display: inline-block; background: #FFE3CC; color: #9A4A16; border-radius: 999px; padding: 3px 12px; font-size: 12px; font-weight: 800; letter-spacing: .06em")}>
          {"Apart"}
        </span>
        <span style={cssStyle("display: inline-block; background: #D4EFE4; color: #24735A; border-radius: 999px; padding: 3px 12px; font-size: 12px; font-weight: 800; letter-spacing: .06em")}>
          {"Teacher-led"}
        </span>
      </div>
    </div>
    {" "}
    <div style={cssStyle("flex: 1 1 380px")}>
      <div style={cssStyle("position: relative; height: 340px; border-radius: 28px; background: #C9B6EC; overflow: hidden; ")}>
        <img src="/schools-template/img/sch-06.webp" alt="Teacher-led smartboard session in a co-ed class" loading="lazy" style={cssStyle("position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 50%; display: block")} />
      </div>
    </div>
  </div>
</section>
  );
}
