import { cssStyle } from '../../style';

export function ParentsDesignSection04() {
  return (
<section style={cssStyle("background: transparent; padding: 72px 0")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 36px")}>
    <div style={cssStyle("max-width: 760px; margin: 0 auto; text-align: center")}>
      <div className="hand" style={cssStyle("font-size: 28px; color: #C2456A")}>
        {"Questions parents ask"}
      </div>
      <h2 style={cssStyle("margin: 2px 0 10px; font-weight: 900; font-size: clamp(30px, 4cqi, 46px); line-height: 1.1; color: #3D2C4A")}>
        {"We’re glad you asked"}
      </h2>
    </div>
    <div style={cssStyle("display: flex; flex-direction: column; gap: 10px; max-width: 860px; margin: 0 auto; width: 100%")}>
      <details style={cssStyle("background: #FFFFFF; border: 1px solid #F1E4E8; border-radius: 26px; padding: 0 20px")}>
        <summary style={cssStyle("min-height: 60px; display: flex; align-items: center; font-weight: 800; font-size: 17px; cursor: pointer")}>
          {"Will my child learn anything explicit?"}
        </summary>
        <p style={cssStyle("margin: 0 0 18px; color: #4A3A57")}>
          {"No. Content is NCERT-aligned and age-right. You can preview every session before the year starts."}
        </p>
      </details>
      <details style={cssStyle("background: #FFFFFF; border: 1px solid #F1E4E8; border-radius: 26px; padding: 0 20px")}>
        <summary style={cssStyle("min-height: 60px; display: flex; align-items: center; font-weight: 800; font-size: 17px; cursor: pointer")}>
          {"Can I opt my child out?"}
        </summary>
        <p style={cssStyle("margin: 0 0 18px; color: #4A3A57")}>
          {"Yes. Sensitive modules come with a letter two weeks ahead, and opt-outs are always honoured. You can also opt out of an Apart session."}
        </p>
      </details>
      <details style={cssStyle("background: #FFFFFF; border: 1px solid #F1E4E8; border-radius: 26px; padding: 0 20px")}>
        <summary style={cssStyle("min-height: 60px; display: flex; align-items: center; font-weight: 800; font-size: 17px; cursor: pointer")}>
          {"Why are boys and girls taught together?"}
        </summary>
        <p style={cssStyle("margin: 0 0 18px; color: #4A3A57")}>
          {"Shared facts are taught together so nobody is singled out and boys learn to be kind allies. Private, practical topics are taught apart."}
        </p>
      </details>
      <details style={cssStyle("background: #FFFFFF; border: 1px solid #F1E4E8; border-radius: 26px; padding: 0 20px")}>
        <summary style={cssStyle("min-height: 60px; display: flex; align-items: center; font-weight: 800; font-size: 17px; cursor: pointer")}>
          {"Who will teach my child?"}
        </summary>
        <p style={cssStyle("margin: 0 0 18px; color: #4A3A57")}>
          {"Verified, certified Infano facilitators (a woman with girls, a man with boys) or trained teachers, always with the class teacher present."}
        </p>
      </details>
      <details style={cssStyle("background: #FFFFFF; border: 1px solid #F1E4E8; border-radius: 26px; padding: 0 20px")}>
        <summary style={cssStyle("min-height: 60px; display: flex; align-items: center; font-weight: 800; font-size: 17px; cursor: pointer")}>
          {"What if my child shares something worrying?"}
        </summary>
        <p style={cssStyle("margin: 0 0 18px; color: #4A3A57")}>
          {"The school’s designated safeguarding lead follows a clear protocol the same day. Facilitators never investigate."}
        </p>
      </details>
      <details style={cssStyle("background: #FFFFFF; border: 1px solid #F1E4E8; border-radius: 26px; padding: 0 20px")}>
        <summary style={cssStyle("min-height: 60px; display: flex; align-items: center; font-weight: 800; font-size: 17px; cursor: pointer")}>
          {"Can we continue at home?"}
        </summary>
        <p style={cssStyle("margin: 0 0 18px; color: #4A3A57")}>
          {"Yes. Talk Tonight cards come after every session. Families can also choose Infano’s Parents App and our home course, Girlhood: HerNext."}
        </p>
      </details>
    </div>
  </div>
</section>
  );
}
