"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { createClient } from '@supabase/supabase-js';
import CrispChat from "../components/CrispChat";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

type Language = "English" | "French" | "Swahili" | "Pidgin";
type ViewMode = "chat" | "split" | "code" | "preview";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  language?: Language;
  images?: any[];
}

interface PricePackage {
  name: string;
  credits: number;
  price: string;
  popular: boolean;
}

// Thinking Animation Component
const ThinkingAnimation = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "🤔 Thinking...",
    "🎨 Designing layout...",
    "📝 Writing code...",
    "🎯 Adding your content...",
    "✨ Finishing touches...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return <span>{steps[currentStep]}</span>;
};

// Success Quotes Component
const SuccessQuotes = () => {
  const quotes = [
    {
      text: "Adorrable helped me launch my fashion brand's website in minutes. The African-inspired designs were exactly what I needed!",
      author: "Amina K.",
      role: "Fashion Entrepreneur, Lagos"
    },
    {
      text: "As a photographer, I needed a portfolio that stood out. Adorrable's cultural touch made all the difference.",
      author: "Kwame A.",
      role: "Photographer, Accra"
    },
    {
      text: "The multi-language support in Pidgin, Swahili, and French opened up new markets for my restaurant.",
      author: "Fatou D.",
      role: "Restaurant Owner, Dakar"
    },
    {
      text: "Building my tech startup's landing page was so easy. The AI understood exactly what we needed.",
      author: "Chidi O.",
      role: "Tech Founder, Abuja"
    }
  ];

  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      maxWidth: "800px",
      margin: "80px auto",
      padding: "0 24px",
      textAlign: "center"
    }}>
      <h2 style={{
        fontSize: "32px",
        fontWeight: "700",
        color: "white",
        marginBottom: "48px",
        background: "linear-gradient(135deg, #6EE7B7, #67E8F9)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
      }}>
        What Our Creators Say
      </h2>

      <div style={{
        position: "relative",
        height: "200px",
        overflow: "hidden"
      }}>
        {quotes.map((quote, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              opacity: index === currentQuote ? 1 : 0,
              transform: `translateY(${index === currentQuote ? 0 : 20}px)`,
              transition: "all 0.8s ease-in-out",
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(10px)",
              borderRadius: "20px",
              padding: "32px",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
          >
            <blockquote style={{
              fontSize: "18px",
              lineHeight: "1.6",
              color: "rgba(255,255,255,0.9)",
              marginBottom: "24px",
              fontStyle: "italic"
            }}>
              "{quote.text}"
            </blockquote>
            <div>
              <div style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#10B981",
                marginBottom: "4px"
              }}>
                {quote.author}
              </div>
              <div style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.6)"
              }}>
                {quote.role}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quote indicators */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "8px",
        marginTop: "32px"
      }}>
        {quotes.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuote(index)}
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              border: "none",
              background: index === currentQuote ? "#10B981" : "rgba(255,255,255,0.3)",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Completion Sound Function
const playCompletionSound = () => {
  try {
    // Create a success sound using Web Audio API
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    // Create a pleasant completion sound (C major chord)
    const notes = [261.63, 329.63, 392.0]; // C4, E4, G4

    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = "sine";

      // Envelope for smooth sound
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.1,
        audioContext.currentTime + 0.01,
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5,
      );

      oscillator.start(audioContext.currentTime + index * 0.1);
      oscillator.stop(audioContext.currentTime + 0.6 + index * 0.1);
    });
  } catch (error) {
    console.log("Audio not available:", error);
  }
};

