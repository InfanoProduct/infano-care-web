"use client";

import { useState } from 'react';
import { Award, Shield, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MentorConductPage() {
  const [accepted, setAccepted] = useState(false);
  const router = useRouter();

  const COMMITMENTS = [
    { title: 'Confidentiality', desc: "Never share any user's identity, message content, or situation with anyone outside PeerLine." },
    { title: 'Non-Judgement', desc: "Approach every user's experience with unconditional positive regard, regardless of their background." },
    { title: 'Scope Awareness', desc: "Stay within the peer mentor role. Never diagnose, prescribe, or provide clinical interventions." },
    { title: 'Honesty & Transparency', desc: "Be honest about your role, your limits, and your own state of wellbeing." },
    { title: 'Sustained Commitment', desc: "Honour your conversation commitments and use the Pause feature responsibly." }
  ];

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100/50">
          <Award size={40} />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4 text-center">Final Step: Code of Conduct</h1>
        <p className="text-slate-500 max-w-xl mx-auto">Your certification is ready. Please sign the shared promise between every Peer Mentor and our users.</p>
      </div>

      <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-2xl mb-8">
        <div className="space-y-8">
          {COMMITMENTS.map((c, i) => (
            <div key={i} className="flex gap-6">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-primary shrink-0 border border-slate-100">{i+1}</div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">{c.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 p-8 bg-primary/5 rounded-[2rem] border border-primary/10">
          <label className="flex items-start gap-4 cursor-pointer">
            <input 
              type="checkbox" 
              className="w-6 h-6 rounded accent-primary mt-1" 
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span className="text-slate-700 font-bold leading-relaxed">
              I have read and agree to uphold the PeerLine Code of Conduct. I understand that my certification is conditional upon these commitments.
            </span>
          </label>
        </div>
      </div>

      <button 
        disabled={!accepted}
        onClick={() => router.push('/peerline/dashboard')}
        className="w-full btn-primary py-5 text-xl disabled:opacity-50 shadow-xl shadow-primary/20"
      >
        Sign & Enter Workspace
      </button>
    </div>
  );
}
