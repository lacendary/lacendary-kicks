"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Sneaker Archive", href: "/archive" },
    { label: "Lacendary Picks", href: "/lacendary-picks" },
    { label: "Tale of the Tape", href: "/compare" },
    { label: "Articles", href: "/articles" },
    { label: "About Us", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/95 backdrop-blur">
      <div className="mx-auto flex h-16 lg:h-20 max-w-7xl items-center px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/LacendaryLogo.png"
            alt="Lacendary Kicks"
            width={240}
            height={70}
            priority
            className="h-12 w-auto sm:h-14 lg:h-16"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="ml-auto hidden lg:block">
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

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="ml-auto flex h-10 w-10 flex-col items-center justify-center lg:hidden"
          aria-label="Toggle Navigation"
        >
          <span
            className={`block h-0.5 w-7 bg-white transition-all duration-300 ${
              menuOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`my-1 block h-0.5 w-7 bg-white transition-all duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-7 bg-white transition-all duration-300 ${
              menuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>

      </div>

      {/* Mobile Navigation */}
      <nav
        className={`overflow-hidden bg-zinc-950 transition-all duration-300 ease-in-out lg:hidden ${
          menuOpen
            ? "max-h-96 opacity-100 border-t border-zinc-800"
            : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col py-4">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-zinc-900 hover:text-red-500"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}