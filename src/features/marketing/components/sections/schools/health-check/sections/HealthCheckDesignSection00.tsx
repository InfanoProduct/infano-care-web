"use client";
import Link from 'next/link';

import { Fragment, useState } from 'react';
import type { FormEvent } from 'react';
import { cssStyle } from '../../style';
import {
  EnquiryApiService,
  type SchoolHealthCheckSubmission,
} from '@/features/enquiries/services/enquiry-api';
import { healthCheckBoards, healthCheckWeeks } from '../../school-data';

export function HealthCheckDesignSection00() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [board, setBoard] = useState<SchoolHealthCheckSubmission['board']>('CBSE');
  const [preferredWeek, setPreferredWeek] = useState<SchoolHealthCheckSubmission['preferredWeek']>('Next week');
  const [demo, setDemo] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [school, setSchool] = useState({ schoolName: '', cityState: '', studentCount: '' });
  const [contact, setContact] = useState({ contactName: '', contactRole: '', phone: '' });
  const updateSchool = (field: keyof typeof school, value: string) => {
    setSchool((current) => ({ ...current, [field]: value }));
    setError('');
  };
  const updateContact = (field: keyof typeof contact, value: string) => {
    setContact((current) => ({ ...current, [field]: value }));
    setError('');
  };
  const boards = healthCheckBoards.map((name) => ({
    name,
    on: board === name,
    style: board === name
      ? 'border: none; background: #3D2C4A; color: #FFFFFF'
      : 'border: 1.5px solid #E9DDE6; background: #FFFFFF; color: #3D2C4A',
    pick: () => { setBoard(name); setError(''); },
  }));
  const weeks = healthCheckWeeks.map((name) => ({
    name,
    on: preferredWeek === name,
    style: preferredWeek === name
      ? 'border: none; background: #3D2C4A; color: #FFFFFF'
      : 'border: 1.5px solid #E9DDE6; background: #FFFFFF; color: #3D2C4A',
    pick: () => { setPreferredWeek(name); setError(''); },
  }));
  const form = step < 3;
  const done = step === 3;
  const s1 = step === 1;
  const s2 = step === 2;
  const bar = [1, 2].map((currentStep) => ({
    style: step >= currentStep ? 'background: #C2456A' : 'background: #F6F1F4',
  }));
  const weekName = preferredWeek?.toLowerCase() ?? '';
  const next = () => {
    const count = Number(school.studentCount);
    if (!school.schoolName.trim() || !school.cityState.trim() || !Number.isInteger(count) || count < 1) {
      setError('Please enter your school name, city, and a valid student count.');
      return;
    }
    if (!board) {
      setError('Please select your school board.');
      return;
    }
    setError('');
    setStep(2);
  };
  const back = () => { setError(''); setStep(1); };
  const toggleDemo = () => setDemo((current) => !current);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    if (step === 1) {
      next();
      return;
    }
    if (!contact.contactName.trim() || !contact.contactRole.trim() || !contact.phone.trim() || !preferredWeek) {
      setError('Please complete your contact details and select a preferred week.');
      return;
    }
    if (!board) {
      setError('Please select your school board.');
      setStep(1);
      return;
    }
    const studentCount = Number(school.studentCount);
    if (!Number.isInteger(studentCount) || studentCount < 1) {
      setError('Please enter a valid student count.');
      setStep(1);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await EnquiryApiService.submitSchoolHealthCheck({
        type: 'school_health_check',
        schoolName: school.schoolName.trim(),
        cityState: school.cityState.trim(),
        studentCount,
        board,
        contactName: contact.contactName.trim(),
        contactRole: contact.contactRole.trim(),
        phone: contact.phone.trim(),
        preferredWeek,
        wantsDemo: demo,
      });
      setStep(3);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'We could not submit your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
<section style={cssStyle("padding: 56px 0 72px")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 40px; align-items: start")}>
    <div style={cssStyle("display: flex; flex-direction: column; gap: 18px")}>
      <span style={cssStyle("display: inline-block; background: #FDEFF0; color: #A8365A; border-radius: 999px; padding: 3px 12px; font-size: 12px; font-weight: 800; letter-spacing: .06em")}>
        {"FREE · NO OBLIGATION"}
      </span>
      <h1 style={cssStyle("margin: 0; font-weight: 900; font-size: clamp(38px, 5cqi, 58px); line-height: 1.05")}>
        {"Book your free "}
        <span style={cssStyle("color: #C2456A")}>
          {"Compliance Health Check"}
        </span>
      </h1>
      <p style={cssStyle("margin: 0; font-size: 18px; color: #4A3A57")}>
        {"Know exactly where your school stands on the new menstrual-health and mental-health requirements, before an inspector or a parent asks."}
      </p>
      <ol style={cssStyle("list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px")}>
        <li style={cssStyle("background: #D8ECF8; border-radius: 22px; padding: 16px 18px; display: flex; gap: 14px; align-items: flex-start")}>
          <span style={cssStyle("flex: none; width: 40px; height: 40px; border-radius: 50%; background: #FFFFFF; display: grid; place-items: center; font-weight: 900; font-size: 18px")}>
            {"1"}
          </span>
          <span>
            <strong style={cssStyle("font-size: 18px")}>
              {"Walk-through"}
            </strong>
            <br />
            <span style={cssStyle("font-size: 15px")}>
              {"45 minutes with your principal or coordinator, using our requirements checklist."}
            </span>
          </span>
        </li>
        <li style={cssStyle("background: #D4EFE4; border-radius: 22px; padding: 16px 18px; display: flex; gap: 14px; align-items: flex-start")}>
          <span style={cssStyle("flex: none; width: 40px; height: 40px; border-radius: 50%; background: #FFFFFF; display: grid; place-items: center; font-weight: 900; font-size: 18px")}>
            {"2"}
          </span>
          <span>
            <strong style={cssStyle("font-size: 18px")}>
              {"Sample survey"}
            </strong>
            <br />
            <span style={cssStyle("font-size: 15px")}>
              {"With your permission, an anonymous survey of 20 girls and 20 boys: the same kind an inspector runs."}
            </span>
          </span>
        </li>
        <li style={cssStyle("background: #FFF4C7; border-radius: 22px; padding: 16px 18px; display: flex; gap: 14px; align-items: flex-start")}>
          <span style={cssStyle("flex: none; width: 40px; height: 40px; border-radius: 50%; background: #FFFFFF; display: grid; place-items: center; font-weight: 900; font-size: 18px")}>
            {"3"}
          </span>
          <span>
            <strong style={cssStyle("font-size: 18px")}>
              {"Gap report in 5 days"}
            </strong>
            <br />
            <span style={cssStyle("font-size: 15px")}>
              {"One page: what’s in place, what’s missing, the risk, and the fix."}
            </span>
          </span>
        </li>
      </ol>
      <div style={cssStyle("position: relative; height: 220px; border-radius: 28px; background: #F9D5D3; overflow: hidden; ")}>
        <img src="/schools-template/img/sch-09.webp" alt="One-page gap report with traffic-light rows" loading="lazy" style={cssStyle("position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 50%; display: block")} />
      </div>
    </div>
    <div style={cssStyle("background: #FFFFFF; border: 1px solid #F1E4E8; border-radius: 26px; padding: 28px; box-shadow: 0 24px 50px rgba(61,44,74,.10)")}>
      {" "}
      {form ? (<>
        {" "}
        <form onSubmit={submit} style={cssStyle("display: flex; flex-direction: column; gap: 16px")}>
          {" "}
          <div style={cssStyle("display: flex; gap: 6px")}>
            {bar.map((b, index) => (
              <Fragment key={index}>
                <span style={cssStyle("flex: 1; height: 8px; border-radius: 99px; " + b.style)}>
                </span>
              </Fragment>
            ))}
          </div>
          {" "}
          {error ? <p role="alert" style={cssStyle("margin: 0; color: #A8365A; font-size: 14px; font-weight: 700")}>{error}</p> : null}
          {s1 ? (<>
            <div style={cssStyle("display: flex; flex-direction: column; gap: 14px")}>
              {" "}
              <h2 style={cssStyle("margin: 0; font-size: 22px; font-weight: 900")}>
                {"Your school"}
              </h2>
              {" "}
              <label style={cssStyle("display: flex; flex-direction: column; gap: 6px; font-size: 14px; font-weight: 700")}>
                {"School name"}
                <input type="text" value={school.schoolName} placeholder="School name" onChange={(event) => updateSchool('schoolName', event.target.value)} style={cssStyle("min-height: 50px; border-radius: 14px; border: 1.5px solid #E9DDE6; padding: 0 14px; font-size: 16px; color: #3D2C4A; font-family: inherit")} />
              </label>
              {" "}
              <div style={cssStyle("display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px")}>
                <label style={cssStyle("display: flex; flex-direction: column; gap: 6px; font-size: 14px; font-weight: 700")}>
                  {"City"}
                  <input type="text" value={school.cityState} placeholder="City" onChange={(event) => updateSchool('cityState', event.target.value)} style={cssStyle("min-height: 50px; border-radius: 14px; border: 1.5px solid #E9DDE6; padding: 0 14px; font-size: 16px; color: #3D2C4A; font-family: inherit")} />
                </label>
                <label style={cssStyle("display: flex; flex-direction: column; gap: 6px; font-size: 14px; font-weight: 700")}>
                  {"Students in Grades 4 to 9"}
                  <input type="number" min="1" value={school.studentCount} placeholder="Number of students" inputMode="numeric" onChange={(event) => updateSchool('studentCount', event.target.value)} style={cssStyle("min-height: 50px; border-radius: 14px; border: 1.5px solid #E9DDE6; padding: 0 14px; font-size: 16px; color: #3D2C4A; font-family: inherit")} />
                </label>
              </div>
              {" "}
              <fieldset style={cssStyle("border: none; margin: 0; padding: 0")}>
                <legend style={cssStyle("font-size: 14px; font-weight: 700; margin-bottom: 8px")}>
                  {"Board"}
                </legend>
                <div style={cssStyle("display: flex; flex-wrap: wrap; gap: 8px")}>
                  {boards.map((b, index) => (
                    <Fragment key={index}>
                      <button type="button" role="radio" aria-checked={b.on} onClick={b.pick} style={cssStyle("min-height: 44px; padding: 0 16px; border-radius: 999px; font-weight: 700; " + b.style)}>
                        {b.name}
                      </button>
                    </Fragment>
                  ))}
                </div>
              </fieldset>
              {" "}
              <button type="button" onClick={next} style={cssStyle("min-height: 56px; padding: 0 26px; border-radius: 999px; border: none; background: #C2456A; color: #FFFFFF; font-weight: 800; font-size: 17px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px")}>
                {"Continue"}
              </button>
              {" "}
            </div>
          </>) : null}
          {" "}
          {s2 ? (<>
            <div className="pop" style={cssStyle("display: flex; flex-direction: column; gap: 14px")}>
              {" "}
              <h2 style={cssStyle("margin: 0; font-size: 22px; font-weight: 900")}>
                {"You, and a good time to visit"}
              </h2>
              {" "}
              <div style={cssStyle("display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px")}>
                <label style={cssStyle("display: flex; flex-direction: column; gap: 6px; font-size: 14px; font-weight: 700")}>
                  {"Your name"}
                  <input type="text" value={contact.contactName} placeholder="Your name" onChange={(event) => updateContact('contactName', event.target.value)} style={cssStyle("min-height: 50px; border-radius: 14px; border: 1.5px solid #E9DDE6; padding: 0 14px; font-size: 16px; color: #3D2C4A; font-family: inherit")} />
                </label>
                <label style={cssStyle("display: flex; flex-direction: column; gap: 6px; font-size: 14px; font-weight: 700")}>
                  {"Role"}
                  <input type="text" value={contact.contactRole} placeholder="Role" onChange={(event) => updateContact('contactRole', event.target.value)} style={cssStyle("min-height: 50px; border-radius: 14px; border: 1.5px solid #E9DDE6; padding: 0 14px; font-size: 16px; color: #3D2C4A; font-family: inherit")} />
                </label>
              </div>
              {" "}
              <label style={cssStyle("display: flex; flex-direction: column; gap: 6px; font-size: 14px; font-weight: 700")}>
                {"Phone (WhatsApp)"}
                <input type="tel" value={contact.phone} placeholder="+91 phone number" onChange={(event) => updateContact('phone', event.target.value)} style={cssStyle("min-height: 50px; border-radius: 14px; border: 1.5px solid #E9DDE6; padding: 0 14px; font-size: 16px; color: #3D2C4A; font-family: inherit")} />
              </label>
              {" "}
              <fieldset style={cssStyle("border: none; margin: 0; padding: 0")}>
                <legend style={cssStyle("font-size: 14px; font-weight: 700; margin-bottom: 8px")}>
                  {"Preferred week"}
                </legend>
                <div style={cssStyle("display: flex; flex-wrap: wrap; gap: 8px")}>
                  {weeks.map((w, index) => (
                    <Fragment key={index}>
                      <button type="button" role="radio" aria-checked={w.on} onClick={w.pick} style={cssStyle("min-height: 44px; padding: 0 16px; border-radius: 999px; font-weight: 700; " + w.style)}>
                        {w.name}
                      </button>
                    </Fragment>
                  ))}
                </div>
              </fieldset>
              {" "}
              <label style={cssStyle("display: flex; gap: 10px; align-items: flex-start; font-size: 14px")}>
                <input type="checkbox" checked={demo} onChange={toggleDemo} style={cssStyle("width: 20px; height: 20px; margin-top: 2px; accent-color: #C2456A")} />
                {"Also book a free 35-minute demo session in one class"}
              </label>
              {" "}
              <div style={cssStyle("display: flex; gap: 10px")}>
                <button type="button" onClick={back} style={cssStyle("min-height: 56px; padding: 0 24px; border-radius: 999px; border: 2px solid #3D2C4A; background: transparent; color: #3D2C4A; font-weight: 800; font-size: 17px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto")}>
                  {"Back"}
                </button>
                <button type="submit" disabled={submitting} style={cssStyle("min-height: 56px; padding: 0 26px; border-radius: 999px; border: none; background: #C2456A; color: #FFFFFF; font-weight: 800; font-size: 17px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; flex: 1")}>
                  {submitting ? 'Submitting…' : 'Book my Health Check'}
                </button>
              </div>
              {" "}
              <span style={cssStyle("font-size: 12px; color: #6E5B7A")}>
                {"We use these details only to arrange your visit. See our Privacy Policy."}
              </span>
              {" "}
            </div>
          </>) : null}
        </form>
          {" "}
      </>) : null}
      {" "}
      {done ? (<>
        <div className="pop" style={cssStyle("display: flex; flex-direction: column; gap: 14px; text-align: center; align-items: center")}>
          {" "}
          <span style={cssStyle("width: 84px; height: 84px; border-radius: 50%; background: #D4EFE4; display: grid; place-items: center")}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#24735A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12l5 5 9-10">
              </path>
            </svg>
          </span>
          {" "}
          <h2 style={cssStyle("margin: 0; font-size: 28px; font-weight: 900")}>
            {"You’re booked in!"}
          </h2>
          {" "}
          <p style={cssStyle("margin: 0; color: #4A3A57")}>
            {"We’ll call "}{contact.contactName || 'you'}{" within 1 working day to confirm a slot in the week of "}{weekName}{". Your gap report follows within 5 days of the visit."}
          </p>
          {" "}
          <div style={cssStyle("background: #FFFAF6; border-radius: 18px; padding: 14px 16px; text-align: left; width: 100%; font-size: 15px")}>
            <strong>
              {"Before we come:"}
            </strong>
            {" keep your latest MHM circular, your timetable and a list of Grade 4 to 9 sections handy. That’s all."}
          </div>
          {" "}
          <Link href="/schools/programme" style={cssStyle("min-height: 56px; padding: 0 24px; border-radius: 999px; border: 2px solid #3D2C4A; background: transparent; color: #3D2C4A; font-weight: 800; font-size: 17px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center")}>
            {"Explore the programme meanwhile"}
          </Link>
          {" "}
        </div>
      </>) : null}
      {" "}
    </div>
  </div>
</section>
  );
}
