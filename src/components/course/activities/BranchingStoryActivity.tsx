"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, ShoppingBag, Users, Clock, GraduationCap, DoorOpen, Heart, BookOpen } from "lucide-react";
import { ActivityProps } from "./CycleMoonActivity";

const PANEL_THEMES = [
  { bg: "#D8ECF8", ink: "#2F6494", Icon: BookOpen },
  { bg: "#FDEFF0", ink: "#A8365A", Icon: Users },
  { bg: "#FFF4C7", ink: "#8A6410", Icon: Clock },
  { bg: "#E3DAF5", ink: "#5A4385", Icon: GraduationCap },
  { bg: "#D4EFE4", ink: "#24735A", Icon: DoorOpen },
  { bg: "#FFE3CC", ink: "#9A4A16", Icon: ShoppingBag },
  { bg: "#FFE3CC", ink: "#9A4A16", Icon: Heart },
];

export function BranchingStoryActivity({
  config,
  petalsOnComplete,
  nextHref,
  onComplete,
}: ActivityProps) {
  const nodes: Array<{
    id: string;
    panel: number;
    text: string;
    gigi?: string;
    ask: string;
    choices: Array<{ label: string; next: string }>;
  }> = config.nodes || [];

  const packConfig = config.pack || { required_count: 5, items: [], correct_msg: "Good pick!", wrong_msg: "That one can stay at home." };
  const endConfig = config.end || {
    with_flag: { title: "Kit Packer badge!", line: "You planned ahead and handled it like a pro." },
    without_flag: { title: "Story complete!", line: "Asking for help is brave. Try again to find the bonus badge!" },
  };

  const [nodeId, setNodeId] = useState<string>(config.start_node || "start");
  const [path, setPath] = useState<string[]>([config.start_node || "start"]);
  const [usedKit, setUsedKit] = useState(false);
  const [kit, setKit] = useState<Record<string, boolean>>({});
  const [kitMsg, setKitMsg] = useState("Tap the things that belong in your pouch.");
  const [reported, setReported] = useState(false);

  const stage = nodeId === "pack" ? "pack" : nodeId === "done" ? "done" : "story";
  const curNode = nodes.find((n) => n.id === nodeId) || nodes[0];
  const letters = ["A", "B", "C", "D"];

  const handleChoice = (nextId: string) => {
    const nextUsedKit = usedKit || nextId === "endKit";
    setUsedKit(nextUsedKit);
    setNodeId(nextId);
    setPath((prev) => [...prev, nextId]);
  };

  const packItems: Array<{ label: string; correct: boolean }> = packConfig.items || [];
  const packedCorrectCount = packItems.filter((it) => it.correct && kit[it.label]).length;
  const requiredCount = packConfig.required_count || 5;

  const handleTapKitItem = (item: { label: string; correct: boolean }) => {
    const nextKit = { ...kit, [item.label]: !kit[item.label] };
    setKit(nextKit);
    const nextCount = packItems.filter((x) => x.correct && nextKit[x.label]).length;
    setKitMsg(item.correct ? packConfig.correct_msg : packConfig.wrong_msg);
    if (nextCount >= requiredCount) {
      setNodeId("done");
      setPath((prev) => [...prev, "done"]);
      if (!reported) {
        setReported(true);
        onComplete({ score: 100, flags: usedKit ? ["used_kit"] : [] });
      }
    }
  };

  const restart = () => {
    setNodeId(config.start_node || "start");
    setPath([config.start_node || "start"]);
    setUsedKit(false);
    setKit({});
    setKitMsg("Tap the things that belong in your pouch.");
  };

  const totalSteps = 7;
  const theme = PANEL_THEMES[(curNode?.panel || 1) - 1] || PANEL_THEMES[0];
  const PanelIcon = theme.Icon;

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto w-full">
      {/* Breadcrumb progress */}
      <div className="flex gap-1.5 items-center">
        {Array.from({ length: totalSteps }, (_, k) => (
          <span
            key={k}
            className={`h-2 flex-1 rounded-full transition-colors ${
              k < path.length ? "bg-[#2F7F62]" : "bg-white"
            }`}
          />
        ))}
      </div>

      {stage === "story" && curNode && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[26px] overflow-hidden shadow-md border border-[#F1E4E8]">
            <div
              style={{ backgroundColor: theme.bg }}
              className="h-[200px] sm:h-[230px] grid place-items-center relative"
            >
              <PanelIcon size={88} style={{ color: theme.ink }} strokeWidth={1.3} />
              <span className="absolute left-3.5 bottom-3 bg-white/90 rounded-full px-3 py-1 text-xs font-bold text-[#5E4B6B]">
                Scene {curNode.panel}
              </span>
            </div>
            <div className="p-5 sm:p-6 flex flex-col gap-3">
              <div className="font-['Baloo_2',sans-serif] font-semibold text-xl sm:text-2xl leading-snug text-[#3D2C4A]">
                {curNode.text}
              </div>
              {curNode.gigi && (
                <div className="bg-[#FFF4C7] rounded-2xl px-4 py-2.5 text-sm font-semibold text-[#3D2C4A]">
                  <strong>Gigi:</strong> {curNode.gigi}
                </div>
              )}
            </div>
          </div>

          <div className="text-sm font-bold text-[#24533F]">{curNode.ask}</div>

          <div className="flex flex-col gap-2.5">
            {curNode.choices.map((ch, k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleChoice(ch.next)}
                className="flex items-center gap-3 text-left min-h-[58px] px-4 py-3 rounded-2xl border-2 border-[#B9E1CF] hover:border-[#24735A] bg-white text-[#3D2C4A] font-semibold text-base cursor-pointer transition-all shadow-2xs"
              >
                <span className="shrink-0 w-8 h-8 rounded-full bg-[#D4EFE4] text-[#24735A] grid place-items-center font-bold text-sm">
                  {letters[k]}
                </span>
                <span>{ch.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {stage === "pack" && (
        <div className="bg-white rounded-[26px] p-6 shadow-md border border-[#F1E4E8] flex flex-col gap-4 animate-in zoom-in-95">
          <div className="font-['Baloo_2',sans-serif] font-bold text-2xl text-[#3D2C4A]">
            Now pack your own school pouch!
          </div>
          <div className="text-sm font-bold text-[#24735A]">
            {packedCorrectCount} / {requiredCount} essentials packed
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {packItems.map((it) => {
              const on = !!kit[it.label];
              return (
                <button
                  key={it.label}
                  type="button"
                  onClick={() => handleTapKitItem(it)}
                  aria-pressed={on}
                  className={`min-h-[54px] rounded-2xl text-left px-3.5 py-2 font-semibold text-sm cursor-pointer transition-all border ${
                    !on
                      ? "bg-[#FBF8F6] border-[#E9DDE6] text-[#3D2C4A] hover:border-[#24735A]"
                      : it.correct
                      ? "bg-[#D4EFE4] border-[#5FB28C] text-[#1F5A45]"
                      : "bg-[#FFE3CC] border-[#F0AF7E] text-[#7A3F14]"
                  }`}
                >
                  {on ? (it.correct ? "✓ " : "× ") : "+ "}
                  {it.label}
                </button>
              );
            })}
          </div>

          <div className="min-h-[46px] bg-[#FBF8F6] rounded-2xl px-4 py-2.5 text-sm font-medium text-[#3D2C4A]">
            {kitMsg}
          </div>
        </div>
      )}

      {stage === "done" && (
        <div className="bg-[#3D2C4A] text-white rounded-[28px] p-7 text-center flex flex-col gap-4 items-center shadow-lg animate-in zoom-in-95">
          <ShoppingBag size={60} className="text-[#FFE08A]" strokeWidth={1.6} />
          <div className="font-['Baloo_2',sans-serif] font-bold text-2xl sm:text-3xl">
            {usedKit ? endConfig.with_flag.title : endConfig.without_flag.title}
          </div>
          <div className="text-sm sm:text-base text-[#EFE6F2] max-w-md">
            {(usedKit ? endConfig.with_flag.line : endConfig.without_flag.line)} · +{petalsOnComplete} petals
          </div>
          <Link
            href={nextHref}
            className="w-full max-w-xs min-h-[52px] rounded-full bg-[#A8D8BE] hover:bg-[#95CEAF] text-[#1F4A38] font-bold text-base inline-flex items-center justify-center gap-2 transition-colors"
          >
            <span>Next: Discover</span>
            <ArrowRight size={18} />
          </Link>
          <button
            type="button"
            onClick={restart}
            className="min-h-[40px] text-sm font-semibold text-white/90 hover:text-white underline cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCcw size={14} />
            <span>Try a different path</span>
          </button>
        </div>
      )}
    </div>
  );
}

