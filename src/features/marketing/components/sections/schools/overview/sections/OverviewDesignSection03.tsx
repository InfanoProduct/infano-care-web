"use client";

import { Fragment, useState } from 'react';
import { cssStyle } from '../../style';
import { overviewPhases } from '../../school-data';

export function OverviewDesignSection03() {
  const [selectedPhase, setSelectedPhase] = useState(0);
  const phases = overviewPhases.map((phase, index) => ({
    n: String(index + 1),
    name: phase.name,
    sel: selectedPhase === index,
    style: selectedPhase === index
      ? `background: ${phase.bg}; border: 2.5px solid #3D2C4A`
      : 'background: #FFFFFF; border: 1.5px solid #E9DDE6',
    pick: () => setSelectedPhase(index),
  }));
  const ph = overviewPhases[selectedPhase] ?? overviewPhases[0];

  return (
<section style={cssStyle("background: transparent; padding: 72px 0")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 36px")}>
    <div style={cssStyle("max-width: 760px; margin: 0 auto; text-align: center")}>
      <div className="hand" style={cssStyle("font-size: 28px; color: #C2456A")}>
        {"The co-ed model"}
      </div>
      <h2 style={cssStyle("margin: 2px 0 10px; font-weight: 900; font-size: clamp(30px, 4cqi, 46px); line-height: 1.1; color: #3D2C4A")}>
        {"Together → Apart → Together"}
      </h2>
      <p style={cssStyle("margin: 0; font-size: 18px; color: #5E4B6B")}>
        {"What a class must share is taught together. What needs privacy is taught apart. Then everyone comes back to practise respect."}
      </p>
    </div>
    <div style={cssStyle("display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 28px; align-items: start")}>
      {" "}
      <div style={cssStyle("display: flex; flex-direction: column; gap: 12px")}>
        {" "}
        <div role="tablist" aria-label="The three phases" style={cssStyle("display: flex; gap: 8px; flex-wrap: wrap")}>
          {" "}
          {phases.map((p, index) => (
            <Fragment key={index}>
              <button type="button" role="tab" aria-selected={p.sel} onClick={p.pick} style={cssStyle("flex: 1 1 120px; min-height: 60px; border-radius: 18px; font-weight: 900; font-size: 18px; color: #3D2C4A; " + p.style)}>
                {p.n}{". "}{p.name}
              </button>
            </Fragment>
          ))}
          {" "}
        </div>
        {" "}
        <div className="pop" style={cssStyle("background: " + ph.bg + "; border-radius: 28px; padding: 26px; display: flex; flex-direction: column; gap: 12px")}>
          {" "}
          <div style={cssStyle("display: flex; align-items: center; gap: 12px")}>
            {ph.who}
          </div>
          {" "}
          <h3 style={cssStyle("margin: 0; font-size: 28px; font-weight: 900")}>
            {ph.purpose}
          </h3>
          {" "}
          <ul style={cssStyle("margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 6px")}>
            {ph.topics.map((t, index) => (
              <Fragment key={index}>
                <li>
                  {t}
                </li>
              </Fragment>
            ))}
          </ul>
          {" "}
          <div style={cssStyle("font-size: 14px; font-weight: 700; color: #4A3A57")}>
            {"Led by: "}{ph.led}
          </div>
          {" "}
        </div>
        {" "}
      </div>
      {" "}
      <div style={cssStyle("display: flex; flex-direction: column; gap: 14px")}>
        {" "}
        <div style={cssStyle("position: relative; height: 300px; border-radius: 28px; background: #E3DAF5; overflow: hidden; ")}>
          <img src="/schools-template/img/sch-02.webp" alt="Girls’ circle and boys’ circle in parallel rooms" loading="lazy" style={cssStyle("position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 55%; display: block")} />
        </div>
        {" "}
        <div className="overview-impact-summary" style={cssStyle("background: #FFFFFF; border: 1px solid #F1E4E8; border-radius: 26px; padding: 20px; display: flex; gap: 16px; align-items: center")}>
          {" "}
          <div style={cssStyle("flex: none; text-align: center")}>
            <div style={cssStyle("font-size: 40px; font-weight: 900; line-height: 1; color: #C2456A")}>
              {"54% → 82%"}
            </div>
            <div style={cssStyle("font-size: 12px; font-weight: 700; color: #6E5B7A")}>
              {"boys confident to help"}
            </div>
          </div>
          {" "}
          <p style={cssStyle("margin: 0; font-size: 15px")}>
            {"But helping a classmate with a stained uniform didn’t improve (43% → 40%) in a 2026 study of 2,402 boys in Maharashtra (self-reported). "}
            <strong>
              {"So we rehearse the behaviour, not just the facts."}
            </strong>
          </p>
          {" "}
        </div>
        {" "}
      </div>
      {" "}
    </div>
  </div>
</section>
  );
}
