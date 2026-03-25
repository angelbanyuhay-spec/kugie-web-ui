import React from 'react';
import { useMenuPricing } from '../MenuPricingContext';

export default function MenuSection() {
  const { products } = useMenuPricing();

  return (
    <section id="menu" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto scroll-mt-24" aria-labelledby="landing-menu-heading">
      <div className="text-center mb-16">
        <h2 id="landing-menu-heading" className="text-5xl font-black mb-4">
          OUR MENU
        </h2>
        <div className="h-2 w-24 bg-[#f49d03] mx-auto" />
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
        {products.map((item) => {
          const soldOut = item.slug === 'nuggets';
          return (
          <article
            key={item.slug}
            className={`bg-white rounded-3xl overflow-hidden group shadow-lg transition-all ${soldOut ? 'opacity-80' : 'hover:shadow-2xl'}`}
          >
            <div className="relative h-64 overflow-hidden">
              <img
                src={item.img}
                alt={item.name}
                className={`w-full h-full object-cover transition duration-500 ${soldOut ? 'grayscale' : 'group-hover:scale-110'}`}
              />
              {soldOut && (
                <div className="absolute left-4 top-4 rounded-full bg-[#f49d03] px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-lg">
                  Sold out
                </div>
              )}
            </div>
            <div className="p-8 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xl">{item.name}</h3>
                <p className="text-gray-500 text-sm">Best Seller</p>
              </div>
              <span className="text-2xl font-black text-[#c8994f]">{item.price}</span>
            </div>
          </article>
        )})}
      </div>
    </section>
  );
}
