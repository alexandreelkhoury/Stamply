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
  Star,
  ChevronRight,
  Sparkles,
  Gift,
  Users,
  TrendingUp,
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
              i < animated ? `stamp-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both` : "none",
            animationDelay: `${600 + i * 200}ms`,
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
    <div className="relative overflow-hidden">
      {/* ━━━ NAV ━━━ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          navScrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-card-border shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight font-[family-name:var(--font-display)]">
              Stamply
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm font-medium text-foreground/60 hover:text-foreground transition px-3 py-2"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-foreground text-background px-5 py-2.5 rounded-full hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ━━━ HERO ━━━ */}
      <section className="relative hero-gradient pt-32 pb-20 md:pt-40 md:pb-32">
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

              <h1 className="animate-fade-up delay-100 text-[2.25rem] sm:text-[2.75rem] md:text-[3.5rem] lg:text-[4rem] font-extrabold leading-[1.08] tracking-tight font-[family-name:var(--font-display)]">
                Your customers
                <br />
                keep coming
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                    back.
                  </span>
                  <span className="absolute -bottom-1 left-0 right-0 h-3 bg-primary/10 rounded-sm -z-0" />
                </span>
              </h1>

              <p className="animate-fade-up delay-200 mt-6 text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
                Replace paper punch cards with digital loyalty cards that live in
                Apple & Google Wallet. Set up in 3 minutes. No app download
                needed.
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
                  className="inline-flex items-center justify-center gap-2 text-foreground/70 px-6 py-3.5 rounded-full text-base font-medium border border-card-border hover:bg-muted transition-all"
                >
                  See how it works
                </a>
              </div>

              <p className="animate-fade-up delay-400 mt-5 text-sm text-muted-foreground flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-success" />
                  14-day free trial
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-success" />
                  No credit card
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
                  className="absolute -bottom-5 left-0 sm:-left-6 glass-card rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2.5 sm:gap-3 animate-fade-up delay-700 shadow-xl max-w-[calc(100%-8px)]"
                  style={{ animationDelay: "1.8s" }}
                >
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                    <Check className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Stamp added!</div>
                    <div className="text-xs text-muted-foreground">
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
      <section className="border-y border-card-border bg-muted/50">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 200, suffix: "+", label: "Local businesses" },
              { value: 12000, suffix: "+", label: "Loyalty cards issued" },
              { value: 94, suffix: "%", label: "Customer return rate" },
              { value: 3, suffix: " min", label: "Average setup time" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight font-[family-name:var(--font-display)]">
                  <AnimatedNumber target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ HOW IT WORKS ━━━ */}
      <section id="how-it-works" className="py-24 md:py-32">
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
                  "Name your program, set the reward, pick your colors. Live preview shows exactly what customers will see.",
                accent: "from-primary/10 to-primary/5",
              },
              {
                step: "02",
                icon: Smartphone,
                title: "Customers tap to save",
                description:
                  "Enter their phone number. They get an SMS link to add the card to Apple or Google Wallet. Takes 10 seconds.",
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
      <section className="py-24 md:py-32 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader
            badge="Everything you need"
            title="Built for busy shop owners"
            subtitle="No apps to maintain. No hardware to buy. Just your phone and your passion."
          />

          <div className="mt-16 grid md:grid-cols-3 gap-4">
            {/* Large feature card */}
            <div className="md:col-span-2 bg-card border border-card-border rounded-3xl p-8 md:p-10 relative overflow-hidden group hover:border-primary/20 transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-2xl group-hover:from-primary/10 transition-all duration-500" />
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-[family-name:var(--font-display)]">
                  Apple & Google Wallet
                </h3>
                <p className="mt-2 text-muted-foreground max-w-md leading-relaxed">
                  Cards live right in your customers&apos; phone wallets. Location-based
                  notifications remind them when they&apos;re near your shop. No app download,
                  no friction.
                </p>

                {/* Mini wallet pass preview */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <div className="bg-muted rounded-xl p-3 flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs">Blue Cup Cafe</div>
                      <div className="text-muted-foreground text-[11px]">5 of 8 stamps</div>
                    </div>
                  </div>
                  <div className="bg-muted rounded-xl p-3 flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shrink-0">
                      <Gift className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs">Fresh Cuts Salon</div>
                      <div className="text-muted-foreground text-[11px]">Reward ready!</div>
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
              description="Custom colors, logo, reward text. Your card, your identity."
            />
            <FeatureCard
              icon={Shield}
              title="Fraud-proof"
              description="Rate limiting, scan verification, full audit trail. No fake stamps."
            />
            <FeatureCard
              icon={Users}
              title="No app required"
              description="Customers don't download anything. Works with any phone's wallet."
            />
          </div>
        </div>
      </section>

      {/* ━━━ TESTIMONIALS ━━━ */}
      <section className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader
            badge="Loved by local businesses"
            title="Don&apos;t take our word for it"
            subtitle="Here's what shop owners are saying about switching to digital loyalty."
          />

          <div className="mt-16 grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "We used to lose 30% of customers between visits. Since switching to Stamply, our repeat visit rate jumped to 85%. The wallet notification when customers walk by is magic.",
                author: "Sarah K.",
                role: "Owner, Blue Cup Cafe",
                stars: 5,
              },
              {
                quote:
                  "Setup took literally 2 minutes. My baristas love it — no more fumbling with stamps during rush hour. Just scan and go. Our customers think we're so modern now.",
                author: "Marc H.",
                role: "Manager, Daily Grind",
                stars: 5,
              },
              {
                quote:
                  "I was skeptical about yet another tool, but Stamply pays for itself in the first week. I can finally see which customers are regulars and who's dropping off.",
                author: "Nadia T.",
                role: "Owner, Glow Beauty Salon",
                stars: 5,
              },
            ].map((testimonial) => (
              <div
                key={testimonial.author}
                className="bg-card border border-card-border rounded-3xl p-7 flex flex-col hover:border-primary/15 transition-all duration-300 group"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: testimonial.stars }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-warning text-warning"
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground/80 flex-1">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="mt-6 pt-5 border-t border-card-border">
                  <div className="font-semibold text-sm">{testimonial.author}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ PRICING ━━━ */}
      <section id="pricing" className="py-24 md:py-32 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader
            badge="Simple pricing"
            title="One plan. Everything included."
            subtitle="No hidden fees, no per-customer charges, no surprise upgrades."
          />

          <div className="mt-16 max-w-md mx-auto">
            <div className="relative bg-card border border-card-border rounded-3xl p-6 sm:p-10 text-center overflow-hidden">
              {/* Decorative shimmer */}
              <div className="absolute inset-0 animate-shimmer pointer-events-none" />

              <div className="relative">
                <div className="inline-flex items-center gap-1.5 bg-primary/8 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                  <Sparkles className="h-3 w-3" />
                  Most popular
                </div>

                <div className="mt-6 flex items-baseline justify-center gap-1">
                  <span className="text-5xl sm:text-6xl font-extrabold tracking-tight font-[family-name:var(--font-display)]">
                    $10
                  </span>
                  <span className="text-muted-foreground text-lg">/month</span>
                </div>

                <p className="mt-3 text-sm text-muted-foreground">
                  Everything you need to run a loyalty program
                </p>

                <div className="mt-8 space-y-3 text-left max-w-xs mx-auto">
                  {[
                    "Unlimited customers",
                    "Apple & Google Wallet passes",
                    "QR code scanning",
                    "Real-time analytics dashboard",
                    "Custom branding & colors",
                    "SMS card delivery",
                    "Fraud protection",
                    "Priority support",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm">
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
                <p className="mt-4 text-xs text-muted-foreground">
                  No credit card required. Cancel anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ FINAL CTA ━━━ */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-primary/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-[family-name:var(--font-display)] leading-tight">
            Ready to turn one-time{" "}
            <span className="hidden md:inline"><br /></span>
            visitors into regulars?
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Join hundreds of local businesses using Stamply to bring customers back,
            again and again.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-8 py-4 rounded-full text-base font-semibold hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Get started — it&apos;s free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-success" />
              Free 14-day trial
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-success" />
              Setup in 3 minutes
            </span>
          </div>
        </div>
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="border-t border-card-border bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-bold tracking-tight font-[family-name:var(--font-display)]">
                  Stamply
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Digital loyalty cards for local businesses. Replace punch cards
                with wallet passes your customers actually love.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Product</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li>
                  <a href="#how-it-works" className="hover:text-foreground transition">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-foreground transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <Link href="/register" className="hover:text-foreground transition">
                    Get started
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Company</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-card-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
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
      <div className="inline-flex items-center gap-2 bg-muted border border-card-border text-muted-foreground text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
        <ChevronRight className="h-3 w-3" />
        {badge}
      </div>
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight font-[family-name:var(--font-display)]">
        {title}
      </h2>
      <p className="mt-4 text-muted-foreground leading-relaxed">
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
      className={`relative bg-card border border-card-border rounded-3xl p-7 group hover:border-primary/15 transition-all duration-500 ${
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
          <span className="text-4xl font-extrabold text-foreground/5 font-[family-name:var(--font-display)] group-hover:text-primary/10 transition-colors">
            {step}
          </span>
        </div>
        <h3 className="text-lg font-bold font-[family-name:var(--font-display)]">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
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
      className={`bg-card border border-card-border rounded-3xl p-7 group hover:border-primary/15 transition-all duration-500 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-bold font-[family-name:var(--font-display)]">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
