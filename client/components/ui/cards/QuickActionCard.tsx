"use client";
import React from "react";
import Link from "next/link";
import { IconType } from "react-icons";
import { cn } from "@/utils/cn";

type QuickActionCardProps = {
  href: string;
  title: string;
  description: string;
  icon: IconType;
  className?: string;
};

export default function QuickActionCard({
  href,
  title,
  description,
  icon: Icon,
  className,
}: QuickActionCardProps) {
  return (
    <Link href={href} className={cn("block group ", className)}>
      <div className="bg-gray-100  border border-gray-200 rounded-md transition-colors cursor-pointer flex flex-col items-center justify-center py-12 text-center gap-4">
        <div
          className={cn(
            "w-10 h-10 p-2 border border-gray-primary rounded-full flex items-center justify-center transition-transform"
          )}
        >
          <Icon className="text-gray-primary m-0" size={32} />
        </div>
        <div>
          <h3 className="font-bold text-md text-secondary">{title}</h3>
          <p className="text-sm text-gray-500 ">{description}</p>
        </div>
      </div>
    </Link>
  );
}
