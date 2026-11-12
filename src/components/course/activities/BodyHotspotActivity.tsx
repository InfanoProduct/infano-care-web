"use client";

import React, { useState } from "react";
import { AlertCircle, Check, X } from "lucide-react";
import { ActivityProps } from "./CycleMoonActivity";
import { ActivityResultCard } from "./ActivityResultCard";

export function BodyHotspotActivity({
  config,
  instructions,
  colors,
  petalsOnComplete,
  nextHref,
  onComplete,
}: ActivityProps) {
  const tools: Array<{
    id: string;
    name: string;
    icon_svg_path: string;
  }> = config.tools || [];

  const spots: Array<{
    id: string;
    name: string;
    x_percent: number;
    y_percent: number;
    helpful_tool_ids: string[];
    min_correct_to_soothe: number;
    tip: string;
  }> = config.spots || [];

  const [openSpotId, setOpenSpotId] = useState<string | null>(null);
  const [triedBySpot, setTriedBySpot] = useState<Record<string, string[]>>({});
  const [reported, setReported] = useState(false);

  const isSpotSoothed = (sp: (typeof spots)[0]) => {
    const tried = triedBySpot[sp.id] || [];
    const correctCount = tried.filter((tid) => sp.helpful_tool_ids.includes(tid)).length;
    return correctCount >= (sp.min_correct_to_soothe || 2);
  };

  const soothedCount = spots.filter(isSpotSoothed).length;
  const finished = soothedCount === spots.length && spots.length > 0 && openSpotId === null;
  const currentSpot = spots.find((s) => s.id === openSpotId) || null;

  const handlePickTool = (toolId: string) => {
    if (!currentSpot) return;
    const prev = triedBySpot[currentSpot.id] || [];
    if (prev.includes(toolId)) return;
    const nextTried = { ...triedBySpot, [currentSpot.id]: [...prev, toolId] };
    setTriedBySpot(nextTried);

    // Check if all spots are now soothed (will trigger finish on close)
    const allDone = spots.every((sp) => {
      const t = nextTried[sp.id] || [];
      return t.filter((id) => sp.helpful_tool_ids.includes(id)).length >= (sp.min_correct_to_soothe || 2);
    });
    if (allDone && !reported) {
      setReported(true);
      onComplete({ score: 100 });
    }
  };

  const reset = () => {
    setOpenSpotId(null);
    setTriedBySpot({});
  };

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto w-full">
      <p className="m-0 text-sm sm:text-base text-[#4A3A57]">
        {config.instructions || instructions}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Interactive Body Map */}
        <div className="lg:col-span-7 relative h-[380px] rounded-[28px] bg-white border border-[#F1E4E8] shadow-sm overflow-hidden flex items-center justify-center">
          <svg
            width="354"
            height="380"
            viewBox="0 0 354 380"
            role="img"
            aria-label="Gigi's body map with comfort spots"
            className="max-w-full h-full"
          >
            <circle cx="177" cy="70" r="40" fill="#E9C2A6" />
            <circle cx="148" cy="40" r="16" fill="#3D2C4A" />
            <circle cx="206" cy="40" r="16" fill="#3D2C4A" />
            <path
              d="M137 66c4-22 20-32 40-32s36 10 40 32c-10-12-24-16-40-16s-30 4-40 16z"
              fill="#3D2C4A"
            />
            <path d="M120 130c10-12 32-18 57-18s47 6 57 18l14 230H106z" fill={colors.background} />
            <path
              d="M120 130l-30 120M234 130l30 120"
              stroke="#E9C2A6"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <path
              d="M150 212c10 8 44 8 54 0"
              stroke="#FFFFFF"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              opacity="0.7"
            />
          </svg>

          {spots.map((sp) => {
            const ok = isSpotSoothed(sp);
            return (
              <button
                key={sp.id}
                type="button"
                onClick={() => setOpenSpotId(sp.id)}
                style={{ left: `${sp.x_percent}%`, top: `${sp.y_percent}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 min-h-[42px] pl-2 pr-3 rounded-full inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-all hover:scale-105 ${
                  ok
                    ? "bg-[#EAF7F1] text-[#1F5A45] border border-[#2F7F62]/30"
                    : "bg-white text-[#3D2C4A] shadow-md border border-[#F1E4E8]"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full grid place-items-center text-white text-[11px] ${
                    ok ? "bg-[#2F7F62]" : "bg-[#F4A3B4] animate-pulse"
                  }`}
                >
                  {ok ? <Check size={12} /> : ""}
                </span>
                <span className="whitespace-nowrap">{sp.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Status + Medical Warning */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-[24px] p-5 border border-[#F1E4E8] shadow-xs flex flex-col gap-3">
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.ink }}>
              {soothedCount} of {spots.length} spots soothed
            </div>
            <div className="flex flex-col gap-2">
              {spots.map((sp) => {
                const ok = isSpotSoothed(sp);
                return (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => setOpenSpotId(sp.id)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-bold cursor-pointer border transition-colors ${
                      ok
                        ? "bg-[#EAF7F1] border-[#2F7F62]/30 text-[#1F5A45]"
                        : "bg-[#FFFAF6] border-[#F1E4E8] text-[#3D2C4A] hover:border-[#9A4A16]/40"
                    }`}
                  >
                    <span>{sp.name}</span>
                    <span className="text-xs">{ok ? "Soothed ✓" : "Tap to soothe →"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {config.warning && (
            <div className="bg-white rounded-2xl p-4 border border-[#F1E4E8] flex gap-3 items-start text-xs sm:text-sm font-medium text-[#3D2C4A]">
              <AlertCircle size={18} className="text-[#A8365A] shrink-0 mt-0.5" />
              <span>{config.warning}</span>
            </div>
          )}
        </div>
      </div>

      {finished && (
        <ActivityResultCard
          title={config.done_title || "Toolbox ready!"}
          line={config.done_line || ""}
          scoreLine={`${spots.length} of ${spots.length} spots soothed`}
          bg={colors.background}
          ink={colors.ink}
          accent={colors.accent}
          petalsAwarded={petalsOnComplete}
          nextHref={nextHref}
          onReplay={reset}
        />
      )}

      {/* Comfort Tool Picker Sheet / Modal */}
      {currentSpot && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#3D2C4A]/40 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in"
          onClick={() => setOpenSpotId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg bg-white rounded-t-[28px] sm:rounded-[28px] p-6 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95"
          >
            <div className="flex items-center justify-between">
              <h3 className="m-0 font-['Baloo_2',sans-serif] font-bold text-2xl text-[#3D2C4A]">
                {currentSpot.name}
              </h3>
              <button
                type="button"
                onClick={() => setOpenSpotId(null)}
                className="w-9 h-9 rounded-full bg-[#FFFAF6] hover:bg-[#F1E4E8] grid place-items-center text-[#3D2C4A] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="m-0 text-sm text-[#4A3A57]">
              Pick the comfort tools that help. Find {currentSpot.min_correct_to_soothe || 2} or more!
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {tools.map((tool) => {
                const tried = (triedBySpot[currentSpot.id] || []).includes(tool.id);
                const helpful = currentSpot.helpful_tool_ids.includes(tool.id);
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => handlePickTool(tool.id)}
                    aria-pressed={tried}
                    className={`min-h-[64px] rounded-2xl px-3 py-2.5 flex items-center gap-2.5 text-left font-semibold text-sm cursor-pointer border-2 transition-all ${
                      !tried
                        ? "border-[#E9DDE6] bg-white text-[#3D2C4A] hover:border-[#9A4A16]"
                        : helpful
                        ? "border-[#2F7F62] bg-[#EAF7F1] text-[#1F5A45]"
                        : "border-[#E9DDE6] bg-[#F6F1F4] text-[#8A7896]"
                    }`}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0"
                    >
                      <path d={tool.icon_svg_path} />
                    </svg>
                    <span>
                      <span className="block leading-tight">{tool.name}</span>
                      {tried && (
                        <span className="block text-[11px] font-medium opacity-85">
                          {helpful ? "Helps!" : "Not for this one"}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {isSpotSoothed(currentSpot) && (
              <div className="bg-[#EAF7F1] text-[#1F5A45] rounded-2xl p-3.5 text-sm font-medium animate-in fade-in">
                <strong>Soothed!</strong> {currentSpot.tip}
              </div>
            )}

            <button
              type="button"
              onClick={() => setOpenSpotId(null)}
              className="min-h-[52px] rounded-full bg-[#3D2C4A] hover:bg-[#2F213A] text-white font-bold text-base cursor-pointer"
            >
              {isSpotSoothed(currentSpot) ? "Back to the body map" : "Close"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

