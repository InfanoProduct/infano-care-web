import { cssStyle } from '../../style';

export function ParentsDesignSection02() {
  return (
<section style={cssStyle("background: transparent; padding: 72px 0")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 36px")}>
    <div style={cssStyle("display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; align-items: center")}>
      {" "}
      <div style={cssStyle("display: flex; flex-direction: column; gap: 14px")}>
        <div style={cssStyle("max-width: 760px; ")}>
          <div className="hand" style={cssStyle("font-size: 28px; color: #C2456A")}>
            {"Talk Tonight"}
          </div>
          <h2 style={cssStyle("margin: 2px 0 10px; font-weight: 900; font-size: clamp(30px, 4cqi, 46px); line-height: 1.1; color: #3D2C4A")}>
            {"A little card, a big conversation"}
          </h2>
        </div>
        <p style={cssStyle("margin: 0; font-size: 17px")}>
          {"After every session, your child’s class WhatsApp group gets a Talk Tonight card: what was covered, and two easy questions for dinner. In English and your language."}
        </p>
      </div>
      {" "}
      <div style={cssStyle("position: relative; display: flex; justify-content: center")}>
        {" "}
        <div className="float" style={cssStyle("--r: -3deg; width: min(100%, 400px); background: #FFFFFF; border-radius: 26px; padding: 26px; box-shadow: 0 24px 50px rgba(61,44,74,.14); display: flex; flex-direction: column; gap: 12px; border-top: 10px solid #C2456A")}>
          {" "}
          <div style={cssStyle("display: flex; justify-content: space-between; align-items: center")}>
            <span style={cssStyle("font-size: 12px; font-weight: 900; letter-spacing: .1em; color: #A8365A")}>
              {"TALK TONIGHT · GRADE 5"}
            </span>
            <span className="hand" style={cssStyle("font-size: 20px; color: #C2456A")}>
              {"Session 2"}
            </span>
          </div>
          {" "}
          <strong style={cssStyle("font-size: 22px; line-height: 1.25")}>
            {"Periods are everyone’s business"}
          </strong>
          {" "}
          <p style={cssStyle("margin: 0; font-size: 15px; color: #4A3A57")}>
            {"Today the whole class learned how the menstrual cycle works, in simple words, and practised how to help a classmate."}
          </p>
          {" "}
          <div style={cssStyle("background: #FFF4C7; border-radius: 16px; padding: 12px 14px; display: flex; flex-direction: column; gap: 6px")}>
            <strong style={cssStyle("font-size: 14px")}>
              {"Ask at dinner"}
            </strong>
            <span>
              {"1. What was one thing that surprised you today?"}
            </span>
            <span>
              {"2. If a friend needed help at school, what would you do?"}
            </span>
          </div>
          {" "}
          <span style={cssStyle("font-size: 12px; color: #6E5B7A")}>
            {"Also in Hindi, Marathi, Tamil, Kannada and more [languages to confirm]"}
          </span>
          {" "}
        </div>
      </div>
    </div>
  </div>
</section>
  );
}
