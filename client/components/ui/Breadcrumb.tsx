import Link from "next/link";

interface BreadcrumbProps {
  items: { label: string; href?: string; active?: boolean }[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="text-xs text-gray-500 mb-2" aria-label="breadcrumb">
      <ol className="flex items-center gap-2">
        {items.map((item, idx) => (
          <div key={item.label} className="flex items-center gap-2">
            {item.href && !item.active ? (
              <li key={item.label}>
                <Link href={item.href} className="hover:underline text-gray-600">
                  {item.label}
                </Link>
              </li>
            ) : (
              <li key={item.label} className="text-yellow-600 font-semibold">
                {item.label}
              </li>
            )}
            {idx < items.length - 1 && (
              <li className="mx-1 text-gray-400">/</li>
            )}
          </div>
        ))}
      </ol>
    </nav>
  );
}
