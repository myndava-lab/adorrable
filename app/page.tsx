"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Star,
  Sparkles,
  Globe,
  Languages,
  Shield,
  Zap,
  CreditCard,
  MessageSquare,
} from "lucide-react";

/**
 * Drop this file into /app/(marketing)/page.tsx or any route.
 * Tailwind required. Framer Motion + lucide-react icons recommended.
 * Design goals: glassy navbar, bold gradient hero, animated accents,
 * language toggles, marquee logos, feature grid, community cards,
 * premium pricing with Lifetime Co‑founder, CTA, elegant footer.
 */

const gradientText =
  "bg-gradient-to-r from-[#60A5FA] via-[#A78BFA] to-[#34D399] bg-clip-text text-transparent";

const cardClass =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]";

const sectionClass = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const LANGS = ["English", "French", "Swahili", "Pidgin"] as const;

function Logo({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-white/60">
      <div className="h-6 w-6 rounded-md bg-white/10" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <motion.div variants={fadeUp} className={`${cardClass} p-6`}> 
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
        <Icon className="h-5 w-5 text-white/80" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-white/70 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function CommunityCard({
  title,
  author,
  rating,
  image,
}: {
  title: string;
  author: string;
  rating: number;
  image: string;
}) {
  return (
    <motion.div variants={fadeUp} className={`${cardClass} overflow-hidden`}> 
      <div className="relative">
        <img src={image} alt={title} className="h-48 w-full object-cover" />
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1">
          <Star className="h-3.5 w-3.5 text-yellow-300" />
          <span className="text-xs text-white/90">{rating.toFixed(1)}</span>
        </div>
      </div>
      <div className="p-5">
        <h4 className="text-base font-semibold text-white">{title}</h4>
        <p className="mt-1 text-xs text-white/60">by {author}</p>
      </div>
    </motion.div>
  );
}

function PriceCard({
  title,
  price,
  features,
  highlight,
  cta,
}: {
  title: string;
  price: string;
  features: string[];
  highlight?: boolean;
  cta: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className={`${cardClass} relative p-6 ${highlight ? "ring-2 ring-violet-400/60" : ""}`}
    >
      {highlight && (
        <div className="absolute -top-3 right-4 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 px-3 py-1 text-xs font-semibold text-white shadow-lg">
          Lifetime Co‑founder
        </div>
      )}
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-2 flex items-end gap-1">
        <span className="text-3xl font-extrabold text-white">{price}</span>
        {!highlight && <span className="mb-1 text-xs text-white/60">/mo</span>}
      </div>
      <ul className="mt-4 space-y-2 text-sm text-white/70">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {f}
          </li>
        ))}
      </ul>
      <button className="mt-6 w-full rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-black transition hover:bg-white">
        {cta}
      </button>
    </motion.div>
  );
}

