import React from 'react';
import { MenuPricingProvider } from './MenuPricingContext';
import NavSection from './nav/NavSection';
import HeroSection from './hero/HeroSection';
import MenuSection from './menu/MenuSection';
import CombosSection from './combos/CombosSection';
import ContactSection from './contact/ContactSection';
import FooterSection from './footer/FooterSection';
import { ShoppingCart } from 'lucide-react';

function OrderCTA() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-8 bg-[#ebcc8f]/20">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-black italic mb-4" style={{ color: '#c8994f' }}>
          HUNGRY?
        </h2>
        <p className="text-gray-600 mb-8 text-lg">
          Build your order, pick your payment, and we'll deliver it fresh to your door.
        </p>
        <a
          href="/order"
          className="inline-flex items-center gap-3 bg-[#f49d03] text-white px-10 py-5 rounded-full font-black text-xl hover:shadow-2xl hover:-translate-y-1 transition-all shadow-lg"
        >
          <ShoppingCart size={24} />
          ORDER NOW
        </a>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <MenuPricingProvider>
      <div className="min-h-screen font-sans text-gray-900" style={{ backgroundColor: '#ebcc8f' }}>
        <NavSection />
        <HeroSection />
        <MenuSection />
        <CombosSection />
        <OrderCTA />
        <ContactSection />
        <FooterSection />
      </div>
    </MenuPricingProvider>
  );
}
