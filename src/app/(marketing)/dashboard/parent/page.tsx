import { ParentLinkManager } from "@/features/parent/components/ParentLinkManager";
import { HelpCircle } from "lucide-react";

export default function ParentDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="admin-header">
        <h1 className="text-3xl font-bold tracking-tight">Family Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your linked family accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <ParentLinkManager />

        {/* Linking FAQ */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-200/20 space-y-8 animate-in fade-in sticky top-8">
        <div>
          <h2 className="text-xl font-black text-slate-800 mb-2">How Linking Works</h2>
          <p className="text-sm font-semibold text-slate-500">Everything you need to know about connecting accounts safely.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
              <HelpCircle size={16} className="text-primary" /> How do I link an account?
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              1. One person must generate a Link Code.<br/>
              2. Share this secure 6-digit pin.<br/>
              3. The other person enters it to confirm the connection.
            </p>
          </div>

          <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
              <HelpCircle size={16} className="text-indigo-500" /> What is visible to the Parent?
            </h3>
            <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
              <li><strong>Program Progress:</strong> Which modules she has completed.</li>
              <li><strong>Session Attendance:</strong> If she attended her scheduled expert sessions.</li>
              <li><strong>Library Access:</strong> General topics she is exploring in the resource library.</li>
            </ul>
          </div>

          <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
              <HelpCircle size={16} className="text-rose-500" /> What is STRICTLY PRIVATE for the Teen?
            </h3>
            <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
              <li><strong>Session Notes:</strong> Private 1:1 discussions with experts remain 100% confidential.</li>
              <li><strong>Journal Entries:</strong> Any private reflections or mood tracking she does in the app.</li>
              <li><strong>Peerline Chat:</strong> Conversations in moderated community circles are not visible to parents.</li>
            </ul>
            <p className="text-xs font-semibold text-rose-500 mt-3 bg-white p-3 rounded-xl inline-block shadow-sm">
              Privacy builds trust. We strictly protect her safe space.
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
