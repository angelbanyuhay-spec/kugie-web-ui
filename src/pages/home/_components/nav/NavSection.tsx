import React from 'react';
import { ShoppingCart } from 'lucide-react';

export default function NavSection() {
  return (
    <nav
      className="sticky top-0 z-50 bg-white/80 px-4 py-4 backdrop-blur-md sm:px-8 sm:py-6"
      aria-label="Main"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between">
          <a href="/" className="shrink-0" aria-label="Kugiebites home">
            <img
              src="/images/kugiebites-logo.png"
              alt="Kugiebites"
              className="h-10 w-auto sm:h-12"
              draggable={false}
            />
          </a>
          <a
            href="/order"
            className="inline-flex items-center gap-2 rounded-full bg-[#f49d03] px-3 py-2 text-xs font-black uppercase tracking-wide text-white shadow-md transition hover:scale-105 hover:shadow-lg sm:hidden"
            aria-label="Order Now — go to order form"
          >
            <span className="whitespace-nowrap">Order Now</span>
            <ShoppingCart className="size-[18px] shrink-0" aria-hidden />
          </a>
        </div>

        <div className="flex items-center justify-between gap-4 sm:gap-8">
          <div className="flex items-center gap-4 font-bold text-[11px] uppercase tracking-widest sm:gap-8 sm:text-sm">
            <a href="/" className="hover:text-[#c8994f] transition">
              Home
            </a>
            <a href="#menu" className="hover:text-[#c8994f] transition">
              Menu
            </a>
            <a href="#contact" className="hover:text-[#c8994f] transition">
              Contact
            </a>
          </div>
          <a
            href="/order"
            className="hidden sm:inline-flex shrink-0 items-center gap-2 rounded-full bg-[#f49d03] px-5 py-2.5 text-sm font-black uppercase tracking-wide text-white shadow-md transition hover:scale-105 hover:shadow-lg"
            aria-label="Order Now — go to order form"
          >
            <span className="whitespace-nowrap">Order Now</span>
            <ShoppingCart className="size-5 shrink-0" aria-hidden />
          </a>
        </div>
      </div>
    </nav>
  );
}
