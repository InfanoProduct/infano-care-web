"use client";

import { Fragment, useState } from 'react';
import { cssStyle } from '../../style';
import { programmeGrades } from '../../school-data';

export function ProgrammeDesignSection02() {
  const [selectedGrade, setSelectedGrade] = useState(2);
  const tabs = programmeGrades.map((grade, index) => ({
    g: grade.g,
    sel: selectedGrade === index,
    style: selectedGrade === index
      ? 'background: #3D2C4A; color: #FFFFFF; border: none'
      : 'background: #FFFAF6; border: 1.5px solid #E9DDE6',
    pick: () => setSelectedGrade(index),
  }));
  const g = programmeGrades[selectedGrade] ?? programmeGrades[0];

  return (
<section style={cssStyle("background: #FFFFFF; padding: 72px 0")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 36px")}>
    <div style={cssStyle("max-width: 760px; margin: 0 auto; text-align: center")}>
      <div className="hand" style={cssStyle("font-size: 28px; color: #C2456A")}>
        {"Curriculum explorer"}
      </div>
      <h2 style={cssStyle("margin: 2px 0 10px; font-weight: 900; font-size: clamp(30px, 4cqi, 46px); line-height: 1.1; color: #3D2C4A")}>
        {"Pick a grade"}
      </h2>
    </div>
    <div role="tablist" aria-label="Grades" style={cssStyle("display: flex; flex-wrap: wrap; gap: 8px; justify-content: center")}>
      {" "}
      {tabs.map((t, index) => (
        <Fragment key={index}>
          <button type="button" role="tab" aria-selected={t.sel} onClick={t.pick} style={cssStyle("min-width: 92px; min-height: 66px; border-radius: 20px; padding: 6px 14px; color: #3D2C4A; " + t.style)}>
            <span style={cssStyle("display: block; font-size: 12px; font-weight: 800; letter-spacing: .08em")}>
              {"GRADE"}
            </span>
            <span style={cssStyle("display: block; font-size: 24px; font-weight: 900; line-height: 1")}>
              {t.g}
            </span>
          </button>
        </Fragment>
      ))}
      {" "}
    </div>
    {" "}
    <div className="pop" style={cssStyle("background: #FFFFFF; border: 1px solid #F1E4E8; border-radius: 26px; padding: 28px; display: flex; flex-direction: column; gap: 18px")}>
      {" "}
      <div style={cssStyle("display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px; align-items: baseline")}>
        <h3 style={cssStyle("margin: 0; font-weight: 900; font-size: clamp(26px, 3cqi, 36px)")}>
          {"Grade "}{g.g}{": “"}{g.theme}{"”"}
        </h3>
        <span style={cssStyle("font-weight: 700; color: #6E5B7A")}>
          {"Age "}{g.age}{" · "}{g.count}{" sessions"}
        </span>
      </div>
      {" "}
      <ol style={cssStyle("list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px")}>
        {" "}
        {g.sessions.map((s, index) => (
          <Fragment key={index}>
            <li style={cssStyle("border-radius: 20px; padding: 16px; display: flex; gap: 14px; background: #FFFAF6; border: 1px solid #F1E4E8")}>
              <span style={cssStyle("flex: none; width: 40px; height: 40px; border-radius: 12px; background: " + s.bg + "; color: " + s.ink + "; display: grid; place-items: center; font-weight: 900")}>
                {s.n}
              </span>
              <span style={cssStyle("display: flex; flex-direction: column; gap: 4px")}>
                <span style={cssStyle("align-self: flex-start; background: " + s.bg + "; color: " + s.ink + "; border-radius: 999px; padding: 1px 10px; font-size: 12px; font-weight: 800")}>
                  {s.fmt}
                </span>
                <strong style={cssStyle("font-size: 16px; line-height: 1.35")}>
                  {s.title}
                </strong>
                <span style={cssStyle("font-size: 14px; color: #4A3A57")}>
                  {s.out}
                </span>
              </span>
            </li>
          </Fragment>
        ))}
        {" "}
      </ol>
      {" "}
      <div style={cssStyle("font-size: 14px; color: #6E5B7A")}>
        {"Opt-in modules (Grade 7 consent, Grade 8 relationships, Grade 9 relationships and consent) go home with a parent letter two weeks ahead, and opt-outs are honoured."}
      </div>
      {" "}
    </div>
  </div>
</section>
  );
}
