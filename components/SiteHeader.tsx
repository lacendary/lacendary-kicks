import Link from "next/link";
import Image from "next/image";

export default function SiteHeader() {
  const navItems = [
    { label: "Home", href: "/" },
    { label: "Sneaker Archive", href: "/archive" },
    { label: "Lacendary Picks", href: "/picks" },
    { label: "Tale of the Tape", href: "/compare" },
    { label: "Articles", href: "/articles" },
    { label: "About Us", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-12 px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center mr-8">
          <Image
            src="/LacendaryLogo.png"
            alt="Lacendary Kicks"
            width={240}
            height={70}
            priority
            className="h-16 w-auto"
          />
        </Link>

        {/* Navigation */}
        <nav className="hidden lg:block ml-auto">
          <ul className="flex items-center gap-10">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm font-bold uppercase tracking-wide text-white transition-colors hover:text-red-500"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

      </div>
    </header>
  );
}