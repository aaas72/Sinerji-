import StarRating from "../StarRating";

type RecommendationCardProps = {
  text: string;
  recommenderName: string;
  recommenderTitle: string;
  rating: number;
  index: number;
};

export default function RecommendationCard({
  text,
  recommenderName,
  recommenderTitle,
  rating,
  index,
}: RecommendationCardProps) {
  return (
    <div className="bg-gray-100 rounded-lg p-0 flex gap-8">
      {/* Index Icon */}
      <div className="bg-[#004D40] text-white w-10 h-10 rounded-tl-lg rounded-br-lg border-[#004D40] shrink-0 flex items-center justify-center font-bold text-lg ">
        {index}
      </div>

      {/* Main Content */}
      <div className="grow flex py-12 gap-8">
        {/* Left Side: Text */}
        <div className="w-2/3 text-gray-600 leading-relaxed pr-8">
          <p>{text}</p>
        </div>

        {/* Right Side: Recommender Info */}
        <div className="w-1/3 pl-8 border-l border-gray-200 flex flex-col justify-center space-y-6">
          <div>
            <h4 className="text-gray-500 font-semibold mb-3">
              Tavsiye Eden Taraf
            </h4>
            <div className="flex items-center gap-3">
              <div>
                <p className="font-bold text-primary">{recommenderName}</p>
                <p className="text-sm text-gray-500">{recommenderTitle}</p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-gray-500 font-semibold mb-2">
              Başarı Değerlendirmesi
            </h4>
            <StarRating rating={rating} />
          </div>
        </div>
      </div>
    </div>
  );
}
