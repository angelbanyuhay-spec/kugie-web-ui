import React from 'react';

const HERO_IMAGES = [
  {
    src: '/images/bulk-orders.jpg',
    alt: 'Bulk orders',
    className: 'w-full h-full rounded-2xl shadow-xl object-cover hover:scale-105 transition duration-500',
  },
  {
    src: '/images/all-combos.jpg',
    alt: 'Kugiebites combos',
    className: 'w-full h-full rounded-2xl shadow-xl object-cover hover:scale-105 transition duration-500',
  },
  {
    src: '/images/combo-2.jpg',
    alt: 'Combo 2',
    className: 'w-full h-full rounded-2xl shadow-xl object-cover hover:scale-105 transition duration-500',
  },
  {
    src: '/images/burger.jpg',
    alt: 'Cheesy burger',
    className: 'w-full h-full rounded-2xl shadow-xl object-cover hover:scale-105 transition duration-500',
  },
] as const;

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-white" aria-labelledby="landing-hero-heading">
      <div className="container mx-auto px-4 sm:px-8 py-12 grid md:grid-cols-2 gap-12 items-center">
        <div className="z-10">
          <span className="uppercase tracking-[0.3em] font-bold text-[#c8994f] mb-4 block">The Ultimate Affordable Snack Destination</span>
          <h2 id="landing-hero-heading" className="text-5xl sm:text-7xl md:text-8xl font-black leading-none mb-8">
            DELIGHT IN{' '}
            <span className="whitespace-nowrap" style={{ color: '#facc15' }}>
              EVERY BITE.
            </span>
          </h2>
          <p className="text-lg text-gray-600 mb-10 max-w-md">
            From juicy burgers to our signature golden hashbrowns, we serve up happiness that fits your budget. Great taste doesn't have to be expensive, grab your favorite snacks at prices you'll love.
          </p>
          <a
            href="/order"
            className="inline-block bg-[#f49d03] text-white px-10 py-5 rounded-full font-black text-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            ORDER NOW
          </a>
        </div>

        <div className="relative grid grid-cols-2 grid-rows-2 gap-4 rotate-3 scale-100 md:scale-110 h-[420px] md:h-[500px] items-stretch">
          {HERO_IMAGES.map((img) => (
            <div key={img.src} className="relative overflow-hidden rounded-2xl">
              <img src={img.src} className={img.className} alt={img.alt} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
