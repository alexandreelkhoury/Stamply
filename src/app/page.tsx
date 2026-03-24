import Link from "next/link";
import { CreditCard, QrCode, Smartphone, ArrowRight, Check } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <CreditCard className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold">Stamply</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-foreground/70 hover:text-foreground transition">
            Log in
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition"
          >
            Start free trial
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            Ditch the punch cards.
            <br />
            <span className="text-primary">Go digital in 3 minutes.</span>
          </h1>
          <p className="mt-6 text-lg text-foreground/60 max-w-xl leading-relaxed">
            Stamply lets cafes, restaurants, and salons create digital loyalty cards
            that customers add to Apple & Google Wallet. No app download required.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-primary-dark transition"
            >
              Start free trial <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-foreground/40">14-day free trial. No credit card required.</p>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold mb-12">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">1. Set up your program</h3>
            <p className="text-foreground/60">
              Define your reward (e.g., &quot;Buy 8, get 1 free&quot;), upload your logo, and pick your colors. Takes 3 minutes.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <QrCode className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">2. Customers get a wallet card</h3>
            <p className="text-foreground/60">
              Enter their phone number at checkout. They receive an SMS with a link to add their loyalty card to Apple or Google Wallet.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">3. Scan & stamp</h3>
            <p className="text-foreground/60">
              Customer shows their QR code, you scan it with your phone. Stamp added instantly. When they hit the goal — reward unlocked.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold mb-8">Simple pricing</h2>
        <div className="max-w-sm border border-foreground/10 rounded-2xl p-8">
          <div className="text-sm font-medium text-primary">Everything included</div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-bold">$10</span>
            <span className="text-foreground/50">/month</span>
          </div>
          <ul className="mt-6 space-y-3">
            {[
              "Unlimited customers",
              "Apple & Google Wallet",
              "QR code scanning",
              "Real-time analytics",
              "Custom branding",
              "SMS delivery",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-success" />
                {feature}
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className="mt-8 block w-full text-center bg-primary text-white px-4 py-3 rounded-lg font-medium hover:bg-primary-dark transition"
          >
            Start 14-day free trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-8 border-t border-foreground/10">
        <div className="flex items-center justify-between text-sm text-foreground/40">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Stamply</span>
          </div>
          <span>Built for small businesses.</span>
        </div>
      </footer>
    </div>
  );
}
