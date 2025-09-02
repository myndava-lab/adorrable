
"use client";
import React, { useState, useEffect } from "react";
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
  Paperclip,
  Github,
} from "lucide-react";
import { supabase } from '../lib/supabase';
import AuthModal from '../components/AuthModal';

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

const EXAMPLE_PROMPTS = [
  "Design a Lagos restaurant homepage with WhatsApp CTA & Paystack checkout…",
  "Build a Nairobi tech startup landing page with M-Pesa integration…",
  "Create a Mumbai fashion store with UPI payments & Hindi support…",
  "Design a London consulting firm website with Stripe & GDPR compliance…",
  "Build a Cape Town tourism site with local payment options…",
  "Create a Berlin e-commerce store with EU payment regulations…"
];

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
      <button 
        onClick={() => !user ? setIsAuthModalOpen(true) : alert('Payment integration coming soon!')}
        className="mt-6 w-full rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-black transition hover:bg-white"
      >
        {cta}
      </button>
    </motion.div>
  );
}

export default function AdorrableLanding() {
  const [lang, setLang] = useState<(typeof LANGS)[number]>("English");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [promptIndex, setPromptIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Authentication effect
  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Typewriter effect
  useEffect(() => {
    const promptText = EXAMPLE_PROMPTS[promptIndex];
    const typingSpeed = isDeleting ? 50 : 100;
    const delayBetweenPrompts = 2000;

    const timer = setTimeout(() => {
      if (!isDeleting && charIndex < promptText.length) {
        setCurrentPrompt(promptText.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      } else if (isDeleting && charIndex > 0) {
        setCurrentPrompt(promptText.slice(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      } else if (!isDeleting && charIndex === promptText.length) {
        setTimeout(() => setIsDeleting(true), delayBetweenPrompts);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setPromptIndex((promptIndex + 1) % EXAMPLE_PROMPTS.length);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, promptIndex]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const response = await fetch('/api/credits', {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleGenerateWebsite = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!prompt.trim()) {
      alert('Please enter a description of your website');
      return;
    }

    if (userProfile?.credits < 1) {
      alert('You need at least 1 credit to generate a website. Please purchase more credits.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          prompt,
          language: lang
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Handle successful generation
        alert('Website generated successfully!');
        // Refresh user profile to update credits
        await fetchUserProfile(user.id);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to generate website');
      }
    } catch (error) {
      console.error('Error generating website:', error);
      alert('Failed to generate website');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0F19]/70 backdrop-blur-xl">
        <div className={`${sectionClass} flex h-16 items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-sky-400 to-violet-500" />
            <span className="text-lg font-bold tracking-tight">
              <span className="text-white">Ado</span>
              <span className="text-white/80">rrable</span>
            </span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a className="text-sm text-white/80 hover:text-white transition-colors" href="#features">
              Features
            </a>
            <a className="text-sm text-white/80 hover:text-white transition-colors" href="#templates">
              Templates
            </a>
            <a className="text-sm text-white/80 hover:text-white transition-colors" href="#pricing">
              Pricing
            </a>
            <a className="text-sm text-white/80 hover:text-white transition-colors" href="#docs">
              Docs
            </a>
          </nav>
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/70">
                  {userProfile?.credits || 0} credits
                </span>
                <span className="text-sm text-white/90">
                  {user.email}
                </span>
                <button 
                  onClick={handleSignOut}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10 transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-400 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-shadow"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className={`${sectionClass} relative pt-20 pb-24`}>
          {/* Background effects */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 1.2 }}
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <div className="absolute left-1/2 top-10 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="absolute right-10 top-24 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
              <Sparkles className="h-4 w-4 text-emerald-300" />
              AI website builder • Culture‑intelligent
            </div>
            
            <h1 className={`text-5xl font-extrabold tracking-tight sm:text-7xl mb-6 ${gradientText}`}>
              Build something with Adorrable
            </h1>
            
            <p className="mx-auto max-w-2xl text-xl text-white/70 mb-12 leading-relaxed">
              Create stunning, culturally‑intelligent websites by simply chatting with AI. Local tone, local payments, global quality.
            </p>

            {/* Prompt Input Box */}
            <div className={`${cardClass} mx-auto max-w-5xl p-8 mb-8`}>
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4 rounded-2xl bg-black/40 px-6 py-6 min-h-[120px]">
                  <MessageSquare className="h-6 w-6 text-white/60 flex-shrink-0 mt-1" />
                  <textarea
                    className="w-full bg-transparent text-lg text-white placeholder:text-white/50 focus:outline-none resize-none leading-relaxed"
                    placeholder={user ? "Describe your website..." : (currentPrompt + (charIndex === EXAMPLE_PROMPTS[promptIndex]?.length ? "" : "|"))}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                  />
                  <div className="flex flex-col gap-3 flex-shrink-0 mt-1">
                    <button 
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*,.pdf,.doc,.docx,.txt';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            alert(`File selected: ${file.name}. File upload functionality coming soon!`);
                          }
                        };
                        input.click();
                      }}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white"
                      title="Attach file or image"
                    >
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => {
                        const repoUrl = prompt('Enter GitHub repository URL:');
                        if (repoUrl) {
                          if (repoUrl.includes('github.com')) {
                            alert(`GitHub import from ${repoUrl} - Integration coming soon!`);
                          } else {
                            alert('Please enter a valid GitHub repository URL');
                          }
                        }
                      }}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white"
                      title="Import from GitHub"
                    >
                      <Github className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
                  <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
                    {LANGS.map((l) => (
                      <button
                        key={l}
                        onClick={() => setLang(l)}
                        className={`rounded-full px-4 py-2 text-sm transition-all ${
                          lang === l
                            ? "bg-white text-black"
                            : "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                    <button 
                      onClick={handleGenerateWebsite}
                      disabled={isGenerating || !prompt.trim()}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/90 px-8 py-4 text-lg font-semibold text-black transition hover:bg-white whitespace-nowrap shadow-lg ml-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? 'Generating...' : 'Generate Website'} 
                      {!isGenerating && <ArrowRight className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* PARTNER LOGOS */}
        <section className={`${sectionClass} pb-16`}>
          <div className="grid grid-cols-2 gap-8 opacity-60 sm:grid-cols-3 md:grid-cols-6">
            {["Nova", "Orbit", "Nimbus", "Vertex", "Prism", "Atlas"].map((l) => (
              <Logo key={l} label={l} />
            ))}
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className={`${sectionClass} py-20`}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <h2 className={`text-4xl font-bold mb-4 ${gradientText}`}>
                Built for global conversion
              </h2>
              <p className="text-xl text-white/70">
                Culture‑aware templates, right payment rails, performance best‑practices. No guesswork.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
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
        <section id="templates" className={`${sectionClass} py-20`}>
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className={`text-4xl font-bold mb-4 ${gradientText}`}>
              From the community
            </h2>
            <p className="text-xl text-white/70">
              Real templates created with Adorrable. Remix in one click.
            </p>
          </div>
          
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
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

        {/* PRICING SECTION */}
        <section id="pricing" className={`${sectionClass} py-20`}>
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className={`text-4xl font-bold mb-4 ${gradientText}`}>
              Simple, flexible pricing
            </h2>
            <p className="text-xl text-white/70">
              Start free. Upgrade when you need unlimited culture packs.
            </p>
          </div>
          
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="grid gap-8 md:grid-cols-3"
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

        {/* CTA SECTION */}
        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-600/20 via-fuchsia-500/20 to-emerald-400/20" />
          <div className={`${sectionClass} ${cardClass} flex flex-col items-center gap-6 py-12 text-center`}>
            <h3 className="text-3xl font-bold">Ready to build globally‑loved sites?</h3>
            <p className="max-w-2xl text-lg text-white/80">
              Join creators shipping culture‑aware websites that convert better in every market.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => !user ? setIsAuthModalOpen(true) : handleGenerateWebsite()}
                className="rounded-xl bg-white px-6 py-3 font-semibold text-black hover:bg-white/90 transition-colors"
              >
                {user ? 'Generate Website' : 'Start Free'}
              </button>
              <button 
                onClick={() => alert('Templates gallery coming soon!')}
                className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-white/90 hover:bg-white/15 transition-colors"
              >
                View Templates
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-12">
        <div className={`${sectionClass} grid gap-8 md:grid-cols-4`}>
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-gradient-to-br from-sky-400 to-violet-500" />
              <span className="font-semibold">Adorrable.dev</span>
            </div>
            <p className="text-sm text-white/60">
              Culturally‑intelligent AI website builder.
            </p>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white/90">Product</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#templates" className="hover:text-white transition-colors">Templates</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#docs" className="hover:text-white transition-colors">Docs</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white/90">Payments</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Stripe
              </li>
              <li className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Paystack
              </li>
              <li className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Flutterwave
              </li>
              <li className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> CoinGate
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white/90">Compliance</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> GDPR / NDPR ready
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> Data residency aware
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Adorrable.dev — Myndava AI Systems LLC. All rights reserved.
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
