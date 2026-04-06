import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-primary text-white">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-wide">SİNERJİ</Link>
        <nav className="flex items-center gap-4">
          <Link href="/" className="hover:opacity-90">Ana Sayfa</Link>
          <Link href="/about" className="hover:opacity-90">Hakkımızda</Link>
        </nav>
      </div>
    </header>
  );
}