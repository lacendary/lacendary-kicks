"use client";

import { useEffect, useState } from "react";
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

  // Prevent page scrolling when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/95 backdrop-blur">
        <div className="page-width flex h-16 items-center lg:h-20">

          {/* ================================================================
              Logo
          ================================================================ */}

          <Link
            href="/"
            className="flex items-center"
            onClick={() => setMenuOpen(false)}
          >
            <Image
              src="/LacendaryLogo.png"
              alt="Lacendary Kicks"
              width={240}
              height={70}
              priority
              className="h-12 w-auto sm:h-14 lg:h-16"
            />
          </Link>

          {/* ================================================================
              Desktop Navigation
          ================================================================ */}

          <nav className="ml-auto hidden lg:block">
            <ul className="flex items-center gap-10">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm font-bold uppercase tracking-wide text-white transition-fast hover:text-red-500"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ================================================================
              Hamburger
          ================================================================ */}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Navigation"
            className="ml-auto flex h-10 w-10 flex-col items-center justify-center lg:hidden"
          >
            <span
              className={`block h-0.5 w-7 bg-white transition-fast ${
                menuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />

            <span
              className={`my-1 block h-0.5 w-7 bg-white transition-fast ${
                menuOpen ? "opacity-0" : ""
              }`}
            />

            <span
              className={`block h-0.5 w-7 bg-white transition-fast ${
                menuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </header>

      {/* ================================================================
          Backdrop
      ================================================================ */}

      <div
        onClick={() => setMenuOpen(false)}
        className={`
          fixed
          inset-0
          z-40

          bg-black/60
          backdrop-blur-sm

          transition-fast

          ${
            menuOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }

          lg:hidden
        `}
      />

      {/* ================================================================
          Mobile Navigation
      ================================================================ */}

      <nav
        className={`
          fixed
          left-0
          right-0
          top-16
          z-50

          border-b
          border-zinc-800

          bg-[#050505]/95
          backdrop-blur-xl

          shadow-2xl

          transition-fast
          ease-out

          ${
            menuOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-6 opacity-0 pointer-events-none"
          }

          lg:hidden
        `}
      >
        <ul className="py-4">
          {navItems.map((item, index) => (
            <li
              key={item.href}
              className="overflow-hidden"
            >
              <Link
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`
                  block
                  px-6
                  py-4

                  font-bebas
                  text-[2rem]
                  uppercase
                  tracking-wide

                  text-white

                  transition-fast

                  hover:bg-zinc-900
                  hover:text-red-500

                  ${
                    menuOpen
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-4 opacity-0"
                  }
                `}
                style={{
                  transitionDelay: menuOpen
                    ? `${index * 40}ms`
                    : "0ms",
                }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}