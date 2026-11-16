"use client";
import Link from 'next/link';

import { Fragment, useState } from 'react';
import { cssStyle } from '../../style';
import { requirementsQuestions } from '../../school-data';

export function RequirementsDesignSection01() {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const setAnswer = (index: number, value: boolean) => {
    setAnswers((current) => ({ ...current, [index]: value }));
  };
  const questions = requirementsQuestions;
  const qs = questions.map((question, index) => {
    const answer = answers[index];
    const off = 'border: 1.5px solid #E9DDE6; background: #FFFFFF; color: #3D2C4A';
    return {
      n: String(index + 1),
      text: question[0],
      yesOn: answer === true,
      noOn: answer === false,
      yesStyle: answer === true ? 'border: none; background: #2F7F62; color: #FFFFFF' : off,
      noStyle: answer === false ? 'border: none; background: #C2456A; color: #FFFFFF' : off,
      yes: () => setAnswer(index, true),
      no: () => setAnswer(index, false),
    };
  });
  const yesCount = questions.filter((_, index) => answers[index] === true).length;
  const answeredCount = Object.keys(answers).length;
  const gaps = questions
    .map((question, index) => ({ text: question[0], fix: question[1], gap: answers[index] === false }))
    .filter((gap) => gap.gap)
    .slice(0, 5);
  const circumference = 2 * Math.PI * 50;
  const verdict = answeredCount < questions.length
    ? { kicker: 'Keep going', message: `${questions.length - answeredCount} questions to go` }
    : yesCount >= 11
      ? { kicker: 'Looking strong', message: 'Let’s make sure your evidence holds up' }
      : yesCount >= 7
        ? { kicker: 'Getting there', message: 'A few gaps an inspector could find' }
        : { kicker: 'Let’s talk soon', message: 'Several gaps worth closing before an inspection' };
  const yes = String(yesCount);
  const dash = `${(circumference * yesCount / questions.length).toFixed(1)} ${circumference.toFixed(1)}`;
  const ring = yesCount >= 11 ? '#7FC3A3' : yesCount >= 7 ? '#FFE08A' : '#F4A3B4';
  const scoreLabel = `${yesCount} of ${questions.length} in place`;
  const verdictKicker = verdict.kicker;
  const verdictMessage = verdict.message;
  const hasGaps = gaps.length > 0;

  return (
<section style={cssStyle("background: #FFFFFF; padding: 72px 0")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 36px")}>
    <div style={cssStyle("display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 28px; align-items: start")}>
      {" "}
      <ol style={cssStyle("list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px")}>
        {" "}
        {qs.map((q, index) => (
          <Fragment key={index}>
            {" "}
            <li style={cssStyle("background: #FFFFFF; border: 1px solid #F1E4E8; border-radius: 26px; padding: 14px 16px; display: flex; flex-wrap: wrap; gap: 10px 14px; align-items: center")}>
              {" "}
              <span style={cssStyle("flex: 1 1 260px; font-weight: 700; font-size: 16px")}>
                <span style={cssStyle("color: #C2456A")}>
                  {q.n}{"."}
                </span>
                {" "}{q.text}
              </span>
              {" "}
              <span role="group" aria-label={q.text} style={cssStyle("display: flex; gap: 6px")}>
                <button type="button" aria-pressed={q.yesOn} onClick={q.yes} style={cssStyle("min-width: 64px; min-height: 44px; border-radius: 999px; font-weight: 800; " + q.yesStyle)}>
                  {"Yes"}
                </button>
                <button type="button" aria-pressed={q.noOn} onClick={q.no} style={cssStyle("min-width: 64px; min-height: 44px; border-radius: 999px; font-weight: 800; " + q.noStyle)}>
                  {"Not yet"}
                </button>
              </span>
              {" "}
            </li>
            {" "}
          </Fragment>
        ))}
        {" "}
      </ol>
      {" "}
      <aside style={cssStyle("position: sticky; top: 90px; background: #2E2240; color: #FFFFFF; border-radius: 30px; padding: 28px; display: flex; flex-direction: column; gap: 14px")}>
        {" "}
        <div style={cssStyle("display: flex; gap: 18px; align-items: center")}>
          {" "}
          <svg width="130" height="130" viewBox="0 0 120 120" role="img" aria-label={scoreLabel}>
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="12">
            </circle>
            <circle cx="60" cy="60" r="50" fill="none" stroke={ring} strokeWidth="12" strokeLinecap="round" strokeDasharray={dash} transform="rotate(-90 60 60)">
            </circle>
            <text x="60" y="58" textAnchor="middle" fontSize="30" fontWeight="900" fill="#FFFFFF" fontFamily="Noto Sans, sans-serif">
              {yes}{"/12"}
            </text>
            <text x="60" y="80" textAnchor="middle" fontSize="11" fontWeight="700" fill="#E7DDEE" fontFamily="Noto Sans, sans-serif">
              {"IN PLACE"}
            </text>
          </svg>
          {" "}
          <div>
            <div className="hand" style={cssStyle("font-size: 26px; color: #F4A3B4")}>
              {verdictKicker}
            </div>
            <strong style={cssStyle("font-size: 22px; line-height: 1.25")}>
              {verdictMessage}
            </strong>
          </div>
          {" "}
        </div>
        {" "}
        {hasGaps ? (<>
          <div style={cssStyle("display: flex; flex-direction: column; gap: 8px")}>
            <span style={cssStyle("font-size: 13px; font-weight: 800; letter-spacing: .08em; color: #F4A3B4")}>
              {"YOUR GAPS, AND HOW WE CLOSE THEM"}
            </span>
            {" "}
            <ul style={cssStyle("margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px")}>
              {gaps.map((g, index) => (
                <Fragment key={index}>
                  <li style={cssStyle("background: rgba(255,255,255,.08); border-radius: 14px; padding: 10px 12px; font-size: 14px")}>
                    <strong style={cssStyle("display: block")}>
                      {g.text}
                    </strong>
                    <span style={cssStyle("color: #E7DDEE")}>
                      {"Infano: "}{g.fix}
                    </span>
                  </li>
                </Fragment>
              ))}
            </ul>
          </div>
        </>) : null}
        {" "}
        <Link href="/schools/health-check" style={cssStyle("min-height: 56px; padding: 0 26px; border-radius: 999px; border: none; background: #C2456A; color: #FFFFFF; font-weight: 800; font-size: 17px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #F4A3B4; color: #3D2C4A")}>
          {"Confirm it with a free Health Check"}
        </Link>
        {" "}
        <span style={cssStyle("font-size: 12px; color: #CBBBD3")}>
          {"A self-check, not a legal assessment. Infano helps you meet and evidence requirements; it never certifies compliance."}
        </span>
        {" "}
      </aside>
      {" "}
    </div>
  </div>
</section>
  );
}
