import Link from 'next/link';
import { cssStyle } from '../../style';

export function ParentsDesignSection00() {
  return (
<section style={cssStyle("background: #FFF4C7; padding: 60px 0")}>
  <div style={cssStyle("max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-wrap: wrap; gap: 36px; align-items: center")}>
    {" "}
    <div style={cssStyle("flex: 1 1 460px; display: flex; flex-direction: column; gap: 16px")}>
      <span style={cssStyle("display: inline-block; background: #FFFFFF; color: #8A6410; border-radius: 999px; padding: 3px 12px; font-size: 12px; font-weight: 800; letter-spacing: .06em")}>
        {"FOR PARENTS AT PARTNER SCHOOLS"}
      </span>
      {" "}
      <h1 style={cssStyle("margin: 0; font-weight: 900; font-size: clamp(40px, 5.6cqi, 64px); line-height: 1.05")}>
        {"Your child’s school is "}
        <span style={cssStyle("color: #C2456A")}>
          {"growing up together"}
        </span>
        {" with Infano"}
      </h1>
      {" "}
      <p style={cssStyle("margin: 0; font-size: 19px; color: #4A3A57")}>
        {"Gentle, age-right sessions on growing up, feelings, safety and respect, for boys and girls. You’ll see everything first, and we’ll send you a little card after every session so the conversation continues at home."}
      </p>
      {" "}
      <div style={cssStyle("display: flex; flex-wrap: wrap; gap: 12px")}>
        <Link href="/schools/programme" style={cssStyle("min-height: 56px; padding: 0 26px; border-radius: 999px; border: none; background: #C2456A; color: #FFFFFF; font-weight: 800; font-size: 17px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px")}>
          {"See what each grade learns"}
        </Link>
      </div>
    </div>
    {" "}
    <div style={cssStyle("flex: 1 1 380px")}>
      <div style={cssStyle("position: relative; height: 360px; border-radius: 28px; background: #F7E3A1; overflow: hidden; ")}>
        <img src="/schools-template/img/sch-10.webp" alt="Parent and child laughing over a Talk Tonight card at dinner" loading="lazy" style={cssStyle("position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 58% 45%; display: block")} />
      </div>
    </div>
  </div>
</section>
  );
}
