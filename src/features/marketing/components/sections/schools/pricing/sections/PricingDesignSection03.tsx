"use client";
import Link from 'next/link';

import { Fragment, useState } from 'react';
import { cssStyle } from '../../style';
import { pricingPackages } from '../../school-data';

export function PricingDesignSection03() {
  const [selectedPackage, setSelectedPackage] = useState(1);
  const [students, setStudents] = useState(720);
  const [founding, setFounding] = useState(true);
  const [threeYear, setThreeYear] = useState(false);
  const selected = pricingPackages[selectedPackage] ?? pricingPackages[0];
  const fmt = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;
  const base = Math.max(selected.rate * students, selected.min);
  const discount = (founding ? 0.2 : 0) + (threeYear ? 0.1 : 0);
  const programmeTotal = base * (1 - discount);
  const lines = [{ k: `${students} students × ${fmt(selected.rate)}`, v: fmt(selected.rate * students) }];
  if (discount > 0) {
    lines.push({ k: `Discounts (${Math.round(discount * 100)}%)`, v: `−${fmt(base * discount)}` });
  }
  const switchStyle = (isOn: boolean) => ({
    on: isOn,
    style: isOn ? 'border: 2px solid #C2456A; background: #FDEFF0' : 'border: 1.5px solid #E9DDE6; background: #FFFFFF',
    track: isOn ? 'background: #C2456A' : 'background: #D9C8D3',
    knob: isOn ? 'left: 21px;' : 'left: 3px;',
  });
  const opts = [
    { title: 'Founding school (first 20)', sub: '20% off year 1', ...switchStyle(founding), toggle: () => setFounding((value) => !value) },
    { title: 'Three-year agreement', sub: '10% off; 5% annual increase after year 1', ...switchStyle(threeYear), toggle: () => setThreeYear((value) => !value) },
  ];
  const pkgs = pricingPackages.map((item, index) => ({
    name: item.name,
    price: `₹${item.rate} / student`,
    on: selectedPackage === index,
    style: selectedPackage === index
      ? 'border: 2.5px solid #C2456A; background: #FDEFF0'
      : 'border: 1.5px solid #E9DDE6; background: #FFFFFF',
    pick: () => setSelectedPackage(index),
  }));
  const grades = selected.grades;
  const less = () => setStudents((count) => Math.max(40, count - 40));
  const more = () => setStudents((count) => Math.min(4000, count + 40));
  const pkgName = selected.name.toUpperCase();
  const total = fmt(programmeTotal);
  const perStudent = fmt(programmeTotal / students);
  const minApplied = selected.rate * students < selected.min;

  return (
<section style={cssStyle("background: transparent; padding: 72px 0")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 36px")}>
    <div style={cssStyle("max-width: 760px; margin: 0 auto; text-align: center")}>
      <div className="hand" style={cssStyle("font-size: 28px; color: #C2456A")}>
        {"Estimate your cost"}
      </div>
      <h2 style={cssStyle("margin: 2px 0 10px; font-weight: 900; font-size: clamp(30px, 4cqi, 46px); line-height: 1.1; color: #3D2C4A")}>
        {"Your school, your numbers"}
      </h2>
    </div>
    <div style={cssStyle("display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 24px; align-items: start")}>
      {" "}
      <div style={cssStyle("background: #FFFFFF; border: 1px solid #F1E4E8; border-radius: 26px; padding: 26px; display: flex; flex-direction: column; gap: 20px")}>
        {" "}
        <fieldset style={cssStyle("border: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px")}>
          <legend style={cssStyle("font-weight: 800; margin-bottom: 8px")}>
            {"Package"}
          </legend>
          {" "}
          <div style={cssStyle("display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px")}>
            {pkgs.map((p, index) => (
              <Fragment key={index}>
                <button type="button" role="radio" aria-checked={p.on} onClick={p.pick} style={cssStyle("min-height: 64px; border-radius: 16px; font-weight: 800; color: #3D2C4A; " + p.style)}>
                  {p.name}
                  <span style={cssStyle("display: block; font-size: 13px; font-weight: 700")}>
                    {p.price}
                  </span>
                </button>
              </Fragment>
            ))}
          </div>
        </fieldset>
        {" "}
        <div style={cssStyle("display: flex; flex-direction: column; gap: 8px")}>
          <span style={cssStyle("font-weight: 800")}>
            {"Students in Grades "}{grades}
          </span>
          {" "}
          <div style={cssStyle("display: flex; align-items: center; gap: 10px")}>
            <button type="button" onClick={less} aria-label="Fewer students" style={cssStyle("width: 52px; height: 52px; border-radius: 50%; border: 2px solid #3D2C4A; background: #FFFFFF; font-size: 24px; font-weight: 800; color: #3D2C4A")}>
              {"−"}
            </button>
            <span style={cssStyle("flex: 1; text-align: center; font-size: 36px; font-weight: 900")}>
              {students}
            </span>
            <button type="button" onClick={more} aria-label="More students" style={cssStyle("width: 52px; height: 52px; border-radius: 50%; border: 2px solid #3D2C4A; background: #FFFFFF; font-size: 24px; font-weight: 800; color: #3D2C4A")}>
              {"+"}
            </button>
          </div>
          {" "}
          <span style={cssStyle("font-size: 13px; color: #6E5B7A; text-align: center")}>
            {"Steps of 40 (about one section)"}
          </span>
        </div>
        {" "}
        <div style={cssStyle("display: flex; flex-direction: column; gap: 10px")}>
          {" "}
          {opts.map((o, index) => (
            <Fragment key={index}>
              <button type="button" role="switch" aria-checked={o.on} onClick={o.toggle} style={cssStyle("display: flex; gap: 12px; align-items: center; text-align: left; min-height: 60px; padding: 10px 14px; border-radius: 16px; color: #3D2C4A; " + o.style)}>
                <span style={cssStyle("flex: none; width: 44px; height: 26px; border-radius: 999px; position: relative; " + o.track)}>
                  <span style={cssStyle("position: absolute; top: 3px; " + o.knob + " width: 20px; height: 20px; border-radius: 50%; background: #FFFFFF")}>
                  </span>
                </span>
                <span>
                  <strong style={cssStyle("display: block")}>
                    {o.title}
                  </strong>
                  <span style={cssStyle("font-size: 13px; color: #5E4B6B")}>
                    {o.sub}
                  </span>
                </span>
              </button>
            </Fragment>
          ))}
          {" "}
        </div>
        {" "}
      </div>
      {" "}
      <aside style={cssStyle("position: sticky; top: 90px; background: #2E2240; color: #FFFFFF; border-radius: 30px; padding: 28px; display: flex; flex-direction: column; gap: 14px")}>
        {" "}
        <span style={cssStyle("font-size: 13px; font-weight: 800; letter-spacing: .1em; color: #F4A3B4")}>
          {"YEAR 1 ESTIMATE · "}{pkgName}
        </span>
        {" "}
        <div style={cssStyle("font-size: clamp(44px, 5cqi, 60px); font-weight: 900; line-height: 1")}>
          {total}
        </div>
        {" "}
        <div style={cssStyle("font-size: 15px; color: #E7DDEE")}>
          {"+ GST · about "}{perStudent}{" per student"}
        </div>
        {" "}
        <dl style={cssStyle("margin: 0; display: grid; grid-template-columns: 1fr auto; gap: 8px; font-size: 15px; border-top: 1px solid rgba(255,255,255,.15); padding-top: 14px")}>
          {" "}
          {lines.map((l, index) => (
            <Fragment key={index}>
              <dt style={cssStyle("color: #E7DDEE")}>
                {l.k}
              </dt>
              <dd style={cssStyle("margin: 0; font-weight: 800; text-align: right")}>
                {l.v}
              </dd>
            </Fragment>
          ))}
          {" "}
        </dl>
        {" "}
        {minApplied ? (<>
          <div style={cssStyle("background: rgba(255,255,255,.1); border-radius: 12px; padding: 8px 12px; font-size: 13px")}>
            {"The package minimum applies at this size."}
          </div>
        </>) : null}
        {" "}
        <Link href="/schools/health-check" style={cssStyle("min-height: 56px; padding: 0 26px; border-radius: 999px; border: none; background: #C2456A; color: #FFFFFF; font-weight: 800; font-size: 17px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #F4A3B4; color: #3D2C4A")}>
          {"Get an exact proposal"}
        </Link>
        {" "}
        <span style={cssStyle("font-size: 12px; color: #CBBBD3")}>
          {"Programme fee estimate only. Payment: 50% on signing, 50% by 1 October. The MHM Compliance Pack is priced separately in your proposal."}
        </span>
        {" "}
      </aside>
      {" "}
    </div>
  </div>
</section>
  );
}
