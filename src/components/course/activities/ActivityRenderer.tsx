"use client";

import React from "react";
import { CourseActivity, ChapterColors } from "@/services/course.service";
import { CycleMoonActivity } from "./CycleMoonActivity";
import { FlipCollectActivity } from "./FlipCollectActivity";
import { ScenarioActivity } from "./ScenarioActivity";
import { SortActivity } from "./SortActivity";
import { SequenceActivity } from "./SequenceActivity";
import { BranchingStoryActivity } from "./BranchingStoryActivity";
import { BodyHotspotActivity } from "./BodyHotspotActivity";
import { MoodGardenActivity } from "./MoodGardenActivity";

interface ActivityRendererProps {
  activity: CourseActivity;
  colors: ChapterColors;
  nextHref: string;
  onComplete: (result: { score: number; flags?: string[] }) => void;
}

export function ActivityRenderer({
  activity,
  colors,
  nextHref,
  onComplete,
}: ActivityRendererProps) {
  const commonProps = {
    config: activity.config || {},
    instructions: activity.instructions || "",
    colors: {
      background: colors?.background || "#E3F0FA",
      ink: colors?.ink || "#2F6494",
      accent: colors?.accent || "#8EBFE0",
      soft: colors?.soft || "#E3F0FA",
    },
    petalsOnComplete: activity.petalsOnComplete || 10,
    nextHref,
    onComplete,
  };

  switch (activity.engine) {
    case "cycle_moon":
      return <CycleMoonActivity {...commonProps} />;
    case "flip_collect":
      return <FlipCollectActivity {...commonProps} />;
    case "scenario":
      return <ScenarioActivity {...commonProps} />;
    case "sort":
      return <SortActivity {...commonProps} />;
    case "sequence":
      return <SequenceActivity {...commonProps} />;
    case "branching_story":
      return <BranchingStoryActivity {...commonProps} />;
    case "body_hotspot":
      return <BodyHotspotActivity {...commonProps} />;
    case "mood_garden":
      return <MoodGardenActivity {...commonProps} />;
    default:
      return (
        <div className="bg-white rounded-3xl p-6 text-center text-[#5E4B6B]">
          Unsupported activity engine: <code>{activity.engine}</code>
        </div>
      );
  }
}

