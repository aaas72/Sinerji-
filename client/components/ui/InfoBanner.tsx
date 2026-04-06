import { FiInfo } from 'react-icons/fi';

type InfoBannerProps = {
  text: string;
};

export default function InfoBanner({ text }: InfoBannerProps) {
  return (
    <div className="bg-gray-100 p-4 rounded-md flex items-center gap-3 mb-6">
      <FiInfo className="text-gray-500 w-5 h-5 shrink-0" />
      <p className="text-gray-600 text-sm">{text}</p>
    </div>
  );
}
