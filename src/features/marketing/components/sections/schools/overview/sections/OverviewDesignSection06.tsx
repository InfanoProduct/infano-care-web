"use client";

import { Fragment, useState } from 'react';
import { cssStyle } from '../../style';
import { overviewCalendar, overviewLanes } from '../../school-data';

export function OverviewDesignSection06() {
  const [selectedMonth, setSelectedMonth] = useState(0);
  const current = overviewCalendar[selectedMonth] ?? overviewCalendar[0];
  const lanes = overviewLanes.map((lane, index) => {
    const items = current.lanes[index] ?? [];
    return {
      label: lane[0],
      abbr: lane[1],
      bg: lane[2],
      ink: lane[3],
      items,
      has: items.length > 0,
      none: items.length === 0,
    };
  });
  const itemCount = lanes.reduce((count, lane) => count + lane.items.length, 0);
  const months = overviewCalendar.map((month, index) => ({
    m: month.m,
    full: month.full,
    pos: month.pos,
    sel: selectedMonth === index,
    style: selectedMonth === index
      ? 'background: #3D2C4A; color: #FFFFFF; border: 3px solid #FFFFFF; box-shadow: 0 8px 20px rgba(61,44,74,.3)'
      : `background: ${month.tbg}; color: ${month.tink}; border: 3px solid #FFFFFF`,
    pick: () => setSelectedMonth(index),
  }));
  const mo = {
    full: current.full,
    termUp: current.term.toUpperCase(),
    tbg: current.tbg,
    tink: current.tink,
    count: `${itemCount} ${itemCount === 1 ? 'thing' : 'things'} happening`,
    lanes,
  };
  const prev = () => setSelectedMonth((month) => (month + 11) % 12);
  const next = () => setSelectedMonth((month) => (month + 1) % 12);

  return (
<section style={cssStyle("background: transparent; padding: 72px 0")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 36px")}>
    <div style={cssStyle("max-width: 760px; margin: 0 auto; text-align: center")}>
      <div className="hand" style={cssStyle("font-size: 28px; color: #C2456A")}>
        {"A year with Infano"}
      </div>
      <h2 style={cssStyle("margin: 2px 0 10px; font-weight: 900; font-size: clamp(30px, 4cqi, 46px); line-height: 1.1; color: #3D2C4A")}>
        {"Twelve months. Six touchpoints per grade. Zero chaos."}
      </h2>
      <p style={cssStyle("margin: 0; font-size: 18px; color: #5E4B6B")}>
        {"Tap a month to see what happens for students, staff and parents, and what lands in your file. Sessions fit your Health & PE, life-skills or SEL periods and never clash with exams."}
      </p>
    </div>
    <div style={cssStyle("display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 36px; align-items: center")}>
      {" "}
      <div style={cssStyle("display: flex; flex-direction: column; align-items: center; gap: 16px")}>
        {" "}
        <div style={cssStyle("position: relative; width: min(100%, 470px); aspect-ratio: 1")}>
          {" "}
          <svg aria-hidden="true" viewBox="0 0 100 100" style={cssStyle("position: absolute; inset: 0; width: 100%; height: 100%")}>
            <path d="M 40.78 10.05 A 41 41 0 0 1 61.99 89.21" fill="none" stroke="#D8ECF8" strokeWidth="9" strokeLinecap="round">
            </path>
            <path d="M 59.22 89.95 A 41 41 0 0 1 10.05 40.78" fill="none" stroke="#FFE3CC" strokeWidth="9" strokeLinecap="round">
            </path>
            <path d="M 10.79 38.01 A 41 41 0 0 1 38.01 10.79" fill="none" stroke="#D4EFE4" strokeWidth="9" strokeLinecap="round">
            </path>
          </svg>
          {" "}
          <div style={cssStyle("position: absolute; inset: 22%; border-radius: 50%; background: #FFFFFF; box-shadow: 0 18px 40px rgba(61,44,74,.12); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-align: center; padding: 8px")}>
            {" "}
            <span style={cssStyle("background: " + mo.tbg + "; color: " + mo.tink + "; border-radius: 999px; padding: 2px 12px; font-size: 12px; font-weight: 900; letter-spacing: .08em")}>
              {mo.termUp}
            </span>
            {" "}
            <span className="pop" style={cssStyle("font-weight: 900; font-size: clamp(28px, 4cqi, 44px); line-height: 1.05")}>
              {mo.full}
            </span>
            {" "}
            <span style={cssStyle("font-size: 13px; font-weight: 700; color: #6E5B7A")}>
              {mo.count}
            </span>
            {" "}
          </div>
          {" "}
          {months.map((m, index) => (
            <Fragment key={index}>
              <button type="button" aria-pressed={m.sel} aria-label={m.full} onClick={m.pick} style={cssStyle("position: absolute; " + m.pos + "; transform: translate(-50%, -50%); width: 13%; min-width: 44px; aspect-ratio: 1; border-radius: 50%; font-weight: 900; font-size: 15px; display: grid; place-items: center; transition: transform .2s ease; " + m.style)}>
                {m.m}
              </button>
            </Fragment>
          ))}
          {" "}
        </div>
        {" "}
        <div style={cssStyle("display: flex; flex-wrap: wrap; gap: 8px 18px; justify-content: center")}>
          <span style={cssStyle("display: inline-flex; gap: 6px; align-items: center; font-size: 14px; font-weight: 700")}>
            <span style={cssStyle("width: 14px; height: 14px; border-radius: 50%; background: #D8ECF8")}>
            </span>
            {"Term 1 · Apr to Sep"}
          </span>
          <span style={cssStyle("display: inline-flex; gap: 6px; align-items: center; font-size: 14px; font-weight: 700")}>
            <span style={cssStyle("width: 14px; height: 14px; border-radius: 50%; background: #FFE3CC")}>
            </span>
            {"Term 2 · Oct to Jan"}
          </span>
          <span style={cssStyle("display: inline-flex; gap: 6px; align-items: center; font-size: 14px; font-weight: 700")}>
            <span style={cssStyle("width: 14px; height: 14px; border-radius: 50%; background: #D4EFE4")}>
            </span>
            {"Term 3 · Feb to Mar"}
          </span>
        </div>
        {" "}
        <div style={cssStyle("display: flex; gap: 10px")}>
          <button type="button" onClick={prev} aria-label="Previous month" style={cssStyle("width: 48px; height: 48px; border-radius: 50%; border: 2px solid #3D2C4A; background: #FFFFFF; color: #3D2C4A; font-size: 20px; font-weight: 900")}>
            {"‹"}
          </button>
          <button type="button" onClick={next} aria-label="Next month" style={cssStyle("width: 48px; height: 48px; border-radius: 50%; border: 2px solid #3D2C4A; background: #FFFFFF; color: #3D2C4A; font-size: 20px; font-weight: 900")}>
            {"›"}
          </button>
        </div>
        {" "}
      </div>
      {" "}
      <div style={cssStyle("display: flex; flex-direction: column; gap: 12px")}>
        {" "}
        <div className="hand" style={cssStyle("font-size: 26px; color: #C2456A")}>
          {"What happens in "}{mo.full}
        </div>
        {" "}
        {mo.lanes.map((l, index) => (
          <Fragment key={index}>
            {" "}
            <div style={cssStyle("background: #FFFFFF; border: 1px solid #F1E4E8; border-radius: 26px; padding: 16px 18px; display: flex; gap: 14px; align-items: flex-start")}>
              {" "}
              <span style={cssStyle("flex: none; width: 44px; height: 44px; border-radius: 14px; background: " + l.bg + "; display: grid; place-items: center; font-weight: 900; font-size: 13px; color: " + l.ink)}>
                {l.abbr}
              </span>
              {" "}
              <div style={cssStyle("display: flex; flex-direction: column; gap: 4px; flex: 1")}>
                <strong style={cssStyle("font-size: 16px")}>
                  {l.label}
                </strong>
                {" "}
                {l.has ? (<>
                  <ul style={cssStyle("margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 2px; font-size: 15px; color: #4A3A57")}>
                    {l.items.map((it, index) => (
                      <Fragment key={index}>
                        <li>
                          {it}
                        </li>
                      </Fragment>
                    ))}
                  </ul>
                </>) : null}
                {" "}
                {l.none ? (<>
                  <span style={cssStyle("font-size: 14px; color: #9A8AA3")}>
                    {"Nothing new this month"}
                  </span>
                </>) : null}
                {" "}
              </div>
            </div>
            {" "}
          </Fragment>
        ))}
        {" "}
        <div style={cssStyle("background: #FDEFF0; border-radius: 20px; padding: 14px 18px; font-size: 15px")}>
          <strong>
            {"Every month:"}
          </strong>
          {" Champions check the MHM corner, pads are restocked, and Ask-Anything questions are answered in the next class."}
        </div>
        {" "}
      </div>
      {" "}
    </div>
  </div>
</section>
  );
}
