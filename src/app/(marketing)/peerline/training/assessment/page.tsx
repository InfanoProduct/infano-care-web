"use client";

import { useState } from 'react';
import { ArrowLeft, CheckCircle2, AlertTriangle, Shield, Award, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

const ASSESSMENT_QUESTIONS = [
  {
    q: "What is the primary role of a PeerLine Mentor?",
    options: ["To diagnose mental health conditions", "To give expert medical advice", "To offer empathetic, lived-experience support", "To solve the user's problems"],
    ans: 2
  },
  {
    q: "Which of the following is NOT one of the three foundational pillars of peer support?",
    options: ["Empathy", "Boundaries", "Hope", "Clinical diagnosis"],
    ans: 3
  },
  {
    q: "What does 'co-regulation' refer to in peer support?",
    options: ["Matching the user's panic level", "Using your calm presence to help the user regulate their own emotions", "Regulating the platform's rules", "Telling the user to calm down"],
    ans: 1
  },
  {
    q: "When a user asks you what they should do about their relationship, you should:",
    options: ["Tell them what you would do", "Tell them what they should do", "Use open questions to help them explore their own thoughts", "Ignore the question"],
    ans: 2
  },
  {
    q: "In the SOLER active listening framework adapted for text, what does 'O' stand for?",
    options: ["Open questions", "Obvious answers", "Over-communicate", "Observe behavior"],
    ans: 0
  },
  {
    q: "Which of the following is an example of validation?",
    options: ["'It's not that bad.'", "'Other people have it worse.'", "'It makes complete sense that you feel overwhelmed right now.'", "'You shouldn't feel that way.'"],
    ans: 2
  },
  {
    q: "Why is unsolicited advice harmful in peer support?",
    options: ["It costs the user their autonomy", "It implies the mentor knows better", "It can invalidate the user's experience", "All of the above"],
    ans: 3
  },
  {
    q: "Which of these is an 'open question'?",
    options: ["Did you sleep well?", "Are you feeling sad?", "What did that experience feel like for you?", "Do you want to talk?"],
    ans: 2
  },
  {
    q: "If a user uses language indicating severe distress or hopelessness, this is a:",
    options: ["Green flag", "Sign to give advice", "Warning sign of potential crisis", "Sign they just need a friend"],
    ans: 2
  },
  {
    q: "Does asking a user directly if they are thinking of suicide increase the chance they will attempt it?",
    options: ["Yes, always", "Only if they are young", "No, this is a dangerous myth", "Yes, it puts the idea in their head"],
    ans: 2
  },
  {
    q: "What does the 'S' in the SAFE Crisis Response Sequence stand for?",
    options: ["Solve", "Stay", "Silence", "Support"],
    ans: 1
  },
  {
    q: "If a user says 'I don't think I can go on anymore', what is your immediate next step according to SAFE?",
    options: ["Acknowledge their pain and keep them talking", "End the chat", "Tell them to cheer up", "Give them advice on how to feel better"],
    ans: 0
  },
  {
    q: "When must a Peer Mentor's obligation to confidentiality be overridden?",
    options: ["When the mentor gets bored", "When there is an immediate risk of harm to the user or someone else", "When the user asks for money", "When the mentor disagrees with the user"],
    ans: 1
  },
  {
    q: "What is Secondary Traumatic Stress (STS)?",
    options: ["Stress from taking too many exams", "Trauma resulting from hearing about the firsthand trauma experiences of another", "Physical exhaustion from typing too much", "A myth"],
    ans: 1
  },
  {
    q: "Which of the following is a sign of Compassion Fatigue?",
    options: ["Feeling energized after every chat", "Feeling numb, irritable, or dreading sessions", "Wanting to take on more chats", "Feeling completely unaffected by users' stories"],
    ans: 1
  },
  {
    q: "What is the purpose of the PeerLine 'Pause' feature?",
    options: ["To pause the user's typing", "To temporarily stop receiving new conversations when a mentor needs a break", "To pause the internet connection", "To pause your certification"],
    ans: 1
  },
  {
    q: "Why are boundaries described as 'a gift, not a barrier'?",
    options: ["They keep interactions safe, predictable, and sustainable for both people", "They allow mentors to be mean", "They are a physical object", "They prevent users from talking"],
    ans: 0
  },
  {
    q: "Which of these is NOT an appropriate way to end a conversation?",
    options: ["Summarizing what was discussed", "Simply disconnecting without warning", "Wishing them well and reminding them they can return", "Acknowledging the work they did in the chat"],
    ans: 1
  },
  {
    q: "If a topic is too close to your own unresolved trauma, you should:",
    options: ["Push through it and ignore your feelings", "Politely decline the topic and refer them to another mentor or resource", "Tell the user they are triggering you", "Log off immediately without saying anything"],
    ans: 1
  },
  {
    q: "Peer mentors should:",
    options: ["Replace professional therapy", "Diagnose users", "Complement professional help by offering lived-experience connection", "Prescribe medication"],
    ans: 2
  }
];

export default function AssessmentWizard() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSelect = (optionIndex: number) => {
    setAnswers({ ...answers, [currentQuestion]: optionIndex });
  };

  const handleNext = () => {
    if (currentQuestion < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    let finalScore = 0;
    ASSESSMENT_QUESTIONS.forEach((q, i) => {
      if (answers[i] === q.ans) finalScore++;
    });
    setScore(finalScore);
    setSubmitted(true);

    const passed = (finalScore / ASSESSMENT_QUESTIONS.length) >= 0.8;
    
    if (passed) {
      setTimeout(() => {
        router.push('/peerline/code-of-conduct');
      }, 3000); // Give them 3 seconds to see they passed before redirecting
    }
  };

  if (submitted) {
    const passed = (score / ASSESSMENT_QUESTIONS.length) >= 0.8;
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white p-12 rounded-[2rem] border border-slate-100 shadow-2xl text-center animate-in zoom-in duration-500">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
            {passed ? <Award size={48} /> : <AlertTriangle size={48} />}
          </div>
          <h2 className="text-4xl font-bold mb-4">{passed ? 'Assessment Passed!' : 'Assessment Failed'}</h2>
          <p className="text-xl text-slate-600 mb-8">
            You scored <strong className="text-slate-900">{score} out of 20</strong> ({(score/20)*100}%).
            <br />
            {passed ? 'Redirecting to the final step: The Code of Conduct...' : 'You need 80% (16/20) to pass. Please review the episodes and try again.'}
          </p>
          
          {passed ? (
            <div className="animate-pulse flex flex-col items-center justify-center mt-4 text-slate-400">
               <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <button onClick={() => { setSubmitted(false); setAnswers({}); setCurrentQuestion(0); }} className="btn-primary w-full py-4">
              Retake Assessment
            </button>
          )}
        </div>
      </div>
    );
  }

  const q = ASSESSMENT_QUESTIONS[currentQuestion];
  const allAnswered = Object.keys(answers).length === ASSESSMENT_QUESTIONS.length;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        
        <div className="mb-8 flex items-center justify-between">
          <Link href="/peerline/training" className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
            <ArrowLeft size={16} /> Back
          </Link>
          <div className="text-sm font-black text-slate-400 tracking-widest">
            QUESTION {currentQuestion + 1} OF 20
          </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-slate-100 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 leading-relaxed">
            {q.q}
          </h2>

          <div className="space-y-4 mb-12">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`w-full text-left p-6 rounded-2xl border-2 transition-all ${
                  answers[currentQuestion] === i 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-slate-100 hover:border-primary/30 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    answers[currentQuestion] === i ? 'border-primary' : 'border-slate-300'
                  }`}>
                    {answers[currentQuestion] === i && <div className="w-3 h-3 bg-primary rounded-full" />}
                  </div>
                  <span className={`text-lg ${answers[currentQuestion] === i ? 'font-bold text-primary' : 'text-slate-700'}`}>
                    {opt}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center pt-8 border-t border-slate-100">
            <button 
              onClick={handlePrev}
              disabled={currentQuestion === 0}
              className="px-6 py-3 font-bold text-slate-500 hover:text-slate-900 disabled:opacity-30 flex items-center gap-2"
            >
              <ChevronLeft size={20} /> Previous
            </button>
            
            {currentQuestion === ASSESSMENT_QUESTIONS.length - 1 ? (
              <button 
                onClick={handleSubmit}
                disabled={!allAnswered || loading}
                className="btn-primary px-8 py-4 flex items-center gap-2"
              >
                Submit Assessment {loading && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full ml-2" />}
              </button>
            ) : (
              <button 
                onClick={handleNext}
                className="btn-primary px-8 py-3 flex items-center gap-2"
              >
                Next <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-1.5 mt-8 flex-wrap">
          {ASSESSMENT_QUESTIONS.map((_, i) => (
            <div 
              key={i} 
              className={`w-2.5 h-2.5 rounded-full ${
                currentQuestion === i 
                  ? 'bg-primary scale-125' 
                  : answers[i] !== undefined 
                    ? 'bg-primary/40' 
                    : 'bg-slate-200'
              } transition-all`} 
            />
          ))}
        </div>

      </div>
    </div>
  );
}