export default function AdorrableLanding() {
  const [lang, setLang] = useState<(typeof LANGS)[number]>("English");

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      {/* NAVBAR */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0F19]/70 backdrop-blur-xl">
        <div className={`${sectionClass} flex h-16 items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-sky-400 to-violet-500" />
            <span className="text-lg font-bold tracking-tight">
              <span className="text-white">Ado</span>
              <span className="text-white/80">rrable</span>
            </span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a className="text-sm text-white/80 hover:text-white" href="#features">Features</a>
            <a className="text-sm text-white/80 hover:text-white" href="#templates">Templates</a>
            <a className="text-sm text-white/80 hover:text-white" href="#pricing">Pricing</a>
            <a className="text-sm text-white/80 hover:text-white" href="#docs">Docs</a>
          </nav>
          <div className="flex items-center gap-3">
            <button className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10">
              Sign In
            </button>
            <button className="rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-400 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20">
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className={`${sectionClass} relative pt-16 pb-20`}> 
        {/* soft animated glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 1.2 }}
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute left-1/2 top-10 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute right-10 top-24 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" className="mx-auto max-w-3xl text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            AI website builder • Culture‑intelligent
          </p>
          <h1 className={`text-4xl font-extrabold tracking-tight sm:text-6xl ${gradientText}`}>
            Build something with Adorrable
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-white/70">
            Create stunning, culturally‑intelligent websites by simply chatting with AI. Local tone, local payments, global quality.
          </p>
        </motion.div>

        {/* Prompt box */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className={`mt-10 ${cardClass} mx-auto max-w-3xl p-4`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex grow items-center gap-3 rounded-xl bg-black/40 px-4 py-3">
              <MessageSquare className="h-5 w-5 text-white/60" />
              <input
                className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                placeholder="Design a Lagos restaurant homepage with WhatsApp CTA & Paystack checkout…"
              />
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/90 px-4 py-3 text-sm font-semibold text-black transition hover:bg-white">
              Generate <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {LANGS.map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-full px-3 py-1 text-xs ${
                  lang === l
                    ? "bg-white text-black"
                    : "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                {l}
              </button>
            ))}
            <span className="ml-auto flex items-center gap-2 text-xs text-white/60">
              <Languages className="h-4 w-4" /> {lang}
            </span>
          </div>
        </motion.div>
      </section>

      {/* LOGOS */}
      <section className={`${sectionClass} pb-10`}>
        <div className="grid grid-cols-2 gap-6 opacity-80 sm:grid-cols-3 md:grid-cols-6">
          {["Nova", "Orbit", "Nimbus", "Vertex", "Prism", "Atlas"].map((l) => (
            <Logo key={l} label={l} />
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className={`${sectionClass} py-16`}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className={`text-3xl font-bold ${gradientText}`}>Built for global conversion</h2>
            <p className="mt-3 text-white/70">
              Culture‑aware templates, right payment rails, performance best‑practices. No guesswork.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Feature
              icon={Globe}
              title="Cultural Templates"
              desc="Localized color, typography, and copy for each region. Nigeria, Kenya, India, US, EU & more."
            />
            <Feature
              icon={Sparkles}
              title="Chat‑to‑Build"
              desc="Describe your business; get a full site with sections, imagery, SEO and legal pages."
            />
            <Feature
              icon={CreditCard}
              title="Right Payments"
              desc="Paystack, M‑Pesa, UPI, Stripe. Auto‑matched per region. Switch anytime."
            />
            <Feature
              icon={Zap}
              title="Blazing Performance"
              desc="Next.js 14 + edge caching. Lighthouse‑friendly with smooth motion."
            />
          </div>
        </motion.div>
      </section>

      {/* COMMUNITY TEMPLATES */}
      <section id="templates" className={`${sectionClass} py-16`}>
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <h2 className={`text-3xl font-bold ${gradientText}`}>From the community</h2>
          <p className="mt-3 text-white/70">Real templates created with Adorrable. Remix in one click.</p>
        </div>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          <CommunityCard
            title="Modern Portfolio Website"
            author="Sarah Chen"
            rating={4.9}
            image="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop"
          />
          <CommunityCard
            title="E‑commerce Product Page"
            author="Mike Rodriguez"
            rating={4.7}
            image="https://images.unsplash.com/photo-1516387938699-a93567ec168e?q=80&w=1200&auto=format&fit=crop"
          />
          <CommunityCard
            title="Restaurant Landing Page"
            author="Emma Thompson"
            rating={4.8}
            image="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1200&auto=format&fit=crop"
          />
        </motion.div>
      </section>

      {/* PRICING */}
      <section id="pricing" className={`${sectionClass} py-16`}>
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className={`text-3xl font-bold ${gradientText}`}>Simple, flexible pricing</h2>
          <p className="mt-3 text-white/70">Start free. Upgrade when you need unlimited culture packs.</p>
        </div>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="grid gap-6 md:grid-cols-3"
        >
          <PriceCard
            title="Starter"
            price="$9"
            features={[
              "4 cultural templates / month",
              "Basic AI generations",
              "Email support",
            ]}
            cta="Choose Starter"
          />
          <PriceCard
            title="Growth"
            price="$29"
            features={["Unlimited templates", "Advanced AI", "Priority support"]}
            cta="Choose Growth"
          />
          <PriceCard
            title="Lifetime"
            price="$399"
            features={["All future culture packs", "Unlimited AI", "VIP community access"]}
            highlight
            cta="Become Co‑founder"
          />
        </motion.div>
      </section>

      {/* CTA STRIP */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-600/20 via-fuchsia-500/20 to-emerald-400/20" />
        <div className={`${sectionClass} ${cardClass} flex flex-col items-center gap-4 py-10 text-center`}> 
          <h3 className="text-2xl font-bold">Ready to build globally‑loved sites?</h3>
          <p className="max-w-2xl text-white/80">
            Join creators shipping culture‑aware websites that convert better in every market.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black">Start Free</button>
            <button className="rounded-xl border border-white/20 bg-white/10 px-5 py-2 text-sm text-white/90 hover:bg-white/15">View Templates</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-10">
        <div className={`${sectionClass} grid gap-8 md:grid-cols-4`}>
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-gradient-to-br from-sky-400 to-violet-500" />
              <span className="font-semibold">Adorrable.dev</span>
            </div>
            <p className="text-sm text-white/60">Culturally‑intelligent AI website builder.</p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white/90">Product</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#features">Features</a></li>
              <li><a href="#templates">Templates</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#docs">Docs</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white/90">Payments</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> Stripe</li>
              <li className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> Paystack</li>
              <li className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> Flutterwave</li>
              <li className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> CoinGate</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white/90">Compliance</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2"><Shield className="h-4 w-4" /> GDPR / NDPR ready</li>
              <li className="flex items-center gap-2"><Shield className="h-4 w-4" /> Data residency aware</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Adorrable.dev — Myndava AI Systems LLC. All rights reserved.
        </div>
      </footer>
    </div>
  );
}