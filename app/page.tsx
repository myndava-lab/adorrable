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

// Translations object
const translations = {
  English: {
    navbar: {
      features: "Features",
      templates: "Templates",
      pricing: "Pricing",
      docs: "Docs",
      signIn: "Sign In",
      getStarted: "Get Started",
      signOut: "Sign Out",
      credits: "credits"
    },
    hero: {
      badge: "AI website builder • Culture‑intelligent",
      title: "Build something with Adorrable",
      subtitle: "Create stunning, culturally‑intelligent websites by simply chatting with AI. Local tone, local payments, global quality.",
      placeholder: "Describe your website...",
      generateButton: "Generate Website",
      generating: "Generating..."
    },
    features: {
      title: "Built for global conversion",
      subtitle: "Culture‑aware templates, right payment rails, performance best‑practices. No guesswork.",
      culturalTemplates: {
        title: "Cultural Templates",
        desc: "Localized color, typography, and copy for each region. Nigeria, Kenya, India, US, EU & more."
      },
      chatToBuild: {
        title: "Chat‑to‑Build",
        desc: "Describe your business; get a full site with sections, imagery, SEO and legal pages."
      },
      rightPayments: {
        title: "Right Payments",
        desc: "Paystack, M‑Pesa, UPI, Stripe. Auto‑matched per region. Switch anytime."
      },
      blazingPerformance: {
        title: "Blazing Performance",
        desc: "Next.js 14 + edge caching. Lighthouse‑friendly with smooth motion."
      }
    },
    community: {
      title: "From the community",
      subtitle: "Real templates created with Adorrable. Remix in one click."
    },
    pricing: {
      title: "Simple, flexible pricing",
      subtitle: "Start free. Upgrade when you need unlimited culture packs.",
      starter: {
        title: "Starter",
        price: "$9",
        features: [
          "4 cultural templates / month",
          "Basic AI generations",
          "Email support"
        ],
        cta: "Choose Starter"
      },
      growth: {
        title: "Growth",
        price: "$29",
        features: ["Unlimited templates", "Advanced AI", "Priority support"],
        cta: "Choose Growth"
      },
      lifetime: {
        title: "Lifetime",
        price: "$399",
        features: ["All future culture packs", "Unlimited AI", "VIP community access"],
        cta: "Become Co‑founder"
      }
    },
    cta: {
      title: "Ready to build globally‑loved sites?",
      subtitle: "Join creators shipping culture‑aware websites that convert better in every market.",
      startFree: "Start Free",
      viewTemplates: "View Templates"
    },
    footer: {
      description: "Culturally‑intelligent AI website builder.",
      product: "Product",
      payments: "Payments",
      compliance: "Compliance",
      gdprReady: "GDPR / NDPR ready",
      dataResidency: "Data residency aware",
      copyright: "All rights reserved."
    },
    errors: {
      promptRequired: "Please enter a description of your website",
      insufficientCredits: "You need at least 1 credit to generate a website. Please purchase more credits."
    },
    success: {
      generated: "Website generated successfully!"
    }
  },
  French: {
    navbar: {
      features: "Fonctionnalités",
      templates: "Modèles",
      pricing: "Tarification",
      docs: "Documentation",
      signIn: "Se connecter",
      getStarted: "Commencer",
      signOut: "Se déconnecter",
      credits: "crédits"
    },
    hero: {
      badge: "Créateur de sites web IA • Intelligence culturelle",
      title: "Construisez quelque chose avec Adorrable",
      subtitle: "Créez des sites web époustouflants et culturellement intelligents en discutant simplement avec l'IA. Ton local, paiements locaux, qualité mondiale.",
      placeholder: "Décrivez votre site web...",
      generateButton: "Générer le site web",
      generating: "Génération en cours..."
    },
    features: {
      title: "Conçu pour la conversion mondiale",
      subtitle: "Modèles sensibles à la culture, bonnes voies de paiement, meilleures pratiques de performance. Pas de devinettes.",
      culturalTemplates: {
        title: "Modèles culturels",
        desc: "Couleur, typographie et contenu localisés pour chaque région. Nigeria, Kenya, Inde, États-Unis, UE et plus."
      },
      chatToBuild: {
        title: "Chat‑pour‑Construire",
        desc: "Décrivez votre entreprise ; obtenez un site complet avec sections, imagerie, SEO et pages légales."
      },
      rightPayments: {
        title: "Bons paiements",
        desc: "Paystack, M‑Pesa, UPI, Stripe. Auto‑adapté par région. Changez à tout moment."
      },
      blazingPerformance: {
        title: "Performance fulgurante",
        desc: "Next.js 14 + mise en cache edge. Compatible Lighthouse avec mouvement fluide."
      }
    },
    community: {
      title: "De la communauté",
      subtitle: "Vrais modèles créés avec Adorrable. Remixez en un clic."
    },
    pricing: {
      title: "Tarification simple et flexible",
      subtitle: "Commencez gratuitement. Mettez à niveau quand vous avez besoin de packs culture illimités.",
      starter: {
        title: "Débutant",
        price: "9$",
        features: [
          "4 modèles culturels / mois",
          "Générations IA de base",
          "Support par email"
        ],
        cta: "Choisir Débutant"
      },
      growth: {
        title: "Croissance",
        price: "29$",
        features: ["Modèles illimités", "IA avancée", "Support prioritaire"],
        cta: "Choisir Croissance"
      },
      lifetime: {
        title: "À vie",
        price: "399$",
        features: ["Tous les futurs packs culture", "IA illimitée", "Accès communauté VIP"],
        cta: "Devenir Co‑fondateur"
      }
    },
    cta: {
      title: "Prêt à créer des sites aimés mondialement ?",
      subtitle: "Rejoignez les créateurs qui livrent des sites web sensibles à la culture qui convertissent mieux sur chaque marché.",
      startFree: "Commencer gratuitement",
      viewTemplates: "Voir les modèles"
    },
    footer: {
      description: "Créateur de sites web IA culturellement intelligent.",
      product: "Produit",
      payments: "Paiements",
      compliance: "Conformité",
      gdprReady: "RGPD / NDPR prêt",
      dataResidency: "Sensible à la résidence des données",
      copyright: "Tous droits réservés."
    },
    errors: {
      promptRequired: "Veuillez entrer une description de votre site web",
      insufficientCredits: "Vous avez besoin d'au moins 1 crédit pour générer un site web. Veuillez en acheter plus."
    },
    success: {
      generated: "Site web généré avec succès !"
    }
  },
  Swahili: {
    navbar: {
      features: "Vipengele",
      templates: "Mifano",
      pricing: "Bei",
      docs: "Hati",
      signIn: "Ingia",
      getStarted: "Anza",
      signOut: "Toka",
      credits: "mikopo"
    },
    hero: {
      badge: "Mjenzi wa tovuti wa AI • Akili ya kitamaduni",
      title: "Jenga kitu na Adorrable",
      subtitle: "Unda tovuti za kupendeza na zenye akili ya kitamaduni kwa kuzungumza tu na AI. Sauti ya ndani, malipo ya ndani, ubora wa kimataifa.",
      placeholder: "Elezea tovuti yako...",
      generateButton: "Tengeneza Tovuti",
      generating: "Inajengi..."
    },
    features: {
      title: "Imejengwa kwa ubadilishaji wa kimataifa",
      subtitle: "Mifano inayofahamu utamaduni, njia sahihi za malipo, mazoea bora ya utendaji. Hakuna mchezo wa kukisia.",
      culturalTemplates: {
        title: "Mifano ya Kitamaduni",
        desc: "Rangi, uchapishaji na nakala zilizoundwa kwa kila eneo. Nigeria, Kenya, India, Marekani, EU na zaidi."
      },
      chatToBuild: {
        title: "Mazungumzo‑kwa‑Kujenga",
        desc: "Elezea biashara yako; pata tovuti kamili na sehemu, picha, SEO na kurasa za kisheria."
      },
      rightPayments: {
        title: "Malipo Sahihi",
        desc: "Paystack, M‑Pesa, UPI, Stripe. Yanaoanishwa kiotomatiki kwa eneo. Badilisha wakati wowote."
      },
      blazingPerformance: {
        title: "Utendaji wa Kuchoma",
        desc: "Next.js 14 + uhifadhi wa ukingo. Rafiki wa Lighthouse na mwendo laini."
      }
    },
    community: {
      title: "Kutoka kwa jamii",
      subtitle: "Mifano ya kweli iliyoundwa na Adorrable. Changanya kwa kubofya mara moja."
    },
    pricing: {
      title: "Bei rahisi na yenye kubadilika",
      subtitle: "Anza bure. Pandisha unapohitaji vifurushi vya utamaduni visivyo na kikomo.",
      starter: {
        title: "Mwanzoni",
        price: "$9",
        features: [
          "Mifano 4 ya kitamaduni / mwezi",
          "Uzalishaji wa msingi wa AI",
          "Msaada wa barua pepe"
        ],
        cta: "Chagua Mwanzoni"
      },
      growth: {
        title: "Ukuaji",
        price: "$29",
        features: ["Mifano isiyopungua", "AI ya hali ya juu", "Msaada wa kipaumbele"],
        cta: "Chagua Ukuaji"
      },
      lifetime: {
        title: "Maisha yote",
        price: "$399",
        features: ["Vifurushi vyote vya baadaye vya utamaduni", "AI isiyopungua", "Ufikiaji wa jamii ya VIP"],
        cta: "Kuwa Mwanzilishi Mwenza"
      }
    },
    cta: {
      title: "Uko tayari kujenga tovuti zinazopendwa kimataifa?",
      subtitle: "Jiunge na wabunifu wanaosafirisha tovuti zinazojua utamaduni ambazo zinabadilisha vizuri katika kila soko.",
      startFree: "Anza Bure",
      viewTemplates: "Ona Mifano"
    },
    footer: {
      description: "Mjenzi wa tovuti wa AI wa kitamaduni.",
      product: "Bidhaa",
      payments: "Malipo",
      compliance: "Utii",
      gdprReady: "GDPR / NDPR tayari",
      dataResidency: "Unafahamu makazi ya data",
      copyright: "Haki zote zimehifadhiwa."
    },
    errors: {
      promptRequired: "Tafadhali ingiza maelezo ya tovuti yako",
      insufficientCredits: "Unahitaji angalau mkopo 1 ili kutengeneza tovuti. Tafadhali nunua zaidi."
    },
    success: {
      generated: "Tovuti imetengenezwa kwa mafanikio!"
    }
  },
  Pidgin: {
    navbar: {
      features: "Wetin dey inside",
      templates: "Templates",
      pricing: "How much e cost",
      docs: "Papers",
      signIn: "Enter",
      getStarted: "Start am",
      signOut: "Comot",
      credits: "credits"
    },
    hero: {
      badge: "AI website builder • Sabi culture well well",
      title: "Build something with Adorrable",
      subtitle: "Create fine fine websites wey sabi culture by just talk to AI. Local style, local payment, world-class quality.",
      placeholder: "Talk about your website...",
      generateButton: "Generate Website",
      generating: "Dey generate am..."
    },
    features: {
      title: "Built for worldwide conversion",
      subtitle: "Templates wey sabi culture, correct payment methods, best performance practices. No guesswork.",
      culturalTemplates: {
        title: "Culture Templates",
        desc: "Color, font, and content wey fit each region. Nigeria, Kenya, India, US, EU and more."
      },
      chatToBuild: {
        title: "Chat‑to‑Build",
        desc: "Talk about your business; get complete site with sections, pictures, SEO and legal pages."
      },
      rightPayments: {
        title: "Correct Payments",
        desc: "Paystack, M‑Pesa, UPI, Stripe. E go automatically match your region. Change anytime."
      },
      blazingPerformance: {
        title: "Fire Performance",
        desc: "Next.js 14 + edge caching. Lighthouse-friendly with smooth movement."
      }
    },
    community: {
      title: "From the community",
      subtitle: "Real templates wey people create with Adorrable. Remix with one click."
    },
    pricing: {
      title: "Simple, flexible pricing",
      subtitle: "Start free. Upgrade when you need unlimited culture packs.",
      starter: {
        title: "Starter",
        price: "$9",
        features: [
          "4 culture templates / month",
          "Basic AI generations",
          "Email support"
        ],
        cta: "Choose Starter"
      },
      growth: {
        title: "Growth",
        price: "$29",
        features: ["Unlimited templates", "Advanced AI", "Priority support"],
        cta: "Choose Growth"
      },
      lifetime: {
        title: "Lifetime",
        price: "$399",
        features: ["All future culture packs", "Unlimited AI", "VIP community access"],
        cta: "Become Co‑founder"
      }
    },
    cta: {
      title: "Ready to build websites wey people go love worldwide?",
      subtitle: "Join creators wey dey ship culture-aware websites wey convert better for every market.",
      startFree: "Start Free",
      viewTemplates: "See Templates"
    },
    footer: {
      description: "AI website builder wey sabi culture.",
      product: "Product",
      payments: "Payments",
      compliance: "Compliance",
      gdprReady: "GDPR / NDPR ready",
      dataResidency: "Data residency aware",
      copyright: "All rights reserved."
    },
    errors: {
      promptRequired: "Talk about your website",
      insufficientCredits: "You need at least 1 credit to generate a website. Buy more."
    },
    success: {
      generated: "Website done generated!"
    }
  }
};

