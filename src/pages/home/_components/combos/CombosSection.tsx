import React from 'react';
import { Star } from 'lucide-react';
import { useMenuPricing } from '../MenuPricingContext';

export default function CombosSection() {
  const { combos } = useMenuPricing();

  return (
    <section id="combos" className="w-full scroll-mt-24 bg-white py-24" aria-labelledby="landing-combos-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="grid items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="flex flex-col justify-center rounded-[3rem] bg-white p-8 shadow-xl ring-1 ring-stone-200/90 sm:p-12 lg:col-span-7">
            <div className="mb-10 text-left">
              <span className="mb-4 inline-block rounded-full bg-[#f49d03] px-4 py-1 text-sm font-bold uppercase tracking-widest text-white">
                Limited Time Offers
              </span>
              <h2 id="landing-combos-heading" className="text-4xl font-black italic tracking-tight text-neutral-950 md:text-5xl">
                SULIT COMBOS
              </h2>
              <p className="mt-2 max-w-md text-base leading-relaxed text-neutral-600">
                The perfect mix of your favorite bites, priced to keep your wallet happy.
              </p>
            </div>

            <div className="grid gap-4">
              {combos.map((combo, idx) => (
                <article
                  key={combo.slug}
                  className="group relative flex cursor-pointer flex-col gap-4 overflow-hidden rounded-2xl border-2 border-stone-200 bg-stone-50/60 p-6 transition-all duration-300 hover:border-[#c8994f]/45 hover:bg-[#fdfaf4] hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="pointer-events-none absolute -bottom-4 -right-4 select-none text-8xl font-black text-neutral-900 opacity-[0.06] transition-all group-hover:opacity-[0.1]">
                    {idx + 1}
                  </span>

                  <div className="relative z-10 min-w-0">
                    <h3 className="mb-1 flex flex-wrap items-center gap-2 text-xl font-black text-neutral-950 sm:text-2xl">
                      {combo.name}
                      {idx === 0 && (
                        <Star
                          size={18}
                          className="shrink-0 fill-[#f49d03] text-[#f49d03]"
                          aria-hidden
                        />
                      )}
                    </h3>
                    <p className="text-sm font-medium text-neutral-700 sm:text-base">{combo.items}</p>
                  </div>

                  <div className="relative z-10 shrink-0 sm:text-right">
                    <p className="origin-left text-3xl font-black tracking-tighter text-[#9a3412] transition-transform group-hover:scale-105 sm:origin-right">
                      {combo.price}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="group relative min-h-[420px] pr-2 sm:min-h-[500px] sm:pr-0 lg:col-span-5 lg:min-h-full">
            <div className="absolute inset-0 overflow-hidden rounded-[3rem] shadow-2xl ring-1 ring-black/5">
              <img
                src="/images/all-combos.jpg"
                alt="Kugiebites combos"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </div>

            <div className="absolute right-4 top-4 flex h-28 w-28 animate-bounce-slow flex-col items-center justify-center rounded-full border-4 border-[#ebcc8f] bg-[#f49d03] font-black text-white shadow-xl sm:-right-2 sm:-top-3 sm:h-32 sm:w-32 lg:-right-4 lg:-top-5">
              <span className="px-1 text-center text-[10px] uppercase tracking-wide sm:text-xs">Save up to</span>
              <span className="text-2xl leading-none sm:text-3xl">20%</span>
            </div>

            <div className="absolute bottom-8 left-8 right-8 text-white sm:bottom-10 sm:left-10 sm:right-10">
              <p className="mb-2 text-sm font-bold tracking-[0.2em] text-[#f49d03] sm:text-base">HOT &amp; FRESH</p>
              <h3 className="text-2xl font-black leading-tight sm:text-3xl md:text-4xl">Bundle more, save more</h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/90 sm:text-base">
                Pair your go-to snacks in one sulit combo — made to order, ready when you are.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
