"use client";

import { useState, useEffect } from "react";
import TaskBrowsingCard from "./TaskBrowsingCard";
import TaskDetail from "./TaskDetail";
import { Task } from "./types";

export const sampleTasks: Task[] = [];

export default function TasksBoard({
  tasks = sampleTasks,
}: {
  tasks?: Task[];
}) {
  const [selectedId, setSelectedId] = useState(tasks[0]?.id);

  useEffect(() => {
    if (tasks.length > 0) {
      setSelectedId(tasks[0].id);
    }
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-lg">لا توجد نتائج.</p>
      </div>
    );
  }

  const selectedTask = tasks.find((t) => t.id === selectedId) ?? tasks[0];

  return (
    <div className=" ">
      <div className="grid gap-4  grid-cols-1 md:grid-cols-2 ">
        {/* Left column: cards (each card has its own background) */}
        <div className="space-y-4">
          {tasks.map((t) => (
            <TaskBrowsingCard
              key={t.id}
              task={t}
              selected={t.id === selectedId}
              onClick={() => setSelectedId(t.id)}
            />
          ))}
        </div>

        {/* Right column: transparent area with company details */}
        <div className="bg-white h-[calc(100vh-2rem)] border rounded-md border-[#004d40] sticky top-5 overflow-hidden flex flex-col">
          <TaskDetail task={selectedTask} />
        </div>
      </div>
    </div>
  );
}
