"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Trophy, CheckCircle2, AlertCircle, ArrowRight, Loader2, 
  HelpCircle, Shield, Award, ChevronRight, PlayCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

const ASSESSMENT_QUESTIONS = [
  // --- Episode 1: What Is Peer Support? ---
  {
    id: 1,
    question: "Which of the following best describes the primary role of a PeerLine Peer Mentor?",
    options: [
      "To diagnose the user's emotional condition and recommend treatment",
      "To listen empathetically, share lived experience selectively, and hold hope",
      "To give structured advice based on personal experience",
      "To be available 24/7 as a substitute for crisis services"
    ],
    answer: 1
  },
  {
    id: 2,
    question: "Peer support is neurologically distinct from professional help primarily because:",
    options: [
      "Peer mentors have more time to listen",
      "The lived-experience connection activates co-regulation pathways that reduce threat response",
      "Peer mentors are cheaper and more accessible",
      "There are no significant neurological differences"
    ],
    answer: 1
  },
  {
    id: 3,
    question: "What are the three foundational pillars of peer support on PeerLine?",
    options: [
      "Empathy, Boundaries, and Hope",
      "Advice, Expertise, and Clinical Care",
      "Friendship, Solutions, and Support",
      "Diagnosis, Referrals, and Treatment"
    ],
    answer: 0
  },
  {
    id: 4,
    question: "A user tells you they feel like a failure because they can't hold down a job. The most appropriate first response is:",
    options: [
      "Share a story about your own employment challenges to normalise theirs",
      "Suggest three strategies for job searching",
      "Acknowledge their feeling and invite them to tell you more",
      "Remind them that things could always be worse"
    ],
    answer: 2
  },
  {
    id: 5,
    question: "True or False: A Peer Mentor should never share their own lived experience under any circumstances.",
    options: [
      "True",
      "False (It can be shared selectively to help the user feel less alone)"
    ],
    answer: 1
  },

  // --- Episode 2: Listening Without Fixing ---
  {
    id: 6,
    question: "Active listening in a text-based environment means:",
    options: [
      "Responding immediately so the user knows you are there",
      "Reading the full message carefully, reflecting emotions back, and using open questions",
      "Keeping responses short so you don't overwhelm the user",
      "Repeating the user's words back to them verbatim"
    ],
    answer: 1
  },
  {
    id: 7,
    question: "A user directly asks: 'Just tell me what to do — should I leave my partner?' The best response is:",
    options: [
      "Give your honest opinion, as they asked for it directly",
      "Decline to answer and change the subject",
      "Acknowledge how difficult the decision must be and invite them to explore their own thoughts",
      "Refer them immediately to a couples therapist"
    ],
    answer: 2
  },
  {
    id: 8,
    question: "What is the 'Advice Trap' in peer support?",
    options: [
      "When a user gives the mentor advice",
      "The human instinct to fix and solve, which can undermine user autonomy",
      "A technique used to get users to listen better",
      "When a mentor runs out of things to say"
    ],
    answer: 1
  },
  {
    id: 9,
    question: "Which of these is an example of an open-ended question?",
    options: [
      "Are you feeling sad today?",
      "Did you talk to your mother yet?",
      "How does that situation feel for you right now?",
      "Do you want to end the session?"
    ],
    answer: 2
  },
  {
    id: 10,
    question: "Validation involves:",
    options: [
      "Agreeing with every decision the user has made",
      "Proving the user is right and their enemies are wrong",
      "Acknowledging that the user's emotions are understandable and human",
      "Telling the user they shouldn't feel that way"
    ],
    answer: 2
  },

  // --- Episode 3: Safeguarding & Crisis Recognition ---
  {
    id: 11,
    question: "Which of the following statements about asking directly about suicide is TRUE?",
    options: [
      "Asking directly about suicide significantly increases the risk of an attempt",
      "Asking directly about suicide reduces risk by opening dialogue and showing care",
      "You should never ask directly; use only indirect language",
      "Only licensed professionals should ask about suicidal ideation"
    ],
    answer: 1
  },
  {
    id: 12,
    question: "A user says 'I've been thinking about ways to not be here anymore.' The first step in the SAFE protocol is to:",
    options: [
      "Immediately send them the crisis helpline number",
      "End the conversation to protect your own wellbeing",
      "Stay present, acknowledge their pain, and keep them talking",
      "Ask them to confirm what they mean before taking action"
    ],
    answer: 2
  },
  {
    id: 13,
    question: "The SAFE protocol sequence stands for:",
    options: [
      "Stay, Acknowledge, Facilitate, Escalate",
      "Support, Assess, Follow-up, End",
      "Safety, Awareness, Focus, Empathy",
      "Security, Alert, Fix, Exit"
    ],
    answer: 0
  },
  {
    id: 14,
    question: "When does a Peer Mentor's confidentiality obligation end?",
    options: [
      "When the user is being rude",
      "When the mentor feels overwhelmed",
      "When there is a significant risk of harm to the user or others",
      "Never, under any circumstances"
    ],
    answer: 2
  },
  {
    id: 15,
    question: "A user discloses that a child in their home is being abused. Your correct action is:",
    options: [
      "Keep it confidential unless the user explicitly allows you to share",
      "Advise the user to report it themselves",
      "Follow the mandatory reporting protocol and escalate to the PeerLine Safety Team",
      "Listen and document, then review at your next supervision call"
    ],
    answer: 2
  },

  // --- Episode 4: Your Wellbeing as a Mentor ---
  {
    id: 16,
    question: "Secondary traumatic stress in peer mentors is most accurately described as:",
    options: [
      "Feeling tired after long conversations",
      "Trauma symptoms that arise from prolonged exposure to others' traumatic experiences",
      "A normal part of peer support that should be ignored",
      "Only relevant for professional therapists, not peer mentors"
    ],
    answer: 1
  },
  {
    id: 17,
    question: "Which of the following is NOT an appropriate self-care response after a difficult session?",
    options: [
      "Journaling about the conversation to process your feelings",
      "Immediately starting another conversation to distract yourself",
      "Taking a 20-minute walk before reviewing your next message",
      "Reaching out to the Mentor Circle for peer supervision"
    ],
    answer: 1
  },
  {
    id: 18,
    question: "What should you do if a conversation leaves you feeling deeply unsettled?",
    options: [
      "Ignore it and hope it goes away",
      "Decompress, practice self-care, and use the Mentor Circle or supervision",
      "Blame the user for sharing too much",
      "Post about it on social media to vent"
    ],
    answer: 1
  },
  {
    id: 19,
    question: "The PeerLine 'Pause' feature should be used when:",
    options: [
      "You want to avoid a specific user you don't like",
      "You are feeling emotionally dysregulated, overwhelmed, or taking a planned break",
      "The user stops responding for 2 minutes",
      "You want to increase your points by taking breaks"
    ],
    answer: 1
  },
  {
    id: 20,
    question: "Why is peer-to-peer supervision (the Mentor Circle) important after certification?",
    options: [
      "To compare how many points everyone has earned",
      "To provide a safe space for case reflection and preventing compassion fatigue",
      "To find more users to talk to",
      "It is not important once you are certified"
    ],
    answer: 1
  }
];

