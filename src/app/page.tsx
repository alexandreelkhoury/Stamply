"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import {
  ArrowRight,
  Check,
  QrCode,
  Smartphone,
  Zap,
  BarChart3,
  Palette,
  Shield,
  ChevronRight,
  Sparkles,
  Gift,
  Users,
  Share2,
  Heart,
} from "lucide-react";

/* ─── Animated stamp dots for the hero card ─── */
function StampGrid({ filled, total }: { filled: number; total: number }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    for (let i = 0; i <= filled; i++) {
      timers.push(setTimeout(() => setAnimated(i), 600 + i * 200));
    }
    return () => timers.forEach(clearTimeout);
  }, [filled]);

  return (
    <div className="flex gap-2 flex-wrap">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
            i < animated
              ? "bg-white/30 text-white scale-100"
              : "border-2 border-white/25 text-white/30 scale-90"
          }`}
          style={{
            animation:
              i < animated ? `stamp-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${600 + i * 200}ms both` : "none",
          }}
        >
          {i < animated ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 7L5.5 10.5L12 3.5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            i + 1
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Intersection observer hook ─── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─── Stats counter animation ─── */
function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView();
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── MAIN PAGE ─── */
export default function Home() {
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative overflow-hidden landing-light">
      {/* ━━━ NAV ━━━ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          navScrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight font-[family-name:var(--font-display)] text-gray-900">
              Stamply
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm font-medium text-gray-500 hover:text-gray-900 transition px-3 py-2"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-gray-900 text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ━━━ HERO ━━━ */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 bg-gradient-to-b from-gray-50 via-white to-white">
        {/* Decorative blobs */}
        <div className="absolute top-20 right-[10%] w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-[5%] w-96 h-96 bg-primary/3 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — copy */}
            <div>
              <div className="animate-fade-up">
                <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/15 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                  <Zap className="h-3.5 w-3.5" />
                  Launching in Beirut
                </div>
              </div>

              <h1 className="animate-fade-up delay-100 text-[2.25rem] sm:text-[2.75rem] md:text-[3.5rem] lg:text-[4rem] font-extrabold leading-[1.08] tracking-tight font-[family-name:var(--font-display)] text-gray-900">
                Ready to turn
                <br />
                one-time visitors
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                    into regulars?
                  </span>
                  <span className="absolute -bottom-1 left-0 right-0 h-3 bg-primary/10 rounded-sm -z-0" />
                </span>
              </h1>

              <p className="animate-fade-up delay-200 mt-6 text-lg md:text-xl text-gray-500 max-w-lg leading-relaxed">
                Replace paper punch cards with digital loyalty cards that live in
                Apple & Google Wallet. Set up your program in 3 minutes — customers
                join in 10 seconds.
              </p>

              <div className="animate-fade-up delay-300 mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-white px-7 py-3.5 rounded-full text-base font-semibold hover:bg-primary-dark transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20 animate-pulse-glow"
                >
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 text-gray-600 px-6 py-3.5 rounded-full text-base font-medium border border-gray-200 hover:bg-gray-50 transition-all"
                >
                  See how it works
                </a>
              </div>

              <p className="animate-fade-up delay-400 mt-5 text-sm text-gray-400 flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-success" />
                  14-day free trial
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-success" />
                  Card or Wish payments
                </span>
                <span className="hidden sm:flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-success" />
                  Cancel anytime
                </span>
              </p>
            </div>

            {/* Right — floating loyalty card */}
            <div className="relative flex justify-center animate-scale-in delay-300">
              {/* Background card (tilted) */}
              <div
                className="absolute top-8 -right-4 w-[260px] sm:w-[300px] h-[170px] sm:h-[190px] rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 opacity-40 blur-sm animate-float-delayed"
                style={{ transform: "rotate(6deg)" }}
              />

              {/* Main card */}
              <div className="relative w-[calc(100%-16px)] max-w-[340px] animate-float">
                <div className="rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-dark p-7 text-white loyalty-card-shadow transition-all duration-500">
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center">
                          <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-bold text-sm tracking-wide">
                          Blue Cup Cafe
                        </span>
                      </div>
                      <p className="text-white/50 text-xs ml-8">Coffee Loyalty</p>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-widest text-white/40">
                        Reward
                      </div>
                      <div className="text-xs font-semibold text-white/80">
                        Free Coffee
                      </div>
                    </div>
                  </div>

                  {/* Stamps */}
                  <div className="mt-5">
                    <StampGrid filled={5} total={8} />
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-white/50">5 of 8 stamps</span>
                    <div className="flex items-center gap-1.5 text-xs text-white/40">
                      <QrCode className="h-3 w-3" />
                      stmp.ly/a8f3k2
                    </div>
                  </div>
                </div>

                {/* Stamp notification toast */}
                <div
                  className="absolute -bottom-5 left-0 sm:-left-6 bg-white rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2.5 sm:gap-3 shadow-xl border border-gray-100 max-w-[calc(100%-8px)]"
                  style={{ animation: "fade-up 0.7s ease-out 1.8s both" }}
                >
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                    <Check className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Stamp added!</div>
                    <div className="text-xs text-gray-400">
                      3 more until your free coffee
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ SOCIAL PROOF BAR ━━━ */}
      <section className="border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 200, suffix: "+", label: "Local businesses" },
              { value: 12000, suffix: "+", label: "Loyalty cards issued" },
              { value: 94, suffix: "%", label: "Customer return rate" },
              { value: 10, suffix: " sec", label: "Customer joins" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight font-[family-name:var(--font-display)] text-gray-900">
                  <AnimatedNumber target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-1 text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ SHARE-WORTHY CARDS ━━━ */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader
            badge="Designed to impress"
            title="Cards so beautiful, customers show them off"
            subtitle="Stamply cards live in Apple & Google Wallet — sleek, branded, and satisfying. Customers love them so much, they share with friends."
          />

          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <div className="bg-gray-50 border border-gray-100 rounded-3xl p-7 text-center group hover:border-primary/15 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold font-[family-name:var(--font-display)] text-gray-900">Satisfying to collect</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                Premium card designs with smooth animations. Every stamp feels rewarding — customers actually look forward to their next visit.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-3xl p-7 text-center group hover:border-primary/15 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-5">
                <Share2 className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-bold font-[family-name:var(--font-display)] text-gray-900">Built to be shared</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                Beautiful cards get shown to friends. Your customers become your best marketers — word of mouth that actually works.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-3xl p-7 text-center group hover:border-primary/15 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center mx-auto mb-5">
                <Smartphone className="h-6 w-6 text-warning" />
              </div>
              <h3 className="font-bold font-[family-name:var(--font-display)] text-gray-900">Always in their wallet</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                No more lost paper cards. Your loyalty program lives on their phone, right next to their credit cards. Always visible, never forgotten.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ HOW IT WORKS ━━━ */}
      <section id="how-it-works" className="py-24 md:py-32 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader
            badge="Simple as 1-2-3"
            title="Up and running in minutes"
            subtitle="No technical knowledge required. If you can use a smartphone, you can use Stamply."
          />

          <div className="mt-16 grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: Palette,
                title: "Design your card",
                description:
                  "Name your program, set the reward, pick your colors and stamp designs. Live preview shows exactly what customers will see.",
                accent: "from-primary/10 to-primary/5",
              },
              {
                step: "02",
                icon: Smartphone,
                title: "Customers join instantly",
                description:
                  "They scan your QR code or tap a link. Enter their phone number, and the card is added to Apple or Google Wallet in 10 seconds.",
                accent: "from-success/10 to-success/5",
              },
              {
                step: "03",
                icon: QrCode,
                title: "Scan, stamp, done",
                description:
                  "Customer shows QR from their wallet. You scan it. Stamp added instantly with a satisfying confirmation.",
                accent: "from-warning/10 to-warning/5",
              },
            ].map((item, i) => (
              <StepCard key={item.step} {...item} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ FEATURES BENTO GRID ━━━ */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader
            badge="Everything you need"
            title="Built for busy shop owners"
            subtitle="No apps to maintain. No hardware to buy. Just your phone and your passion."
          />

          <div className="mt-16 grid md:grid-cols-3 gap-4">
            {/* Large feature card */}
            <div className="md:col-span-2 bg-gray-50 border border-gray-100 rounded-3xl p-8 md:p-10 relative overflow-hidden group hover:border-primary/20 transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-2xl group-hover:from-primary/10 transition-all duration-500" />
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-[family-name:var(--font-display)] text-gray-900">
                  Apple & Google Wallet
                </h3>
                <p className="mt-2 text-gray-500 max-w-md leading-relaxed">
                  Cards live right in your customers&apos; phone wallets. Location-based
                  notifications remind them when they&apos;re near your shop. No extra
                  app needed.
                </p>

                {/* Mini wallet pass preview */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <div className="bg-white rounded-xl p-3 flex items-center gap-3 text-sm border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-gray-900">Blue Cup Cafe</div>
                      <div className="text-gray-400 text-[11px]">5 of 8 stamps</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-3 flex items-center gap-3 text-sm border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shrink-0">
                      <Gift className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-gray-900">Fresh Cuts Salon</div>
                      <div className="text-gray-400 text-[11px]">Reward ready!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column stack */}
            <div className="flex flex-col gap-4">
              <FeatureCard
                icon={Zap}
                title="3-second checkout"
                description="Scan QR, instant confirmation. Faster than stamping a paper card."
              />
              <FeatureCard
                icon={BarChart3}
                title="Real-time analytics"
                description="Track visits, popular days, reward redemptions. Know your regulars."
              />
            </div>

            {/* Bottom row */}
            <FeatureCard
              icon={Palette}
              title="Your brand, your card"
              description="Custom colors, logo, stamp designs. Categories from coffee to beauty to pets. Your card, your identity."
            />
            <FeatureCard
              icon={Shield}
              title="Fraud-proof"
              description="Rate limiting, scan verification, full audit trail. No fake stamps."
            />
            <FeatureCard
              icon={Users}
              title="Self-service enrollment"
              description="Customers scan a QR code and join your program themselves. No manual entry needed."
            />
          </div>
        </div>
      </section>

      {/* ━━━ PRICING ━━━ */}
      <section id="pricing" className="py-24 md:py-32 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader
            badge="Simple pricing"
            title="One plan. Everything included."
            subtitle="No hidden fees, no per-customer charges, no surprise upgrades."
          />

          <div className="mt-16 max-w-md mx-auto">
            <div className="relative bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 text-center overflow-hidden shadow-sm">
              {/* Decorative shimmer */}
              <div className="absolute inset-0 animate-shimmer pointer-events-none" />

              <div className="relative">
                <div className="inline-flex items-center gap-1.5 bg-primary/8 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                  <Sparkles className="h-3 w-3" />
                  Most popular
                </div>

                <div className="mt-6 flex items-baseline justify-center gap-1">
                  <span className="text-5xl sm:text-6xl font-extrabold tracking-tight font-[family-name:var(--font-display)] text-gray-900">
                    $10
                  </span>
                  <span className="text-gray-400 text-lg">/month</span>
                </div>

                <p className="mt-3 text-sm text-gray-400">
                  Everything you need to run a loyalty program
                </p>

                <div className="mt-8 space-y-3 text-left max-w-xs mx-auto">
                  {[
                    "Unlimited customers",
                    "Apple & Google Wallet passes",
                    "QR code scanning",
                    "Real-time analytics dashboard",
                    "Custom branding & stamp designs",
                    "Self-service customer enrollment",
                    "Fraud protection",
                    "Priority support",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-success" />
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>

                <Link
                  href="/register"
                  className="mt-10 inline-flex items-center justify-center gap-2 w-full bg-primary text-white py-4 rounded-2xl text-base font-semibold hover:bg-primary-dark transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary/20"
                >
                  Start 14-day free trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="mt-4 text-xs text-gray-400">
                  Pay with card or Wish. Cancel anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ FINAL CTA ━━━ */}
      <section className="py-24 md:py-32 relative overflow-hidden bg-white">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-primary/8 to-primary/3" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-[family-name:var(--font-display)] leading-tight text-gray-900">
            Your customers keep{" "}
            <span className="hidden md:inline"><br /></span>
            coming{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                back.
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-primary/10 rounded-sm -z-0" />
            </span>
          </h2>
          <p className="mt-6 text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
            Join hundreds of local businesses using Stamply to bring customers back,
            again and again.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Get started — it&apos;s free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-success" />
              Free 14-day trial
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-success" />
              Set up in 3 minutes
            </span>
          </div>
        </div>
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-bold tracking-tight font-[family-name:var(--font-display)] text-gray-900">
                  Stamply
                </span>
              </div>
              <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                Digital loyalty cards for local businesses. Replace punch cards
                with wallet passes your customers actually love.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-gray-900">Product</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li>
                  <a href="#how-it-works" className="hover:text-gray-900 transition">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-gray-900 transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <Link href="/register" className="hover:text-gray-900 transition">
                    Get started
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-gray-900">Company</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-gray-900 transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <span>&copy; {new Date().getFullYear()} Stamply. All rights reserved.</span>
            <span>Built for small businesses with big ambitions.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── SUB-COMPONENTS ─── */

function SectionHeader({
  badge,
  title,
  subtitle,
}: {
  badge: string;
  title: string;
  subtitle: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={`text-center max-w-2xl mx-auto transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      <div className="inline-flex items-center gap-2 bg-gray-100 border border-gray-200 text-gray-500 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
        <ChevronRight className="h-3 w-3" />
        {badge}
      </div>
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight font-[family-name:var(--font-display)] text-gray-900">
        {title}
      </h2>
      <p className="mt-4 text-gray-500 leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
}

function StepCard({
  step,
  icon: Icon,
  title,
  description,
  accent,
  index,
}: {
  step: string;
  icon: typeof QrCode;
  title: string;
  description: string;
  accent: string;
  index: number;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={`relative bg-white border border-gray-100 rounded-3xl p-7 group hover:border-primary/15 transition-all duration-500 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <span className="text-4xl font-extrabold text-gray-100 font-[family-name:var(--font-display)] group-hover:text-primary/10 transition-colors">
            {step}
          </span>
        </div>
        <h3 className="text-lg font-bold font-[family-name:var(--font-display)] text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof QrCode;
  title: string;
  description: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={`bg-gray-50 border border-gray-100 rounded-3xl p-7 group hover:border-primary/15 transition-all duration-500 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-bold font-[family-name:var(--font-display)] text-gray-900">{title}</h3>
      <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}
