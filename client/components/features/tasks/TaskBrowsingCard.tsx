"use client";

import { cn } from "@/utils/cn";
import SkillBadge from "@/components/ui/SkillBadge";
import { FiBookmark } from "react-icons/fi";
import { Task, getRewardIcon } from "./types";

interface TaskBrowsingCardProps {
  task: Task;
  selected?: boolean;
  onClick?: () => void;
}

export default function TaskBrowsingCard({
  task,
  selected,
  onClick,
}: TaskBrowsingCardProps) {
  const hasMatchPercentage = typeof task.matchPercentage === "number";

  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer bg-white rounded-md p-6 transition-all relative",
        selected
          ? "border border-[#004d40] shadow-md"
          : "border border-gray-300 hover:border-gray-400"
      )}
    >
      {/* Top Right Actions */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {hasMatchPercentage && (
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm">
            AI % {task.matchPercentage}
          </div>
        )}
        <button className="text-gray-400 hover:text-[#004d40]">
          <FiBookmark size={20} />
        </button>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 mb-1 pr-10 leading-tight">
        {task.title}
      </h3>

      {/* Company Name */}
      <div className="text-gray-600 mb-1">{task.company.name}</div>

      {/* Location */}
      {task.location && (
        <div className="text-gray-500 mb-3">{task.location}</div>
      )}

      {/* Reward Type & Reward */}
      <div className="flex items-center justify-start mb-4">
        {(() => {
          const RewardIcon = getRewardIcon(task.rewardType);
          const displayText =
            task.rewardType === "Nakit" && task.rewardAmount
              ? task.rewardAmount
              : task.rewardType;
          if (!displayText) return null;

          return (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#004d40]">
                {displayText}
              </span>
              <span className="flex items-center justify-center w-6 h-6 rounded-full border border-[#004d40] text-[#004d40]">
                <RewardIcon className="w-4 h-4" />
              </span>
            </div>
          );
        })()}
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {task.tags.map((t, i) => (
            <SkillBadge key={i} label={t} className="text-xs px-2 py-0.5" />
          ))}
        </div>
      )}
    </div>
  );
}
