"use client";

import React from "react";
import Link from "next/link";
import { RotateCcw, ArrowRight } from "lucide-react";

interface ActivityResultCardProps {
  title: string;
  line: string;
  scoreLine?: string;
  bg: string;
  ink: string;
  accent: string;
  outroSteps?: string[];
  petalsAwarded?: number;
  nextHref: string;
  nextLabel?: string;
  onReplay: () => void;
  replayLabel?: string;
}

export function ActivityResultCard({
  title,
  line,
  scoreLine,
  bg,
  ink,
  accent,
  outroSteps = [],
  petalsAwarded = 10,
  nextHref,
  nextLabel = "Next: Discover",
  onReplay,
  replayLabel = "Play again",
}: ActivityResultCardProps) {
  return (
    <div className="bg-white rounded-[28px] p-6 sm:p-8 flex flex-col items-center text-center gap-4 shadow-md border border-[#F1E4E8] animate-in zoom-in-95 duration-300 max-w-xl mx-auto w-full">
      <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="54" fill={bg} />
        <g transform="translate(60 60)">
          <ellipse rx="12" ry="22" cy="-20" fill="#F4A3B4" />
          <ellipse rx="12" ry="22" cy="-20" fill="#FFE08A" transform="rotate(72)" />
          <ellipse rx="12" ry="22" cy="-20" fill={accent} transform="rotate(144)" />
          <ellipse rx="12" ry="22" cy="-20" fill="#E3DAF5" transform="rotate(216)" />
          <ellipse rx="12" ry="22" cy="-20" fill="#D4EFE4" transform="rotate(288)" />
          <circle r="10" fill="#FFFFFF" />
        </g>
      </svg>

      <h2 className="m-0 font-['Baloo_2',sans-serif] font-bold text-2xl sm:text-3xl leading-tight text-[#3D2C4A]">
        {title}
      </h2>
      <p className="m-0 text-sm sm:text-base text-[#4A3A57] max-w-md">{line}</p>

      {scoreLine && (
        <div className="font-bold text-sm sm:text-base" style={{ color: ink }}>
          {scoreLine} · +{petalsAwarded} petals
        </div>
      )}

      {outroSteps.length > 0 && (
        <ol className="list-none m-0 p-0 w-full flex flex-col gap-2 text-left mt-1">
          {outroSteps.map((step, idx) => (
            <li
              key={idx}
              style={{ backgroundColor: bg }}
              className="flex gap-3 items-center rounded-2xl px-4 py-2.5 font-bold text-sm text-[#3D2C4A]"
            >
              <span
                style={{ color: ink }}
                className="shrink-0 w-7 h-7 rounded-full bg-white grid place-items-center text-xs font-extrabold"
              >
                {idx + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="w-full flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onReplay}
          className="sm:w-auto min-h-[50px] px-5 rounded-full border-2 border-[#E9DDE6] hover:border-[#3D2C4A] text-[#3D2C4A] font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <RotateCcw size={16} />
          <span>{replayLabel}</span>
        </button>
        <Link
          href={nextHref}
          className="flex-1 min-h-[52px] px-6 rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-base inline-flex items-center justify-center gap-2 shadow-md transition-colors"
        >
          <span>{nextLabel}</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}

