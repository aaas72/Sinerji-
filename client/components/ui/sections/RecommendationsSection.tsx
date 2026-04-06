"use client";
import { useState } from "react";
import RecommendationCard from "@/components/ui/cards/RecommendationCard";
import InfoBanner from "@/components/ui/InfoBanner";
import MainSection from "@/components/ui/layouts/MainSection";
import MainSectionTitle from "@/components/ui/MainSectionTitle";

export default function RecommendationsSection({
  studentData,
}: {
  studentData: any;
}) {
  const [currentCard, setCurrentCard] = useState(0);

  const handleNext = () => {
    setCurrentCard(
      (prev) => (prev + 1) % studentData.recommendations.cards.length
    );
  };

  const handlePrev = () => {
    setCurrentCard(
      (prev) =>
        (prev - 1 + studentData.recommendations.cards.length) %
        studentData.recommendations.cards.length
    );
  };

  return (
    <div className="section-three-recommendations">
      <MainSectionTitle title="Tavsiyeler" variant="secondary" />
      <MainSection hideHeader className="p-8">
        <InfoBanner text={studentData.recommendations.infoText} />
        <div className="relative mt-8">
          <RecommendationCard
            key={currentCard}
            index={currentCard + 1}
            text={studentData.recommendations.cards[currentCard].text}
            recommenderName={
              studentData.recommendations.cards[currentCard].recommenderName
            }
            recommenderTitle={
              studentData.recommendations.cards[currentCard].recommenderTitle
            }
            rating={studentData.recommendations.cards[currentCard].rating}
          />
          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute top-1/2 -left-5 -translate-y-1/2 bg-white text-primary w-10 h-10 rounded-full flex items-center justify-center shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute top-1/2 -right-5 -translate-y-1/2 bg-white text-primary w-10 h-10 rounded-full flex items-center justify-center shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </MainSection>
    </div>
  );
}