export default function FinalAssessmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<any>(null);
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const [agreements, setAgreements] = useState({
    confidentiality: false,
    safeguarding: false,
    boundaries: false
  });

  const checkStatus = useCallback(async () => {
    try {
      const res: any = await apiClient.get('/peerline/training/status');
      setStatus(res);
      // If already certified or submitted, don't allow re-taking unless specifically enabled
      if (res.lockUntil && new Date(res.lockUntil) > new Date()) {
        // Locked
      }
      if (res.certificationStatus === 'submitted') {
        router.push('/peerline/dashboard/training');
      }
    } catch (err) {
      console.error('Failed to check status:', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleAnswer = (optionIdx: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: optionIdx }));
  };

  const nextQuestion = () => {
    if (currentQuestion < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    let score = 0;
    ASSESSMENT_QUESTIONS.forEach((q, idx) => {
      if (answers[idx] === q.answer) score++;
    });
    
    const finalScore = Math.round((score / ASSESSMENT_QUESTIONS.length) * 100);
    
    try {
      await apiClient.post('/peerline/training/assessment', {
        score: finalScore,
        answers: answers
      });
      setResult({ score: finalScore, passed: finalScore >= 80 });
    } catch (err) {
      console.error('Failed to submit assessment:', err);
      alert('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-purple-500">
        <Loader2 className="animate-spin" size={40} />
        <span className="font-bold text-xl">Loading Assessment...</span>
      </div>
    );
  }

  if (status?.lockUntil && new Date(status.lockUntil) > new Date()) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-32 h-32 mx-auto rounded-[3rem] bg-amber-100 text-amber-600 flex items-center justify-center mb-8 shadow-2xl shadow-amber-200">
          <AlertCircle size={64} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-4">Assessment Locked</h2>
        <p className="text-lg text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">
          You've reached the maximum of 2 attempts. As per the Mentor Guide, you must wait for a 14-day cooling-off period before retaking the training and assessment.
        </p>
        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 inline-block mb-10">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Unlock Date</p>
          <p className="text-2xl font-black text-slate-800">{new Date(status.lockUntil).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
        </div>
        <button 
          onClick={() => router.push('/peerline/dashboard/training')}
          className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 mx-auto hover:bg-slate-800 transition-all shadow-xl"
        >
          Back to Training <ChevronRight size={20} />
        </button>
      </div>
    );
  }

  if (result) {
    const attemptsUsed = (status?.assessmentAttempts || 0) + (result.passed ? 0 : 1);
    const isNowLocked = !result.passed && attemptsUsed >= 2;

    return (
      <div className="max-w-2xl mx-auto py-20 text-center animate-in fade-in zoom-in duration-500">
        <div className={`w-32 h-32 mx-auto rounded-[3rem] flex items-center justify-center mb-8 shadow-2xl ${
          result.passed ? 'bg-green-100 text-green-600 shadow-green-200' : 'bg-red-100 text-red-600 shadow-red-200'
        }`}>
          {result.passed ? <Award size={64} /> : <AlertCircle size={64} />}
        </div>
        
        <h2 className="text-4xl font-black text-slate-900 mb-4">
          {result.passed ? 'Assessment Passed!' : 'Assessment Not Passed'}
        </h2>
        
        <div className="text-6xl font-black text-purple-600 mb-6">{result.score}%</div>
        
        <p className="text-lg text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">
          {result.passed 
            ? "Congratulations! You have passed the final assessment. Please complete the Code of Conduct agreement to submit your application."
            : isNowLocked 
              ? "You've used all 2 attempts and didn't reach the 80% threshold. The assessment is now locked for 14 days."
              : "You didn't reach the 80% passing threshold. You have 1 attempt remaining. Please review the training carefully before trying again."}
        </p>
        
        <button 
          onClick={() => {
            if (result.passed) {
              setResult(null);
              setStatus({ ...status, certificationStatus: 'pending_conduct' });
            } else {
              router.push('/peerline/dashboard/training');
            }
          }}
          className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 mx-auto hover:bg-slate-800 transition-all shadow-xl"
        >
          {result.passed ? 'Continue to Code of Conduct' : isNowLocked ? 'Return to Journey' : 'Review Training'} <ChevronRight size={20} />
        </button>
      </div>
    );
  }

  const handleAgreeConduct = async () => {
    setSubmitting(true);
    try {
      await apiClient.post('/peerline/training/conduct-agree');
      router.push('/peerline/dashboard/training');
    } catch (err) {
      console.error(err);
      alert('Failed to submit agreement.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status?.certificationStatus === 'pending_conduct') {
    const canSubmitConduct = agreements.confidentiality && agreements.safeguarding && agreements.boundaries;
    
    return (
      <div className="max-w-3xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">PeerLine Code of Conduct</h2>
          <p className="text-slate-500">Please review and agree to the following core principles to finalize your application.</p>
        </div>

        <div className="space-y-4 mb-8">
          <label className={`p-6 border-2 rounded-[2rem] flex gap-4 cursor-pointer transition-all ${agreements.confidentiality ? 'border-purple-600 bg-purple-50' : 'border-slate-100 hover:border-purple-200'}`}>
            <input 
              type="checkbox" 
              className="w-6 h-6 mt-1 rounded text-purple-600 focus:ring-purple-500 flex-shrink-0"
              checked={agreements.confidentiality}
              onChange={(e) => setAgreements(prev => ({ ...prev, confidentiality: e.target.checked }))}
            />
            <div>
              <h4 className={`font-bold text-lg mb-1 ${agreements.confidentiality ? 'text-purple-900' : 'text-slate-800'}`}>Strict Confidentiality</h4>
              <p className="text-sm text-slate-500 leading-relaxed">I will never share a user's personal details, conversation content, or identity outside of the PeerLine platform or the Mentor Circle, except as required by the Safeguarding protocol.</p>
            </div>
          </label>

          <label className={`p-6 border-2 rounded-[2rem] flex gap-4 cursor-pointer transition-all ${agreements.safeguarding ? 'border-purple-600 bg-purple-50' : 'border-slate-100 hover:border-purple-200'}`}>
            <input 
              type="checkbox" 
              className="w-6 h-6 mt-1 rounded text-purple-600 focus:ring-purple-500 flex-shrink-0"
              checked={agreements.safeguarding}
              onChange={(e) => setAgreements(prev => ({ ...prev, safeguarding: e.target.checked }))}
            />
            <div>
              <h4 className={`font-bold text-lg mb-1 ${agreements.safeguarding ? 'text-purple-900' : 'text-slate-800'}`}>Safeguarding & Escalation</h4>
              <p className="text-sm text-slate-500 leading-relaxed">I agree to follow the SAFE protocol. If a user indicates intent to harm themselves or others, or reveals abuse of a minor, I will escalate immediately to the Safety Team.</p>
            </div>
          </label>

          <label className={`p-6 border-2 rounded-[2rem] flex gap-4 cursor-pointer transition-all ${agreements.boundaries ? 'border-purple-600 bg-purple-50' : 'border-slate-100 hover:border-purple-200'}`}>
            <input 
              type="checkbox" 
              className="w-6 h-6 mt-1 rounded text-purple-600 focus:ring-purple-500 flex-shrink-0"
              checked={agreements.boundaries}
              onChange={(e) => setAgreements(prev => ({ ...prev, boundaries: e.target.checked }))}
            />
            <div>
              <h4 className={`font-bold text-lg mb-1 ${agreements.boundaries ? 'text-purple-900' : 'text-slate-800'}`}>Healthy Boundaries</h4>
              <p className="text-sm text-slate-500 leading-relaxed">I will not provide medical advice or act as a therapist. I will prioritize my own wellbeing by using the Pause feature when dysregulated and seeking support when needed.</p>
            </div>
          </label>
        </div>

        <button 
          disabled={!canSubmitConduct || submitting}
          onClick={handleAgreeConduct}
          className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-purple-200 hover:scale-[1.01] transition-all active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
        >
          {submitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} />}
          Agree & Submit Application
        </button>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-purple-600 p-12 text-white relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
          <h1 className="text-4xl font-black mb-4 relative z-10">Mentor Certification Assessment</h1>
          <p className="text-purple-100 text-lg relative z-10">Demonstrate your readiness to support the PeerLine community.</p>
        </div>
        
        <div className="p-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-3 mb-3 text-purple-600">
                <HelpCircle size={20} /> <span className="font-black text-xs uppercase tracking-widest">Format</span>
              </div>
              <p className="font-bold text-slate-900">20 Multiple Choice Questions</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-3 mb-3 text-purple-600">
                <PlayCircle size={20} /> <span className="font-black text-xs uppercase tracking-widest">Attempts Left</span>
              </div>
              <p className="font-bold text-slate-900">{Math.max(0, 2 - (status?.assessmentAttempts || 0))} Attempts Remaining</p>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-100 p-8 rounded-3xl">
            <h4 className="text-amber-800 font-black text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
              <AlertCircle size={16} /> Important Note
            </h4>
            <p className="text-amber-900 text-sm leading-relaxed">
              Once you start, you must complete the entire assessment. Your score and answers will be reviewed by the PeerLine administration team.
            </p>
          </div>
          
          <div className="pt-4 flex justify-between items-center">
            <button 
              onClick={() => router.push('/peerline/dashboard/training')}
              className="px-8 py-4 font-bold text-slate-400 hover:text-slate-900 transition-colors"
            >
              Back to Training
            </button>
            <button 
              onClick={() => setStarted(true)}
              className="bg-purple-600 text-white px-12 py-5 rounded-2xl font-black text-lg flex items-center gap-3 shadow-2xl shadow-purple-200 hover:scale-[1.02] transition-all active:scale-95"
            >
              Begin Assessment <PlayCircle size={24} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = ASSESSMENT_QUESTIONS[currentQuestion];
  const progress = Math.round(((currentQuestion + 1) / ASSESSMENT_QUESTIONS.length) * 100);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="mb-12 flex justify-between items-end">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-black tracking-widest uppercase mb-4">
            Question {currentQuestion + 1} of {ASSESSMENT_QUESTIONS.length}
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Final Assessment</h1>
        </div>
        <div className="text-right">
          <div className="text-sm font-black text-purple-600 mb-2">{progress}% Complete</div>
          <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-600 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl p-12 space-y-10">
        <h3 className="text-2xl font-bold text-slate-800 leading-relaxed">
          {q.question}
        </h3>
        
        <div className="grid gap-4">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className={`p-6 rounded-[2rem] border-2 text-left transition-all flex items-center justify-between group ${
                answers[currentQuestion] === idx 
                  ? 'border-purple-600 bg-purple-50 ring-4 ring-purple-100' 
                  : 'border-slate-100 hover:border-purple-200 hover:bg-slate-50'
              }`}
            >
              <span className={`text-lg font-bold ${answers[currentQuestion] === idx ? 'text-purple-700' : 'text-slate-600'}`}>
                {opt}
              </span>
              <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                answers[currentQuestion] === idx 
                  ? 'bg-purple-600 border-purple-600 text-white' 
                  : 'border-slate-200 group-hover:border-purple-300'
              }`}>
                {answers[currentQuestion] === idx && <CheckCircle2 size={16} />}
              </div>
            </button>
          ))}
        </div>

        <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
          <button 
            disabled={currentQuestion === 0}
            onClick={prevQuestion}
            className="px-8 py-4 font-bold text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-30"
          >
            Previous
          </button>
          
          {currentQuestion === ASSESSMENT_QUESTIONS.length - 1 ? (
            <button 
              disabled={answers[currentQuestion] === undefined || submitting}
              onClick={handleSubmit}
              className="bg-purple-600 text-white px-12 py-5 rounded-2xl font-black text-lg flex items-center gap-3 shadow-2xl shadow-purple-200 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" /> : <Trophy size={24} />}
              Submit Assessment
            </button>
          ) : (
            <button 
              disabled={answers[currentQuestion] === undefined}
              onClick={nextQuestion}
              className="bg-purple-600 text-white px-12 py-5 rounded-2xl font-black text-lg flex items-center gap-3 shadow-2xl shadow-purple-200 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50"
            >
              Next Question <ArrowRight size={24} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
