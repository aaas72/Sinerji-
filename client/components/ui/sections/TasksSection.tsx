"use client";
import { useState } from "react";
import TaskCard from "@/components/ui/cards/TaskCard";
import InfoBanner from "@/components/ui/InfoBanner";
import MainSection from "@/components/ui/layouts/MainSection";
import MainSectionTitle from "@/components/ui/MainSectionTitle";

export default function TasksSection({ studentData }: { studentData: any }) {
  const [visibleTasks, setVisibleTasks] = useState(2);

  const handleShowMore = () => {
    setVisibleTasks((prev) => prev + 2);
  };

  return (
    <div className="section-four-tasks">
      <MainSectionTitle title="Tamamlanan Görevler" variant="secondary" />
      <MainSection hideHeader className="p-8">
        <InfoBanner text={studentData.tasks.infoText} />
        <div className="space-y-6 mt-8">
          {studentData.tasks.cards.slice(0, visibleTasks).map((task: any, index: number) => (
            <TaskCard
              key={index}
              index={index + 1}
              title={task.title}
              description={task.description}
              date={task.date}
              companyName={task.companyName}
              rating={task.rating}
            />
          ))}
        </div>
        {visibleTasks < studentData.tasks.cards.length && (
          <div className="text-center mt-8">
            <button
              onClick={handleShowMore}
              className="text-primary font-semibold hover:underline"
            >
              Show More ...
            </button>
          </div>
        )}
      </MainSection>
    </div>
  );
}
