export default function Footer() {
  return (
    <footer className="w-full bg-secondary text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm">
        <p>© {new Date().getFullYear()} Sinerji. Tüm hakları saklıdır.</p>
      </div>
    </footer>
  );
}