// Supabase Client Initialization - Client-side only
const initializeSupabase = () => {
  if (typeof window === 'undefined') {
    // Return mock client for server-side rendering
    return {
      auth: {
        signInWithOAuth: () => Promise.resolve({ error: { message: "Server-side rendering" } }),
        signInWithPassword: () => Promise.resolve({ error: { message: "Server-side rendering" } }),
        signUp: () => Promise.resolve({ error: { message: "Server-side rendering" } }),
        signOut: () => Promise.resolve({ error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      }
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    return createClient(supabaseUrl, supabaseAnonKey);
  } else {
    console.warn("Supabase environment variables missing. Using mock client.");
    return {
      auth: {
        signInWithOAuth: () => Promise.resolve({ error: { message: "Environment not configured" } }),
        signInWithPassword: () => Promise.resolve({ error: { message: "Environment not configured" } }),
        signUp: () => Promise.resolve({ error: { message: "Environment not configured" } }),
        signOut: () => Promise.resolve({ error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      }
    };
  }
};

const supabase = initializeSupabase();

// Auth Modal Component (Assuming it's in components/AuthModal.tsx)
// It should handle sign-up/sign-in with email, Google, and LinkedIn
const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) setError(error.message);
    } catch (err) {
      setError("Authentication service not configured. Please try again later.");
    }
  };

  const handleLinkedInSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin',
      });
      if (error) setError(error.message);
    } catch (err) {
      setError("Authentication service not configured. Please try again later.");
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isSignIn) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
        else onSuccess();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setError(error.message);
        else {
          alert('Check your email for confirmation!');
          setIsSignIn(true);
        }
      }
    } catch (err) {
      setError("Authentication service not configured. Please try again later.");
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: "linear-gradient(135deg, #1e293b, #334155)",
        borderRadius: "16px",
        padding: "32px",
        width: "400px",
        maxWidth: "90%",
        color: "white",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ textAlign: "center", fontSize: "24px", fontWeight: "700", marginBottom: "24px" }}>
          {isSignIn ? "Sign In" : "Sign Up"}
        </h2>

        <form onSubmit={handleEmailSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "16px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px",
              color: "white",
              fontSize: "14px",
              outline: "none",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "16px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px",
              color: "white",
              fontSize: "14px",
              outline: "none",
            }}
          />
          {error && <p style={{ color: "#f87171", fontSize: "12px", marginBottom: "16px" }}>{error}</p>}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              background: "linear-gradient(135deg, #10B981, #059669)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "opacity 0.3s",
            }}
          >
            {isSignIn ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div style={{ textAlign: "center", margin: "20px 0", position: "relative", borderTop: "1px solid rgba(255,255,255,0.2)" }}>
          <span style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #1e293b, #334155)", padding: "0 10px", fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>OR</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button onClick={handleGoogleSignIn} style={{
            width: "100%",
            padding: "12px",
            background: "rgba(255,255,255,0.1)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            transition: "background 0.3s"
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.37l0-.02H18l.02.01c1.76.15 3.05-.85 3.74-2.48l.01-.01c.56-1.09.87-2.3.87-3.67zM12 23c2.47 0 4.53-.81 6.02-2.19l-1.71-1.32c-.7.48-1.64.78-2.65.78-.79 0-1.53-.27-2.12-.75l-.02.01c-1.07-.7-1.79-1.73-1.79-2.94v-.02c0-1.15.72-2.17 1.79-2.94l.02-.01h-.02C8.77 14.51 12 15.09 12 15v4.77zM6.87 13.54c-.16.37-.25.77-.25 1.19s.09.82.25 1.19h11.49l-.02.01c-1.18.79-1.99 1.8-1.99 2.94v.02c0 1.11.81 2.12 1.99 2.94h-.02l-.01.01C13.51 22.97 12 23 12 23c-2.47 0-4.53-.81-6.02-2.19l1.71-1.32c.7.48 1.64.78 2.65.78.69 0 1.35-.23 1.87-.65l.01-.01H7.74l-.01.01C6.28 18.99 6 17.98 6 16.77v-.02c0-1.11.81-2.12 1.99-2.94h-.02l-.01.01C6.98 13.54 6.92 13.54 6.87 13.54zM12 6.38c-1.49 0-2.72-.95-3.17-2.24l-.01-.01h3.17v-3.17h.02C13.29 0 14 1.07 14 2.27v.02c0 1.33-1.15 2.48-2.65 2.48z"/></svg>
            <span>Continue with Google</span>
          </button>

          <button onClick={handleLinkedInSignIn} style={{
            width: "100%",
            padding: "12px",
            background: "rgba(255,255,255,0.1)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            transition: "background 0.3s"
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M21,0H3C1.343,0,0,1.343,0,3v18c0,1.657,1.343,3,3,3h18c1.657,0,3-1.343,3-3V3C24,1.343,22.657,0,21,0zM7.9,16.934h-2.525V7.247h2.525V16.934zM5.762,5.934c-1.469,0-2.669-1.196-2.669-2.669c0-1.473,1.2-2.673,2.669-2.673s2.673,1.2,2.673,2.673C8.435,4.738,7.235,5.934,5.762,5.934zM18.161,16.934h-2.526V11.43c0-1.325-0.982-2.275-2.267-2.275c-1.285,0-2.147,0.95-2.147,2.275v5.504h-2.527V7.247h2.527v1.648c0.743-1.182,1.913-1.84,3.164-1.84c1.376,0,2.668,0.733,2.854,2.104v5.983H18.161z"/></svg>
            <span>Continue with LinkedIn</span>
          </button>
        </div>

        <button
          onClick={() => setIsSignIn(!isSignIn)}
          style={{
            marginTop: "24px",
            background: "none",
            border: "none",
            color: "#67e8f9",
            textDecoration: "underline",
            cursor: "pointer",
            width: "100%",
            fontSize: "14px",
          }}
        >
          {isSignIn ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
        </button>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.5)",
            fontSize: "24px",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState<Language>("English");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] = useState(null);
  const [credits, setCredits] = useState(4);
  const [mounted, setMounted] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [textareaRows, setTextareaRows] = useState(3);
  const [placeholderText, setPlaceholderText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [attachedImages, setAttachedImages] = useState([]);
  const [titleComplete, setTitleComplete] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("chat");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [generatedCode, setGeneratedCode] = useState("");
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "code">("chat");
  const [showPricing, setShowPricing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);


  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const placeholderTimerRef = useRef(null);
  const cursorTimerRef = useRef(null);
  const chatContainerRef = useRef(null);
  const previewRef = useRef(null);

  const languages: Language[] = [
    "English",
    "French",
    "Swahili",
    "Pidgin",
  ];
  const fullText = "Build something with Adorrable";

  // Multi-language placeholder messages
  const placeholderMessages = {
    English: [
      "Create a landing page for a Lagos fashion brand with a product grid",
      "Build a modern restaurant website with online menu and reservations",
      "Design a tech startup homepage with testimonials and pricing",
      "Make a portfolio website for a Nigerian photographer",
      "Create an e-commerce site for handmade African crafts",
      "Build a website for a European luxury goods company",
      "Design a US-based SaaS product landing page",
      "Create an online store for Asian artisanal products",
      "Develop a Nordic minimalist design agency portfolio",
      "Build an Australian outdoor gear e-commerce site",
      "Create a Japanese tea ceremony booking platform",
      "Design a German engineering consultancy website",
      "Build a Brazilian carnival event management site",
      "Create an Indian spice marketplace platform",
      "Design a Canadian maple syrup farm website"
    ],
    French: [
      "Créer une page d'accueil pour une marque de mode de Lagos",
      "Construire un site web de restaurant moderne avec menu en ligne",
      "Concevoir une page d'accueil de startup tech avec témoignages",
      "Faire un site portfolio pour un photographe nigérian",
      "Créer un site e-commerce pour l'artisanat africain fait main",
      "Construire un site pour une entreprise européenne de produits de luxe",
      "Concevoir une page de destination pour un produit SaaS basé aux États-Unis",
      "Créer une boutique en ligne pour des produits artisanaux asiatiques",
      "Développer un portfolio d'agence de design minimaliste nordique",
      "Construire un site e-commerce d'équipement de plein air australien",
      "Créer une plateforme de réservation de cérémonie du thé japonaise",
      "Concevoir un site web de conseil en ingénierie allemand",
      "Construire un site de gestion d'événements de carnaval brésilien",
      "Créer une plateforme de marché d'épices indiennes",
      "Concevoir un site web de ferme de sirop d'érable canadien"
    ],
    Swahili: [
      "Unda ukurasa wa kwanza wa biashara ya mavazi ya Lagos",
      "Jenga tovuti ya kisasa ya mgahawa na menyu ya mtandaoni",
      "Buni ukurasa wa kwanza wa kampuni ya teknolojia",
      "Fanya tovuti ya portfolio kwa mpiga picha wa Nigeria",
      "Unda tovuti ya biashara kwa sanaa za Afrika",
      "Jenga tovuti kwa kampuni ya bidhaa za kifahari za Ulaya",
      "Buni ukurasa wa bidhaa za SaaS za Marekani",
      "Unda duka la mtandaoni kwa bidhaa za sanaa za Asia",
      "Tengeneza portfolio ya wakala wa kubuni wa Nordic",
      "Jenga tovuti ya biashara ya vifaa vya nje vya Australia",
      "Unda jukwaa la kuhifadhi sherehe za chai za Kijapani",
      "Buni tovuti ya ushauri wa uhandisi wa Kijerumani",
      "Jenga tovuti ya usimamizi wa sherehe za carnival za Brazil",
      "Unda jukwaa la soko la bizari za Kihindi",
      "Buni tovuti ya shamba la syrup ya mapple ya Canada"
    ],
    Pidgin: [
      "Make landing page for Lagos fashion brand wey get product grid",
      "Build modern restaurant website wey get online menu",
      "Design tech startup homepage wey get testimonials",
      "Make portfolio website for Nigerian photographer",
      "Create e-commerce site for handmade African crafts",
      "Build website for European luxury goods company",
      "Design US-based SaaS product landing page",
      "Create online store for Asian artisan products",
      "Develop Nordic minimalist design agency portfolio",
      "Build Australian outdoor gear e-commerce site",
      "Create Japanese tea ceremony booking platform",
      "Design German engineering consultancy website",
      "Build Brazilian carnival event management site",
      "Create Indian spice marketplace platform",
      "Design Canadian maple syrup farm website"
    ]
  };

  // Sample generated code for initial demo
  const sampleCode = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Lagos Fashion Brand</title>
          <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                  font-family: 'Inter', sans-serif;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: #333;
              }
              .hero {
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  text-align: center;
                  padding: 2rem;
              }
              .hero h1 {
                  font-size: clamp(2rem, 5vw, 4rem);
                  color: white;
                  margin-bottom: 1rem;
                  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
              }
              .hero p {
                  font-size: 1.2rem;
                  color: rgba(255,255,255,0.9);
                  max-width: 600px;
                  margin: 0 auto 2rem;
              }
              .cta-button {
                  background: linear-gradient(135deg, #10B981, #059669);
                  color: white;
                  padding: 16px 32px;
                  border: none;
                  border-radius: 12px;
                  font-size: 18px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  text-decoration: none;
                  display: inline-block;
              }
              .cta-button:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
              }
              .products {
                  padding: 4rem 2rem;
                  background: white;
              }
              .product-grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                  gap: 2rem;
                  max-width: 1200px;
                  margin: 0 auto;
              }
              .product-card {
                  background: #f8f9fa;
                  border-radius: 16px;
                  overflow: hidden;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                  transition: transform 0.3s ease;
              }
              .product-card:hover {
                  transform: translateY(-5px);
              }
              .product-image {
                  height: 250px;
                  background: linear-gradient(45deg, #667eea, #764ba2);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 18px;
              }
              .product-info {
                  padding: 1.5rem;
              }
              .product-title {
                  font-size: 1.2rem;
                  font-weight: 600;
                  margin-bottom: 0.5rem;
              }
              .product-price {
                  color: #10B981;
                  font-size: 1.1rem;
                  font-weight: 600;
              }
          </style>
      </head>
      <body>
          <section class="hero">
              <div>
                  <h1>Lagos Fashion Brand</h1>
                  <p>Discover the latest trends in African fashion. Premium quality, modern designs, cultural heritage.</p>
                  <a href="#products" class="cta-button">Shop Collection</a>
              </div>
          </section>

          <section class="products" id="products">
              <div class="product-grid">
                  <div class="product-card">
                      <div class="product-image">Premium Ankara Dress</div>
                      <div class="product-info">
                          <div class="product-title">Traditional Ankara Maxi Dress</div>
                          <div class="product-price">₦25,000</div>
                      </div>
                  </div>
                  <div class="product-card">
                      <div class="product-image">Modern Agbada</div>
                      <div class="product-info">
                          <div class="product-title">Contemporary Agbada Set</div>
                          <div class="product-price">₦45,000</div>
                      </div>
                  </div>
                  <div class="product-card">
                      <div class="product-image">Designer Headwrap</div>
                      <div class="product-info">
                          <div class="product-title">Luxury Gele Collection</div>
                          <div class="product-price">₦15,000</div>
                      </div>
                  </div>
              </div>
          </section>
      </body>
      </html>`;

  // Load prompts from local storage
  const loadPrompts = useCallback(async () => {
    const storedPrompts = localStorage.getItem('adorrable-prompts');
    if (storedPrompts) {
      setPrompts(JSON.parse(storedPrompts));
    } else {
      setPrompts([]); // Initialize with empty array if nothing is stored
    }
  }, []);

  // Save prompts to local storage
  const savePrompts = useCallback((currentPrompts: ChatMessage[]) => {
    localStorage.setItem('adorrable-prompts', JSON.stringify(currentPrompts));
  }, []);

  // Generate function with real API integration
  const handleGenerate = useCallback(async () => {
    if (!text.trim() || credits <= 0 || isGenerating) {
      return;
    }

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: text,
      timestamp: new Date(),
      language: language,
      images: attachedImages,
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);
    setGeneratedTemplate(null);

    // Determine cultural configuration based on language (or potentially more sophisticated detection)
    let culturalConfig = {
      detectedRegion: "Global",
      paymentMethods: ["Credit Card", "PayPal"],
      designElements: ["Modern", "Clean"],
      businessStyle: "E-commerce",
    };

    if (language === "French") {
      culturalConfig = {
        detectedRegion: "Europe (EU)",
        paymentMethods: ["Credit Card", "SEPA Transfer", "PayPal"],
        designElements: ["Elegant", "Minimalist", "Chic"],
        businessStyle: "Luxury Retail",
      };
    } else if (language === "English" && text.toLowerCase().includes("us")) {
      culturalConfig = {
        detectedRegion: "North America (US)",
        paymentMethods: ["Credit Card", "PayPal", "Apple Pay", "Google Pay"],
        designElements: ["User-friendly", "Direct", "Informative"],
        businessStyle: "SaaS",
      };
    } else if (language === "English" && text.toLowerCase().includes("asia")) {
      culturalConfig = {
        detectedRegion: "Asia",
        paymentMethods: ["Credit Card", "Alipay", "WeChat Pay", "Local Options"],
        designElements: ["Vibrant", "Cultural Motifs", "Interactive"],
        businessStyle: "E-commerce",
      };
    } else if (language === "Swahili" || language === "Pidgin") {
      culturalConfig = {
        detectedRegion: "Africa",
        paymentMethods: ["Mobile Money", "Bank Transfer", "Cash on Delivery"],
        designElements: ["Bold", "Colorful", "Community-focused"],
        businessStyle: "Local Business",
      };
    }


    try {
      // For now, just check credits locally (backend integration ready)
      if (credits <= 0) {
        throw new Error('Insufficient credits');
      }

      // Upload images if any
      let uploadedImages = [];
      if (attachedImages.length > 0) {
        const formData = new FormData();
        attachedImages.forEach((img) => {
          formData.append("images", img.file);
        });

        const uploadResponse = await fetch("/api/images/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          uploadedImages = uploadResult.images;
        }
      }

      // Generate template with AI
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: text,
          language: language,
          images: uploadedImages,
          culturalConfig: culturalConfig, // Pass cultural config to backend
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate template");
      }

      const result = await response.json();

      if (result.success) {
        // Play completion sound
        playCompletionSound();

        // Add assistant response to chat
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: `✨ Template generated successfully!\n\n🎯 **${result.template.title}**\n🗣️ Language: ${result.template.language}\n📍 Region: ${culturalConfig.detectedRegion}\n📄 Ready for editing and preview`,
          timestamp: new Date(),
          language: language,
        };

        setChatMessages((prev) => [...prev, assistantMessage]);
        setGeneratedCode(result.template.code);
        setGeneratedTemplate({
          ...result.template,
          metadata: {
            model: "gpt-4",
            tokens: result.usage?.total_tokens || 0,
            culturallyAdapted: language !== "English",
            targetRegion: culturalConfig.detectedRegion,
            culturalFeatures: {
              paymentMethods: culturalConfig.paymentMethods,
              designElements: culturalConfig.designElements,
              businessStyle: culturalConfig.businessStyle
            }
          },
        });
        setViewMode("split"); // Switch to split view after generation
        setCredits((prev) => prev - 1);
      } else {
        throw new Error(result.message || "Generation failed");
      }
    } catch (error) {
      console.error("Generation error:", error);

      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: "assistant",
        content: `❌ Sorry, there was an error generating your template. Please try again.\n\nError: ${error.message}`,
        timestamp: new Date(),
        language: language,
      };

      setChatMessages((prev) => [...prev, errorMessage]);

      // Fallback to sample code for demo
      setGeneratedCode(sampleCode);
      setGeneratedTemplate({
        title: "Sample Template",
        language: language,
        code: sampleCode,
        metadata: {
          model: "gpt-4",
          tokens: 0,
          culturallyAdapted: language !== "English",
          targetRegion: culturalConfig.detectedRegion,
          culturalFeatures: {
            paymentMethods: culturalConfig.paymentMethods,
            designElements: culturalConfig.designElements,
            businessStyle: culturalConfig.businessStyle
          }
        },
      });
      setViewMode("split");
      playCompletionSound(); // Still play sound for demo
    } finally {
      setIsGenerating(false);
      setText("");
      setAttachedImages([]);
    }
  }, [text, credits, isGenerating, language, attachedImages]);

  // Update preview when code changes
  useEffect(() => {
    if (previewRef.current && generatedCode) {
      const iframe = previewRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(generatedCode);
      doc.close();
    }
  }, [generatedCode]);

  // Initial title typewriter effect
  useEffect(() => {
    setMounted(true);

    let currentIndex = 0;
    const typeWriter = () => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeWriter, 100);
      } else {
        setTitleComplete(true);
      }
    };

    setTimeout(typeWriter, 500);
  }, []);

  // Stable placeholder typewriter effect
  useEffect(() => {
    if (!mounted) return;

    // Clear existing timers
    if (placeholderTimerRef.current) {
      clearTimeout(placeholderTimerRef.current);
    }
    if (cursorTimerRef.current) {
      clearInterval(cursorTimerRef.current);
    }

    const currentMessages = placeholderMessages[language] || placeholderMessages.English;
    let messageIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let currentMessage = currentMessages[messageIndex % currentMessages.length];

    setPlaceholderText("");

    const typePlaceholder = () => {
      if (!isDeleting) {
        if (charIndex < currentMessage.length) {
          setPlaceholderText(currentMessage.slice(0, charIndex + 1));
          charIndex++;
          placeholderTimerRef.current = setTimeout(typePlaceholder, 80);
        } else {
          placeholderTimerRef.current = setTimeout(() => {
            isDeleting = true;
            typePlaceholder();
          }, 3000);
        }
      } else {
        if (charIndex > 0) {
          setPlaceholderText(currentMessage.slice(0, charIndex - 1));
          charIndex--;
          placeholderTimerRef.current = setTimeout(typePlaceholder, 40);
        } else {
          isDeleting = false;
          messageIndex = (messageIndex + 1) % currentMessages.length;
          currentMessage = currentMessages[messageIndex];
          placeholderTimerRef.current = setTimeout(typePlaceholder, 500);
        }
      }
    };

    // Start the placeholder animation
    placeholderTimerRef.current = setTimeout(typePlaceholder, 500);

    return () => {
      if (placeholderTimerRef.current) {
        clearTimeout(placeholderTimerRef.current);
      }
    };
  }, [mounted, language]);

  // Separate cursor blinking effect
  useEffect(() => {
    if (!mounted) return;

    cursorTimerRef.current = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    return () => {
      if (cursorTimerRef.current) {
        clearInterval(cursorTimerRef.current);
      }
    };
  }, [mounted]);

  // Enter key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleGenerate();
      }
    };

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener("keydown", handleKeyDown);
      return () => textarea.removeEventListener("keydown", handleKeyDown);
    }
  }, [handleGenerate]);

  // Auto-resize textarea
  useEffect(() => {
    const lines = text.split("\n").length;
    const wordsPerLine = 60;
    const words = text.split(" ").length;
    const estimatedLines = Math.max(lines, Math.ceil(words / wordsPerLine));
    setTextareaRows(Math.max(3, Math.min(estimatedLines, 12)));
  }, [text]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Auth state management
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    setAttachedImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (id) => {
    setAttachedImages((prev) => {
      const imgToRemove = prev.find((img) => img.id === id);
      if (imgToRemove) {
        URL.revokeObjectURL(imgToRemove.url);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleNewTemplate = () => {
    setGeneratedTemplate(null);
    setText("");
    setAttachedImages([]);
    setViewMode("chat");
    setChatMessages([]);
    setGeneratedCode("");
  };

  const handleExportTemplate = async () => {
    if (!generatedTemplate) return;

    try {
      // Save template first
      await fetch("/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(generatedTemplate),
      });

      // Then export
      const response = await fetch(
        `/api/templates/${generatedTemplate.id}/export`,
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${generatedTemplate.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.html`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  // Handle panel resizing
  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const containerWidth = window.innerWidth;
      const newWidth = (e.clientX / containerWidth) * 100;
      setLeftPanelWidth(Math.max(20, Math.min(80, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleUpgrade = () => {
    setShowUpgrade(true)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setShowDropdown(false)
    setUser(null) // Clear user state
    setCredits(0) // Reset credits on sign out
  }

  if (!mounted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid rgba(255,255,255,0.3)",
            borderTop: "4px solid #10B981",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );
  }

  // Render different views based on mode
  const renderContent = () => {
    if (viewMode === "chat") {
      return renderChatView();
    } else if (viewMode === "split") {
      return renderSplitView();
    } else if (viewMode === "code") {
      return renderCodeView();
    } else if (viewMode === "preview") {
      return renderPreviewView();
    }
  };

  const renderChatView = () => (
    <main
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "80px 24px 0",
        textAlign: "center",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Hero Section with Typewriter Effect */}
      <div
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(40px)",
          transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.2s",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(48px, 8vw, 96px)",
            fontWeight: "800",
            marginBottom: "24px",
            background: "linear-gradient(135deg, #6EE7B7, #67E8F9, #A78BFA)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: "1.05",
            letterSpacing: "-0.04em",
            textShadow: "0 1px 3px rgba(0,0,0,0.3)",
            minHeight: "120px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {displayedText}
          {!titleComplete && (
            <span
              style={{
                display: "inline-block",
                width: "4px",
                height: "0.8em",
                background: "linear-gradient(135deg, #6EE7B7, #67E8F9)",
                marginLeft: "8px",
                animation: "blink 1s infinite",
                borderRadius: "2px",
              }}
            />
          )}
        </h1>

        <p
          style={{
            fontSize: "24px",
            color: "rgba(255,255,255,0.8)",
            lineHeight: "1.5",
            maxWidth: "800px",
            margin: "0 auto 48px",
            fontWeight: "400",
            letterSpacing: "-0.01em",
          }}
        >
          Create apps and culturally intelligent websites by chatting with AI
        </p>
      </div>

      {/* Chat Messages */}
      {chatMessages.length > 0 && (
        <div
          ref={chatContainerRef}
          style={{
            maxWidth: "800px",
            margin: "0 auto 32px",
            maxHeight: "400px",
            overflowY: "auto",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "20px",
            padding: "20px",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {chatMessages.map((message) => (
            <div
              key={message.id}
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "16px",
                justifyContent:
                  message.type === "user" ? "flex-end" : "flex-start",
              }}
            >
              {message.type === "assistant" && (
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #10B981, #8B5CF6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    style={{ color: "white" }}
                  >
                    <path
                      fill="currentColor"
                      d="M12 21s-6.7-4.2-9.5-7C-0.6 11.1 1 6.8 4.8 6.3c2-.3 3.5.7 4.3 2 0 0 1.2-2.5 4.3-2 3.8.5 5.4 4.8 2.3 7.7C18.7 16.8 12 21 12 21z"
                    />
                  </svg>
                </div>
              )}

              <div
                style={{
                  maxWidth: "70%",
                  padding: "12px 16px",
                  borderRadius: "16px",
                  background:
                    message.type === "user"
                      ? "linear-gradient(135deg, #10B981, #059669)"
                      : "rgba(255,255,255,0.1)",
                  color: "white",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  whiteSpace: "pre-wrap",
                  textAlign: "left",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                {message.content}
                {message.images && message.images.length > 0 && (
                  <div
                    style={{
                      marginTop: "8px",
                      display: "flex",
                      gap: "4px",
                      flexWrap: "wrap",
                    }}
                  >
                    {message.images.map((img) => (
                      <img
                        key={img.id}
                        src={img.url}
                        alt={img.name}
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "6px",
                          objectFit: "cover",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {message.type === "user" && (
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    style={{ color: "white" }}
                  >
                    <path
                      fill="currentColor"
                      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}

          {/* Enhanced Thinking Animation */}
          {isGenerating && (
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "16px",
                justifyContent: "flex-start",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #10B981, #8B5CF6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  animation: "float 2s ease-in-out infinite",
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTop: "2px solid white",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
              </div>

              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.1)",
                  color: "white",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  minWidth: "200px",
                }}
              >
                <ThinkingAnimation />
              </div>
            </div>
          )}
        </div>
      )}
      {renderInputSection()}

      {/* Success Quotes Section */}
      <SuccessQuotes />

      {/* Simple Footer */}
      <div
        style={{
          marginTop: "60px",
          textAlign: "center",
          padding: "40px 24px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.6)",
          fontSize: "14px",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <a
            href="#"
            style={{
              color: "inherit",
              textDecoration: "none",
              margin: "0 16px",
            }}
          >
            About
          </a>
          <button
            onClick={() => setShowPricing(true)}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              textDecoration: "none",
              margin: "0 16px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Pricing
          </button>
          <a
            href="#"
            style={{
              color: "inherit",
              textDecoration: "none",
              margin: "0 16px",
            }}
          >
            Templates
          </a>
          <a
            href="#"
            style={{
              color: "inherit",
              textDecoration: "none",
              margin: "0 16px",
            }}
          >
            Support
          </a>
        </div>
        <div>
          © 2025 Adorrable.dev - Made for everyone with a touch of Africa 🌍
        </div>
      </div>
    </main>
  );

  const renderSplitView = () => (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
      }}
    >
      {/* Top Toolbar */}
      <div
        style={{
          height: "60px",
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <h2
            style={{
              color: "white",
              fontSize: "18px",
              fontWeight: "600",
              background: "linear-gradient(135deg, #10B981, #8B5CF6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Adorrable
          </h2>

          {/* View Mode Buttons */}
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "8px",
              padding: "4px",
            }}
          >
            {["chat", "split", "code", "preview"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as ViewMode)}
                style={{
                  padding: "8px 12px",
                  border: "none",
                  background:
                    viewMode === mode
                      ? "rgba(16, 185, 129, 0.2)"
                      : "transparent",
                  color:
                    viewMode === mode ? "#10B981" : "rgba(255,255,255,0.7)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "500",
                  cursor: "pointer",
                  textTransform: "capitalize",
                  transition: "all 0.2s ease",
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={handleExportTemplate}
            disabled={!generatedTemplate}
            style={{
              padding: "8px 16px",
              background: generatedTemplate
                ? "linear-gradient(135deg, #10B981, #059669)"
                : "rgba(255,255,255,0.1)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: generatedTemplate ? "pointer" : "not-allowed",
              opacity: generatedTemplate ? 1 : 0.5,
              transition: "all 0.2s ease",
            }}
          >
            Export HTML
          </button>

          <button
            onClick={handleNewTemplate}
            style={{
              padding: "8px 16px",
              background: "rgba(255,255,255,0.1)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            New Template
          </button>
        </div>
      </div>

      {/* Split Panel Container */}
      <div
        style={{
          flex: 1,
          display: "flex",
          position: "relative",
        }}
      >
        {/* Left Panel */}
        <div
          style={{
            width: `${leftPanelWidth}%`,
            display: "flex",
            flexDirection: "column",
            background: "rgba(15, 23, 42, 0.8)",
            borderRight: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* Tab Headers */}
          <div
            style={{
              height: "40px",
              display: "flex",
              background: "rgba(255,255,255,0.05)",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {["chat", "code"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as "chat" | "code")}
                style={{
                  flex: 1,
                  border: "none",
                  background:
                    activeTab === tab
                      ? "rgba(16, 185, 129, 0.1)"
                      : "transparent",
                  color:
                    activeTab === tab ? "#10B981" : "rgba(255,255,255,0.7)",
                  fontSize: "12px",
                  fontWeight: "500",
                  cursor: "pointer",
                  textTransform: "capitalize",
                  transition: "all 0.2s ease",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            {activeTab === "chat" ? (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Chat Messages */}
                <div
                  ref={chatContainerRef}
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "20px",
                  }}
                >
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      style={{
                        display: "flex",
                        gap: "12px",
                        marginBottom: "16px",
                        justifyContent:
                          message.type === "user" ? "flex-end" : "flex-start",
                      }}
                    >
                      {message.type === "assistant" && (
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg, #10B981, #8B5CF6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            style={{ color: "white" }}
                          >
                            <path
                              fill="currentColor"
                              d="M12 21s-6.7-4.2-9.5-7C-0.6 11.1 1 6.8 4.8 6.3c2-.3 3.5.7 4.3 2 0 0 1.2-2.5 4.3-2 3.8.5 5.4 4.8 2.3 7.7C18.7 16.8 12 21 12 21z"
                            />
                          </svg>
                        </div>
                      )}

                      <div
                        style={{
                          maxWidth: "70%",
                          padding: "8px 12px",
                          borderRadius: "12px",
                          background:
                            message.type === "user"
                              ? "linear-gradient(135deg, #10B981, #059669)"
                              : "rgba(255,255,255,0.1)",
                          color: "white",
                          fontSize: "12px",
                          lineHeight: "1.4",
                          whiteSpace: "pre-wrap",
                          textAlign: "left",
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {message.content}
                      </div>

                      {message.type === "user" && (
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            style={{ color: "white" }}
                          >
                            <path
                              fill="currentColor"
                              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Enhanced Thinking Animation for Split View */}
                  {isGenerating && (
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        marginBottom: "16px",
                        justifyContent: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #10B981, #8B5CF6)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          animation: "float 2s ease-in-out infinite",
                        }}
                      >
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            border: "1px solid rgba(255,255,255,0.3)",
                            borderTop: "1px solid white",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                          }}
                        />
                      </div>

                      <div
                        style={{
                          padding: "8px 12px",
                          borderRadius: "12px",
                          background: "rgba(255,255,255,0.1)",
                          color: "white",
                          fontSize: "12px",
                          lineHeight: "1.4",
                          minWidth: "150px",
                        }}
                      >
                        <ThinkingAnimation />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Section for Split View */}
                <div
                  style={{
                    padding: "16px",
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(15, 23, 42, 0.6)",
                  }}
                >
                  {renderInputSection(true)}
                </div>
              </div>
            ) : (
              /* Code Editor */
              <div style={{ height: "100%", background: "#1e1e1e" }}>
                <MonacoEditor
                  height="100%"
                  defaultLanguage="html"
                  value={generatedCode}
                  onChange={(value) => setGeneratedCode(value || "")}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    lineNumbers: "on",
                    wordWrap: "on",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Resize Handle */}
        <div
          onMouseDown={handleMouseDown}
          style={{
            width: "4px",
            background: isResizing ? "#10B981" : "rgba(255,255,255,0.1)",
            cursor: "col-resize",
            position: "relative",
            zIndex: 10,
            transition: "background 0.2s ease",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "20px",
              height: "40px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "2px",
                height: "16px",
                background: "rgba(255,255,255,0.3)",
                marginRight: "2px",
              }}
            />
            <div
              style={{
                width: "2px",
                height: "16px",
                background: "rgba(255,255,255,0.3)",
              }}
            />
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div
          style={{
            width: `${100 - leftPanelWidth}%`,
            background: "white",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              height: "40px",
              background: "rgba(0,0,0,0.05)",
              borderBottom: "1px solid rgba(0,0,0,0.1)",
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              fontSize: "12px",
              color: "#666",
              fontWeight: "500",
            }}
          >
            Live Preview
          </div>

          <iframe
            ref={previewRef}
            style={{
              flex: 1,
              border: "none",
              width: "100%",
              background: "white",
            }}
            title="Template Preview"
          />
        </div>
      </div>
    </div>
  );

  const renderCodeView = () => (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#1e1e1e",
      }}
    >
      <div
        style={{
          height: "60px",
          background: "rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
        }}
      >
        <h3 style={{ color: "white", fontSize: "16px", fontWeight: "600" }}>
          Code Editor
        </h3>
        <button
          onClick={() => setViewMode("split")}
          style={{
            padding: "8px 16px",
            background: "linear-gradient(135deg, #10B981, #059669)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
          }}
        >
          Back to Split View
        </button>
      </div>

      <MonacoEditor
        height="calc(100vh - 60px)"
        defaultLanguage="html"
        value={generatedCode}
        onChange={(value) => setGeneratedCode(value || "")}
        theme="vs-dark"
        options={{
          fontSize: 16,
          lineNumbers: "on",
          wordWrap: "on",
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
        }}
      />
    </div>
  );

  // Pricing Modal Component
  const PricingModal = () => (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={() => setShowPricing(false)}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1e293b, #334155)",
          borderRadius: "20px",
          padding: "32px",
          maxWidth: "600px",
          width: "90%",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            color: "white",
            fontSize: "24px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          Choose Your Plan
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
          {[
            { name: "Starter", credits: 50, price: "$9.99", popular: false },
            { name: "Creator", credits: 200, price: "$29.99", popular: true },
            { name: "Business", credits: 500, price: "$59.99", popular: false },
          ].map((plan: PricePackage) => (
            <div
              key={plan.name}
              style={{
                background: plan.popular ? "linear-gradient(135deg, #10B981, #059669)" : "rgba(255,255,255,0.05)",
                border: plan.popular ? "2px solid #10B981" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                padding: "24px",
                textAlign: "center",
                position: "relative",
              }}
            >
              {plan.popular && (
                <div
                  style={{
                    position: "absolute",
                    top: "-10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#10B981",
                    color: "white",
                    padding: "4px 16px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  POPULAR
                </div>
              )}

              <h3 style={{ color: "white", fontSize: "20px", marginBottom: "8px" }}>
                {plan.name}
              </h3>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", marginBottom: "16px" }}>
                {plan.credits} Credits
              </div>
              <div style={{ color: "white", fontSize: "32px", fontWeight: "700", marginBottom: "20px" }}>
                {plan.price}
              </div>

              <button
                style={{
                  width: "100%",
                  padding: "12px",
                  background: plan.popular ? "white" : "linear-gradient(135deg, #10B981, #059669)",
                  color: plan.popular ? "#10B981" : "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
                onClick={() => {
                  // Handle purchase
                  console.log(`Purchasing ${plan.name} plan`);
                  setShowPricing(false);
                }}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowPricing(false)}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.5)",
            fontSize: "24px",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>
    </div>
  );

  const renderPreviewView = () => (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "white",
      }}
    >
      <div
        style={{
          height: "60px",
          background: "rgba(0,0,0,0.05)",
          borderBottom: "1px solid rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
        }}
      >
        <h3 style={{ color: "#333", fontSize: "16px", fontWeight: "600" }}>
          Template Preview
        </h3>
        <button
          onClick={() => setViewMode("split")}
          style={{
            padding: "8px 16px",
            background: "linear-gradient(135deg, #10B981, #059669)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
          }}
        >
          Back to Split View
        </button>
      </div>

      <iframe
        ref={previewRef}
        style={{
          flex: 1,
          border: "none",
          width: "100%",
          background: "white",
        }}
        title="Template Preview"
      />
    </div>
  );

  const renderInputSection = (compact = false) => (
    <div
      style={{
        margin: compact ? "0" : "0 auto",
        width: "100%",
        maxWidth: compact ? "100%" : "800px",
        borderRadius: compact ? "12px" : "28px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        background: "rgba(255,255,255,0.05)",
        padding: compact ? "16px" : "40px",
        boxShadow: compact
          ? "0 4px 20px -4px rgba(0,0,0,0.3)"
          : "0 10px 50px -10px rgba(0,0,0,0.45)",
        backdropFilter: "blur(20px)",
        marginBottom: compact ? "0" : "20px",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.6s",
      }}
    >
      {!compact && (
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "500",
            color: "rgba(255,255,255,0.7)",
            marginBottom: "8px",
            textAlign: "left",
          }}
        >
          Ask Adorrable to create a business website…
        </label>
      )}

      {/* Main Input Box with Inline Controls */}
      <div
        style={{
          borderRadius: compact ? "8px" : "16px",
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(15, 23, 42, 0.6)",
          position: "relative",
          transition: "all 0.3s ease",
        }}
      >
        {/* Textarea */}
        <div
          style={{
            padding: compact ? "12px" : "16px",
            paddingBottom: compact ? "48px" : "60px",
          }}
        >
          <textarea
            ref={textareaRef}
            rows={compact ? 2 : textareaRows}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isGenerating}
            style={{
              width: "100%",
              resize: "none",
              background: "transparent",
              outline: "none",
              border: "none",
              color: "rgba(255,255,255,0.9)",
              fontSize: compact ? "14px" : "16px",
              transition: "height 0.2s ease",
              lineHeight: "1.5",
            }}
            placeholder=""
          />

          {/* Custom animated placeholder */}
          {!text && !compact && (
            <div
              style={{
                position: "absolute",
                top: "16px",
                left: "16px",
                right: "16px",
                pointerEvents: "none",
                color: "rgba(255,255,255,0.4)",
                fontSize: "16px",
                lineHeight: "1.5",
                fontFamily: "inherit",
                minHeight: "24px",
                display: "flex",
                alignItems: "flex-start",
                overflow: "hidden",
              }}
            >
              <span 
                style={{ 
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "calc(100% - 10px)",
                  display: "block"
                }}
              >
                {placeholderText}
              </span>
              <span
                style={{
                  display: "inline-block",
                  width: "2px",
                  height: "1.2em",
                  background: "rgba(16, 185, 129, 0.7)",
                  marginLeft: "2px",
                  opacity: showCursor ? 1 : 0,
                  transition: "opacity 0.1s ease",
                  borderRadius: "1px",
                  flexShrink: 0,
                }}
              />
            </div>
          )}
        </div>

        {/* Attached Images */}
        {attachedImages.length > 0 && (
          <div
            style={{
              padding: compact ? "0 12px 12px" : "0 16px 16px",
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {attachedImages.map((img) => (
              <div
                key={img.id}
                style={{
                  position: "relative",
                  width: compact ? "40px" : "60px",
                  height: compact ? "40px" : "60px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <img
                  src={img.url}
                  alt={img.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <button
                  onClick={() => removeImage(img.id)}
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-6px",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "#EF4444",
                    color: "white",
                    border: "none",
                    fontSize: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Controls Bar */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            padding: compact ? "8px 12px" : "12px 16px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(15, 23, 42, 0.3)",
            borderRadius: compact ? "0 0 8px 8px" : "0 0 16px 16px",
          }}
        >
          {/* Left: Image Attachment */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isGenerating}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.6)",
                cursor: isGenerating ? "not-allowed" : "pointer",
                padding: "4px",
                borderRadius: "4px",
                transition: "color 0.2s ease",
                opacity: isGenerating ? 0.5 : 1,
              }}
              title="Attach images"
            >
              <svg
                width={compact ? "16" : "20"}
                height={compact ? "16" : "20"}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49" />
              </svg>
            </button>
          </div>

          {/* Center: Language Selection */}
          <div
            style={{
              display: "flex",
              gap: compact ? "4px" : "6px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: compact ? "6px" : "8px",
              padding: compact ? "2px" : "4px",
            }}
          >
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                disabled={isGenerating}
                style={{
                  padding: compact ? "4px 8px" : "6px 12px",
                  border: "none",
                  background:
                    language === lang
                      ? "rgba(16, 185, 129, 0.3)"
                      : "transparent",
                  color:
                    language === lang ? "#10B981" : "rgba(255,255,255,0.6)",
                  borderRadius: compact ? "4px" : "6px",
                  fontSize: compact ? "9px" : "10px",
                  fontWeight: "500",
                  cursor: isGenerating ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  opacity: isGenerating ? 0.5 : 1,
                }}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Right: Submit Button */}
          <button
            onClick={handleGenerate}
            disabled={!text.trim() || credits <= 0 || isGenerating}
            style={{
              background:
                text.trim() && credits > 0 && !isGenerating
                  ? "linear-gradient(135deg, #10B981, #059669)"
                  : "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: compact ? "6px" : "8px",
              width: compact ? "32px" : "40px",
              height: compact ? "32px" : "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor:
                text.trim() && credits > 0 && !isGenerating
                  ? "pointer"
                  : "not-allowed",
              transition: "all 0.2s ease",
              opacity: text.trim() && credits > 0 && !isGenerating ? 1 : 0.4,
            }}
            title={
              !text.trim()
                ? "Enter a prompt"
                : credits <= 0
                  ? "No credits remaining"
                  : "Generate template"
            }
          >
            {isGenerating ? (
              <div
                style={{
                  width: compact ? "12px" : "16px",
                  height: compact ? "12px" : "16px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTop: "2px solid white",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
            ) : (
              <svg
                width={compact ? "16" : "20"}
                height={compact ? "16" : "20"}
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M22 2L11 13"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 2L15 22L11 13L2 9L22 2Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Credits Display */}
      {!compact && (
        <div
          style={{
            textAlign: "center",
            marginTop: "16px",
            color: "rgba(255,255,255,0.5)",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <span>{credits} credits remaining</span>
          <button
            onClick={() => setShowPricing(true)}
            style={{
              background: "linear-gradient(135deg, #10B981, #059669)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "4px 8px",
              fontSize: "10px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Buy More
          </button>
        </div>
      )}
    </div>
  );


  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
        position: "relative",
        overflow: viewMode === "chat" ? "auto" : "hidden",
      }}
    >
      {error && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          background: "#ef4444",
          color: "white",
          padding: "12px 20px",
          borderRadius: "8px",
          zIndex: 1000,
          fontWeight: "500"
        }}>
          {error}
        </div>
      )}
      {/* Background Effects */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
                radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)
              `,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Animated Background Particles */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 100px,
                  rgba(255,255,255,0.01) 100px,
                  rgba(255,255,255,0.01) 101px
                ),
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 100px,
                  rgba(255,255,255,0.01) 100px,
                  rgba(255,255,255,0.01) 101px
                )
              `,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes blink {
          0%,
          50% {
            opacity: 1;
          }
          51%,
          100% {
            opacity: 0;
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
      `}</style>

      {/* Header Section */}
      <header style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "80px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
        background: "rgba(15, 23, 42, 0.5)",
        backdropFilter: "blur(15px)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "800",
              background: "linear-gradient(135deg, #6EE7B7, #67E8F9)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Adorrable
          </h1>

          <nav style={{ display: "flex", gap: "24px", marginLeft: "40px" }}>
            <a href="#" style={{ color: "white", textDecoration: "none", fontWeight: "500", fontSize: "14px" }}>Features</a>
            <a href="#" style={{ color: "white", textDecoration: "none", fontWeight: "500", fontSize: "14px" }}>Templates</a>
            <a href="#" style={{ color: "white", textDecoration: "none", fontWeight: "500", fontSize: "14px" }}>Pricing</a>
            <a href="#" style={{ color: "white", textDecoration: "none", fontWeight: "500", fontSize: "14px" }}>Docs</a>
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(59, 130, 246, 0.1)",
              padding: "8px 12px",
              borderRadius: "20px",
              border: "1px solid rgba(59, 130, 246, 0.2)"
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              <span style={{ fontSize: "14px", fontWeight: "500", color: "#3B82F6" }}>{credits} credits</span>
            </div>
          )}

          {user ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px",
                  borderRadius: "20px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  transition: "background 0.2s ease"
                }}
                onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.1)"}
                onMouseLeave={(e) => e.target.style.background = "none"}
              >
                <div style={{
                  width: "32px",
                  height: "32px",
                  background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      style={{ width: "32px", height: "32px", borderRadius: "50%" }}
                    />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  )}
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)">
                  <polyline points="6,9 12,15 18,9"/>
                </svg>
              </button>

              {showDropdown && (
                <div style={{
                  position: "absolute",
                  right: "0",
                  marginTop: "8px",
                  width: "192px",
                  background: "rgba(31, 41, 55, 0.95)",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "4px 0",
                  zIndex: 10,
                  backdropFilter: "blur(10px)"
                }}>
                  <div style={{
                    padding: "12px 16px",
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.7)",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    wordBreak: "break-word"
                  }}>
                    {user.email}
                  </div>
                  <button style={{
                    width: "100%",
                    padding: "12px 16px",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.7)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "14px",
                    transition: "background 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.target.style.background = "none"}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                    Settings
                  </button>
                  <button style={{
                    width: "100%",
                    padding: "12px 16px",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.7)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "14px",
                    transition: "background 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.target.style.background = "none"}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Support
                  </button>
                  <hr style={{ margin: "4px 0", border: "none", borderTop: "1px solid rgba(255,255,255,0.1)" }} />
                  <button
                    onClick={handleSignOut}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      color: "#EF4444",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "14px",
                      transition: "background 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.target.style.background = "rgba(239, 68, 68, 0.1)"}
                    onMouseLeave={(e) => e.target.style.background = "none"}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#EF4444">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16,17 21,12 16,7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              style={{
                padding: "8px 16px",
                background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => e.target.style.transform = "translateY(-1px)"}
              onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
            >
              Sign In
            </button>
          )}
        </div>
      </header>


      {renderContent()}

      {/* Pricing Modal */}
      {showPricing && <PricingModal />}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          // Fetch user data or update state after successful auth
          const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
            // Optionally fetch initial credits here
            setCredits(4); // Resetting credits for demo purposes
          };
          fetchUser();
        }}
      />

      {/* Crisp Chat */}
      <CrispChat />
    </div>
  );
}