const EXAMPLE_PROMPTS = {
  English: [
    "Design a Lagos restaurant homepage with WhatsApp CTA & Paystack checkout…",
    "Build a Nairobi tech startup landing page with M-Pesa integration…",
    "Create a Mumbai fashion store with UPI payments & Hindi support…",
    "Design a London consulting firm website with Stripe & GDPR compliance…",
    "Build a Cape Town tourism site with local payment options…",
    "Create a Berlin e-commerce store with EU payment regulations…"
  ],
  French: [
    "Concevez une page d'accueil de restaurant à Lagos avec CTA WhatsApp et paiement Paystack…",
    "Créez une page de startup tech de Nairobi avec intégration M-Pesa…",
    "Créez un magasin de mode de Mumbai avec paiements UPI et support Hindi…",
    "Concevez un site de cabinet de conseil londonien avec Stripe et conformité RGPD…",
    "Créez un site touristique du Cap avec options de paiement locales…",
    "Créez un magasin e-commerce berlinois avec réglementations de paiement UE…"
  ],
  Swahili: [
    "Buni ukurasa wa nyumbani wa mgahawa wa Lagos na WhatsApp CTA na Paystack…",
    "Jenga ukurasa wa startup ya teknolojia ya Nairobi na ushirikiano wa M-Pesa…",
    "Unda duka la mitindo la Mumbai na malipo ya UPI na msaada wa Kihindi…",
    "Buni tovuti ya kampuni ya ushauri ya London na Stripe na utii wa GDPR…",
    "Jenga tovuti ya utalii ya Cape Town na chaguo za malipo za ndani…",
    "Unda duka la e-commerce la Berlin na kanuni za malipo za EU…"
  ],
  Pidgin: [
    "Design Lagos restaurant homepage wey get WhatsApp CTA & Paystack checkout…",
    "Build Nairobi tech startup page wey get M-Pesa integration…",
    "Create Mumbai fashion store wey get UPI payments & Hindi support…",
    "Design London consulting firm website wey get Stripe & GDPR compliance…",
    "Build Cape Town tourism site wey get local payment options…",
    "Create Berlin e-commerce store wey get EU payment regulations…"
  ]
};

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
  user,
  userProfile,
  setIsAuthModalOpen,
}: {
  title: string;
  price: string;
  features: string[];
  highlight?: boolean;
  cta: string;
  user: any;
  userProfile: any;
  setIsAuthModalOpen: (value: boolean) => void;
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

  // Get current translations
  const t = translations[lang];

  // Reset typewriter effect when language changes
  useEffect(() => {
    setCurrentPrompt("");
    setCharIndex(0);
    setPromptIndex(0);
    setIsDeleting(false);
  }, [lang]);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [promptIndex, setPromptIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [websitePrompt, setWebsitePrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [attachedImages, setAttachedImages] = useState<File[]>([]);

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
    const currentLangPrompts = EXAMPLE_PROMPTS[lang];
    const promptText = currentLangPrompts[promptIndex];
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
        setPromptIndex((promptIndex + 1) % currentLangPrompts.length);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, promptIndex, lang]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) return;

      const response = await fetch('/api/credits', {
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`
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

    if (!websitePrompt.trim()) {
      alert(t.errors.promptRequired || 'Please enter a description of your website');
      return;
    }

    // Check user profile and credits
    if (!userProfile) {
      alert('Loading user profile...');
      await fetchUserProfile(user.id);
      // Check again after fetching
      if (!userProfile) {
        alert('Failed to load user profile. Please try again.');
        return;
      }
    }

    if (userProfile.credits < 1) {
      alert(t.errors.insufficientCredits || 'You need at least 1 credit to generate a website. Please purchase more credits.');
      return;
    }

    setIsGenerating(true);
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) {
        alert('Please sign in again');
        setIsAuthModalOpen(true);
        return;
      }

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`
        },
        body: JSON.stringify({
          prompt: websitePrompt.trim(),
          language: lang,
          images: attachedImages,
          culturalConfig: {
            detectedRegion: 'Africa', // This should ideally be dynamic
            language: lang
          }
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Handle successful generation
        alert(t.success.generated || 'Website generated successfully!');

        // Refresh user profile to show updated credits
        await fetchUserProfile(user.id);

        // Clear the prompt and attached images
        setWebsitePrompt('');
        setAttachedImages([]);

        // You can add logic here to display the generated website
        console.log('Generated template:', data.template);

      } else {
        const errorMessage = data.error || data.message || 'Failed to generate website';
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error generating website:', error);
      alert('Network error. Please check your connection and try again.');
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
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-sky-400 to-violet-500" />
            <span className="text-lg font-bold tracking-tight">
              <span className="text-white">Ado</span>
              <span className="text-white/80">rrable</span>
            </span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a className="text-sm text-white/80 hover:text-white transition-colors" href="#features">
              {t.navbar.features}
            </a>
            <a className="text-sm text-white/80 hover:text-white transition-colors" href="#templates">
              {t.navbar.templates}
            </a>
            <a className="text-sm text-white/80 hover:text-white transition-colors" href="#pricing">
              {t.navbar.pricing}
            </a>
            <a className="text-sm text-white/80 hover:text-white transition-colors" href="#docs">
              {t.navbar.docs}
            </a>
          </nav>
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/70">
                  {userProfile?.credits || 0} {t.navbar.credits}
                </span>
                <span className="text-sm text-white/90">
                  {user.email}
                </span>
                <button 
                  onClick={handleSignOut}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10 transition-colors"
                >
                  {t.navbar.signOut}
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10 transition-colors"
                >
                  {t.navbar.signIn}
                </button>
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-400 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-shadow"
                >
                  {t.navbar.getStarted}
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
              {t.hero.badge}
            </div>

            <h1 className={`text-5xl font-extrabold tracking-tight sm:text-7xl mb-6 ${gradientText}`}>
              {t.hero.title}
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-white/70 mb-12 leading-relaxed mt-8">
              {t.hero.subtitle}
            </p>

            {/* Prompt Input Box */}
            <div className={`${cardClass} mx-auto max-w-5xl p-8 mb-8`}>
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4 rounded-2xl bg-black/40 px-6 py-6 min-h-[120px]">
                  <MessageSquare className="h-6 w-6 text-white/60 flex-shrink-0 mt-1" />
                  <textarea
                    className="w-full bg-transparent text-lg text-white placeholder:text-white/50 focus:outline-none resize-none leading-relaxed"
                    placeholder={user ? t.hero.placeholder : (currentPrompt + (charIndex === EXAMPLE_PROMPTS[lang][promptIndex]?.length ? "" : "|"))}
                    value={websitePrompt}
                    onChange={(e) => setWebsitePrompt(e.target.value)}
                    rows={4}
                  />
                  <div className="flex flex-col gap-3 flex-shrink-0 mt-1">
                    <button 
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*,.pdf,.doc,.docx,.txt';
                        input.onchange = (e) => {
                          const files = Array.from((e.target as HTMLInputElement).files || []);
                          if (files.length > 0) {
                            setAttachedImages(files);
                            alert(`${files.length} file(s) selected: ${files.map(f => f.name).join(', ')}. File upload functionality is now integrated!`);
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
                        const repoUrl = window.prompt('Enter GitHub repository URL:');
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
                      disabled={isGenerating || !websitePrompt.trim()}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/90 px-8 py-4 text-lg font-semibold text-black transition hover:bg-white whitespace-nowrap shadow-lg ml-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? t.hero.generating : t.hero.generateButton} 
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
                {t.features.title}
              </h2>
              <p className="text-xl text-white/70 mt-6">
                {t.features.subtitle}
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <Feature
                icon={Globe}
                title={t.features.culturalTemplates.title}
                desc={t.features.culturalTemplates.desc}
              />
              <Feature
                icon={Sparkles}
                title={t.features.chatToBuild.title}
                desc={t.features.chatToBuild.desc}
              />
              <Feature
                icon={CreditCard}
                title={t.features.rightPayments.title}
                desc={t.features.rightPayments.desc}
              />
              <Feature
                icon={Zap}
                title={t.features.blazingPerformance.title}
                desc={t.features.blazingPerformance.desc}
              />
            </div>
          </motion.div>
        </section>

        {/* COMMUNITY TEMPLATES */}
        <section id="templates" className={`${sectionClass} py-20`}>
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className={`text-4xl font-bold mb-4 ${gradientText}`}>
              {t.community.title}
            </h2>
            <p className="text-xl text-white/70">
              {t.community.subtitle}
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
              {t.pricing.title}
            </h2>
            <p className="text-xl text-white/70">
              {t.pricing.subtitle}
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
              title={t.pricing.starter.title}
              price={t.pricing.starter.price}
              features={t.pricing.starter.features}
              cta={t.pricing.starter.cta}
              user={user}
              userProfile={userProfile}
              setIsAuthModalOpen={setIsAuthModalOpen}
            />
            <PriceCard
              title={t.pricing.growth.title}
              price={t.pricing.growth.price}
              features={t.pricing.growth.features}
              cta={t.pricing.growth.cta}
              user={user}
              userProfile={userProfile}
              setIsAuthModalOpen={setIsAuthModalOpen}
            />
            <PriceCard
              title={t.pricing.lifetime.title}
              price={t.pricing.lifetime.price}
              features={t.pricing.lifetime.features}
              highlight
              cta={t.pricing.lifetime.cta}
              user={user}
              userProfile={userProfile}
              setIsAuthModalOpen={setIsAuthModalOpen}
            />
          </motion.div>
        </section>

        {/* CTA SECTION */}
        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-600/20 via-fuchsia-500/20 to-emerald-400/20" />
          <div className={`${sectionClass} ${cardClass} flex flex-col items-center gap-6 py-12 text-center`}>
            <h3 className="text-3xl font-bold">{t.cta.title}</h3>
            <p className="max-w-2xl text-lg text-white/80">
              {t.cta.subtitle}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => !user ? setIsAuthModalOpen(true) : handleGenerateWebsite()}
                className="rounded-xl bg-white px-6 py-3 font-semibold text-black hover:bg-white/90 transition-colors"
              >
                {user ? t.hero.generateButton : t.cta.startFree}
              </button>
              <button 
                onClick={() => alert('Templates gallery coming soon!')}
                className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-white/90 hover:bg-white/15 transition-colors"
              >
                {t.cta.viewTemplates}
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
              {t.footer.description}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white/90">{t.footer.product}</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li><a href="#features" className="hover:text-white transition-colors">{t.navbar.features}</a></li>
              <li><a href="#templates" className="hover:text-white transition-colors">{t.navbar.templates}</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">{t.navbar.pricing}</a></li>
              <li><a href="#docs" className="hover:text-white transition-colors">{t.navbar.docs}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white/90">{t.footer.payments}</h4>
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
            <h4 className="mb-4 text-sm font-semibold text-white/90">{t.footer.compliance}</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> {t.footer.gdprReady}
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> {t.footer.dataResidency}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Adorrable.dev — Myndava AI Systems LLC. {t.footer.copyright}
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