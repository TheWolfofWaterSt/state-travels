import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-gray-900 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          States I&apos;ve Visited
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/" className="text-gray-300 hover:text-white">
            Map
          </Link>
          <Link href="/login" className="text-gray-300 hover:text-white">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
