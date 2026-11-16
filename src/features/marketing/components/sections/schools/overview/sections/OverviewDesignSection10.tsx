"use client";

import { Fragment, useState } from 'react';
import { cssStyle } from '../../style';
import { overviewFaqs } from '../../school-data';

export function OverviewDesignSection10() {
  const [openFaq, setOpenFaq] = useState(0);
  const faqs = overviewFaqs.map(([question, answer], index) => ({
    q: question,
    a: answer,
    isOpen: openFaq === index,
    open: openFaq === index,
    sign: openFaq === index ? '−' : '+',
    toggle: () => setOpenFaq((current) => current === index ? -1 : index),
  }));

  return (
<section style={cssStyle("background: #FFFFFF; padding: 72px 0")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 36px")}>
    <div style={cssStyle("max-width: 760px; margin: 0 auto; text-align: center")}>
      <div className="hand" style={cssStyle("font-size: 28px; color: #C2456A")}>
        {"Good questions"}
      </div>
      <h2 style={cssStyle("margin: 2px 0 10px; font-weight: 900; font-size: clamp(30px, 4cqi, 46px); line-height: 1.1; color: #3D2C4A")}>
        {"What principals ask us first"}
      </h2>
    </div>
    <div style={cssStyle("display: flex; flex-direction: column; gap: 10px; max-width: 860px; margin: 0 auto; width: 100%")}>
      {" "}
      {faqs.map((f, index) => (
        <Fragment key={index}>
          {" "}
          <div style={cssStyle("background: #FFFFFF; border: 1px solid #F1E4E8; border-radius: 26px; overflow: hidden")}>
            {" "}
            <button type="button" aria-expanded={f.open} onClick={f.toggle} style={cssStyle("width: 100%; min-height: 64px; padding: 14px 20px; border: none; background: transparent; display: flex; justify-content: space-between; align-items: center; gap: 12px; text-align: left; color: #3D2C4A; font-weight: 800; font-size: 17px")}>
              {f.q}
              <span style={cssStyle("flex: none; width: 32px; height: 32px; border-radius: 50%; background: #FDEFF0; display: grid; place-items: center")}>
                {f.sign}
              </span>
            </button>
            {" "}
            {f.isOpen ? (<>
              <div className="pop" style={cssStyle("padding: 0 20px 18px; color: #4A3A57")}>
                {f.a}
              </div>
            </>) : null}
            {" "}
          </div>
          {" "}
        </Fragment>
      ))}
      {" "}
    </div>
  </div>
</section>
  );
}
