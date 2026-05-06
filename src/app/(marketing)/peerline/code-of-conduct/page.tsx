"use client";

import { useState } from 'react';
import { Shield, CheckCircle2, Award, HeartHandshake } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

const COMMITMENTS = [
  {
    title: 'Confidentiality',
    desc: "Never share any user's identity, message content, or situation with anyone outside PeerLine. Exceptions apply only to mandatory safeguarding obligations."
  },
  {
    title: 'Non-Judgement',
    desc: "Approach every user's experience with unconditional positive regard, regardless of their choices, beliefs, lifestyle, or background."
  },
  {
    title: 'Scope Awareness',
    desc: "Stay within the peer mentor role. Never diagnose, prescribe, or provide clinical interventions. Always signpost professional services when appropriate."
  },
  {
    title: 'Honesty & Transparency',
    desc: "Be honest about your role, your limits, and your own state of wellbeing. Never claim qualifications you do not have."
  },
  {
    title: 'Sustained Commitment',
    desc: "Honour your conversation commitments. If you cannot continue, use the Pause feature with at least 48 hours' notice to active users."
  }
];

export default function CodeOfConductPage() {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [certified, setCertified] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      const savedDetails = localStorage.getItem('peerline_mentor_details');
      const details = savedDetails ? JSON.parse(savedDetails) : {};
      
      await apiClient.post('/peerline/mentor/onboard', { 
        topicIds: [],
        ...details
      });
      setCertified(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (certified) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white p-12 rounded-[2rem] border border-slate-100 shadow-2xl text-center animate-in zoom-in duration-500">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-100 text-green-500">
            <Award size={48} />
          </div>
          <h2 className="text-4xl font-bold mb-4">Certification Earned!</h2>
          <p className="text-xl text-slate-600 mb-8">
            You have successfully passed the PeerLine Mentor Certification and signed the Code of Conduct. Welcome to the team!
          </p>
          <div className="space-y-4">
            <p className="text-sm bg-slate-50 p-4 rounded-xl text-slate-600">
              As a guest user, your certification is temporarily saved to this device. Create an account to claim your permanent mentor badge and start accepting conversations!
            </p>
            <Link href="/register" className="btn-primary w-full py-4 text-lg inline-block">
              Create Account & Claim Badge
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold mb-6">
            <Shield size={16} /> Final Step
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 mb-4">
            PeerLine Code of Conduct
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The PeerLine Code of Conduct is not a legal document — it is a shared promise between every Peer Mentor and the users who trust them. Acceptance of this Code is a condition of certification.
          </p>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-slate-100 shadow-xl mb-8">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
            <HeartHandshake className="text-primary" size={32} />
            <h2 className="text-2xl font-bold text-slate-900">The Five Commitments</h2>
          </div>

          <div className="space-y-6">
            {COMMITMENTS.map((commitment, i) => (
              <div key={i} className="flex gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary font-black text-xl shadow-sm shrink-0">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{commitment.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{commitment.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">Prohibited Behaviours</h3>
            <p className="text-slate-600 mb-4">The following result in immediate suspension and review:</p>
            <ul className="space-y-2 list-disc list-inside text-slate-600 mb-8">
              <li>Sharing a user's personal information or conversation content outside the platform</li>
              <li>Attempting to move a conversation off-platform (other messaging apps, phone calls)</li>
              <li>Romantic or sexual communication of any kind with a user</li>
              <li>Religious, political, or ideological proselytising</li>
              <li>Giving clinical advice, recommending specific medications, or diagnosing mental health conditions</li>
              <li>Accepting payment or gifts from users</li>
              <li>Continuing conversations while in your own emotional crisis without activating the Pause feature</li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-slate-100 shadow-xl mb-8">
          <div className="pt-2">
            <label className="flex items-start gap-4 p-6 bg-primary/5 rounded-2xl cursor-pointer hover:bg-primary/10 transition-colors border border-primary/20">
              <input 
                type="checkbox" 
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="w-6 h-6 accent-primary mt-1 cursor-pointer"
              />
              <span className="text-lg font-bold text-slate-800">
                I have read and agree to uphold the PeerLine Code of Conduct. I understand that my certification is conditional upon these five commitments.
              </span>
            </label>

            <button 
              disabled={!accepted || loading}
              onClick={handleAccept}
              className="w-full btn-primary py-5 text-xl mt-8 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <CheckCircle2 size={24} /> Complete Certification
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
