"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { createClient } from '@supabase/supabase-js';
import CrispChat from "../components/CrispChat";
import AuthModal from "../components/AuthModal";
import InspirationalWidget from "../components/InspirationalWidget";

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

// Mock client for SSR and error cases
function createMockClient() {
  return {
    auth: {
      signInWithOAuth: () => Promise.resolve({ error: { message: "Authentication not configured" } }),
      signInWithPassword: () => Promise.resolve({ error: { message: "Authentication not configured" } }),
      signUp: () => Promise.resolve({ error: { message: "Authentication not configured" } }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
  };
}

// Initialize Supabase client with proper error handling
const createSupabaseClient = () => {
  if (typeof window === 'undefined') {
    return createMockClient();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      return createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
      console.error("Supabase initialization error:", error);
      return createMockClient();
    }
  } else {
    console.warn("Supabase environment variables missing. Using mock client.");
    return createMockClient();
  }
};

const supabaseClient = createSupabaseClient();

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
  const [showUpgrade, setShowUpgrade] = useState(false); // Added state for upgrade modal

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
      "Beni tovuti ya ushauri wa uhandisi wa Kijerumani",
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

        // Add assistant message to chat
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
      const { data: { session } } = await supabaseClient.auth.getSession()
      setUser(session?.user || null)
    }

    checkUser()

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
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
    await supabaseClient.auth.signOut()
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
            border: "1px solid rgba(255,255,255,0.1)"
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

      {/* Global Workspace Section */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "120px auto 0",
          padding: "0 24px",
        }}
      >
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px"
        }}>
          <h2 style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "white",
            margin: "0"
          }}>
            Global Adorrable's Workspace
          </h2>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "16px"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.1)",
              padding: "8px 12px",
              borderRadius: "8px"
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>Search projects...</span>
            </div>
            <select style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px",
              padding: "8px 12px",
              color: "rgba(255,255,255,0.8)",
              fontSize: "14px"
            }}>
              <option>Last edited</option>
              <option>Newest first</option>
            </select>
            <select style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px",
              padding: "8px 12px",
              color: "rgba(255,255,255,0.8)",
              fontSize: "14px"
            }}>
              <option>All creators</option>
            </select>
            <button style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              fontSize: "14px",
              cursor: "pointer"
            }}>
              View All
            </button>
          </div>
        </div>

        {/* Project Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
          marginBottom: "48px"
        }}>
          <div 
            onClick={() => {
              const restaurantCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Amala On Demand</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; line-height: 1.6; }
        .hero { 
            background: linear-gradient(135deg, #F59E0B, #D97706); 
            min-height: 100vh; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            text-align: center; 
            color: white; 
            padding: 2rem;
        }
        .hero h1 { font-size: 3.5rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.2rem; max-width: 600px; margin: 0 auto 2rem; }
        .cta-btn { 
            background: white; 
            color: #F59E0B; 
            padding: 16px 32px; 
            border: none; 
            border-radius: 8px; 
            font-size: 18px; 
            font-weight: 600; 
            cursor: pointer; 
        }
        .menu { padding: 4rem 2rem; background: #FEF3C7; }
        .menu-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 2rem; 
            max-width: 1200px; 
            margin: 0 auto; 
        }
        .menu-item { 
            background: white; 
            padding: 2rem; 
            border-radius: 12px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
            text-align: center;
        }
        .menu-item h3 { color: #F59E0B; margin-bottom: 1rem; }
        .price { font-size: 1.5rem; font-weight: 700; color: #D97706; }
    </style>
</head>
<body>
    <section class="hero">
        <div>
            <h1>Amala On Demand</h1>
            <p>Authentic Nigerian cuisine delivered to your doorstep. Fresh amala, gbegiri, and ewedu made with love.</p>
            <button class="cta-btn">Order Now</button>
        </div>
    </section>
    <section class="menu">
        <h2 style="text-align: center; margin-bottom: 3rem; color: #D97706; font-size: 2.5rem;">Our Menu</h2>
        <div class="menu-grid">
            <div class="menu-item">
                <h3>Amala & Gbegiri</h3>
                <p>Traditional yam flour served with bean soup</p>
                <div class="price">₦2,500</div>
            </div>
            <div class="menu-item">
                <h3>Amala & Ewedu</h3>
                <p>Smooth amala with vegetable soup</p>
                <div class="price">₦2,000</div>
            </div>
            <div class="menu-item">
                <h3>Full Combo</h3>
                <p>Amala with gbegiri, ewedu, and assorted meat</p>
                <div class="price">₦3,500</div>
            </div>
        </div>
    </section>
</body>
</html>`;
              setGeneratedCode(restaurantCode);
              setGeneratedTemplate({
                id: 'amala-restaurant',
                title: 'Amala On Demand',
                language: 'English',
                code: restaurantCode,
                createdAt: new Date().toISOString()
              });
              setViewMode("split");
            }}
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 30px rgba(245, 158, 11, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{
              height: "160px",
              background: "linear-gradient(135deg, #F59E0B, #D97706)",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <span style={{ color: "white", fontSize: "18px", fontWeight: "600" }}>Authentic Restaurant</span>
              <div style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "rgba(255,255,255,0.2)",
                color: "white",
                padding: "4px 8px",
                borderRadius: "20px",
                fontSize: "10px",
                fontWeight: "600"
              }}>
                Click to Preview
              </div>
            </div>
            <div style={{ padding: "16px" }}>
              <h3 style={{ color: "white", fontSize: "16px", fontWeight: "600", margin: "0 0 8px 0" }}>amala-on-demand</h3>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "rgba(255,255,255,0.6)",
                fontSize: "12px"
              }}>
                <div style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "#10B981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: "600",
                  color: "white"
                }}>G</div>
                <span>Edited 23 days ago</span>
              </div>
            </div>
          </div>

          <div 
            onClick={() => {
              const constructionCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Warrant Partners</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Inter', sans-serif; 
            background: linear-gradient(135deg, #1F2937, #374151); 
            color: white; 
            min-height: 100vh; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
        }
        .container { text-align: center; max-width: 800px; padding: 2rem; }
        .logo { font-size: 3rem; font-weight: 800; margin-bottom: 2rem; }
        .construction { 
            background: rgba(255,255,255,0.1); 
            padding: 3rem; 
            border-radius: 20px; 
            backdrop-filter: blur(10px); 
        }
        .icon { font-size: 4rem; margin-bottom: 2rem; }
        h1 { font-size: 2.5rem; margin-bottom: 1rem; }
        p { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.8; }
        .progress { 
            width: 100%; 
            height: 8px; 
            background: rgba(255,255,255,0.2); 
            border-radius: 4px; 
            overflow: hidden; 
            margin: 2rem 0; 
        }
        .progress-bar { 
            width: 75%; 
            height: 100%; 
            background: linear-gradient(90deg, #10B981, #059669); 
            animation: progress 2s ease-in-out infinite; 
        }
        @keyframes progress { 0%, 100% { transform: translateX(-10px); } 50% { transform: translateX(10px); } }
        .contact { margin-top: 2rem; }
        .btn { 
            background: linear-gradient(135deg, #10B981, #059669); 
            color: white; 
            padding: 12px 24px; 
            border: none; 
            border-radius: 8px; 
            text-decoration: none; 
            display: inline-block; 
            margin: 0 8px; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">Warrant Partners</div>
        <div class="construction">
            <div class="icon">🚧</div>
            <h1>Coming Soon</h1>
            <p>We're building something amazing. Our new website will be launching soon with exciting features and services.</p>
            <div class="progress">
                <div class="progress-bar"></div>
            </div>
            <p>75% Complete</p>
            <div class="contact">
                <a href="mailto:info@warrantpartners.com" class="btn">Contact Us</a>
                <a href="#" class="btn">Subscribe for Updates</a>
            </div>
        </div>
    </div>
</body>
</html>`;
              setGeneratedCode(constructionCode);
              setGeneratedTemplate({
                id: 'warrant-partners',
                title: 'Warrant Partners Web',
                language: 'English',
                code: constructionCode,
                createdAt: new Date().toISOString()
              });
              setViewMode("split");
            }}
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 30px rgba(55, 65, 81, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{
              height: "160px",
              background: "linear-gradient(135deg, #1F2937, #374151)",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <span style={{ color: "white", fontSize: "18px", fontWeight: "600" }}>Under Construction</span>
              <div style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "#10B981",
                color: "white",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "10px",
                fontWeight: "600"
              }}>
                Published
              </div>
              <div style={{
                position: "absolute",
                bottom: "12px",
                left: "12px",
                background: "rgba(255,255,255,0.2)",
                color: "white",
                padding: "4px 8px",
                borderRadius: "20px",
                fontSize: "10px",
                fontWeight: "600"
              }}>
                Click to Preview
              </div>
            </div>
            <div style={{ padding: "16px" }}>
              <h3 style={{ color: "white", fontSize: "16px", fontWeight: "600", margin: "0 0 8px 0" }}>warrant-partners-web</h3>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "rgba(255,255,255,0.6)",
                fontSize: "12px"
              }}>
                <div style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "#10B981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: "600",
                  color: "white"
                }}>G</div>
                <span>Edited 25 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* From the Community Section */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "60px auto 0",
          padding: "0 24px",
        }}
      >
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px"
        }}>
          <h2 style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "white",
            margin: "0"
          }}>
            From the Community
          </h2>
          <button style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.6)",
            fontSize: "14px",
            cursor: "pointer"
          }}>
            View All
          </button>
        </div>

          {/* Category Tabs */}
          <div style={{
            display: "flex",
            gap: "24px",
            marginBottom: "24px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            paddingBottom: "12px"
          }}>
            {["Popular", "Discover", "Internal Tools", "Website", "Personal", "Consumer App", "B2B App", "Prototype"].map((tab, index) => (
              <button
                key={tab}
                style={{
                  background: "none",
                  border: "none",
                  color: index === 0 ? "white" : "rgba(255,255,255,0.6)",
                  fontSize: "14px",
                  fontWeight: index === 0 ? "600" : "400",
                  cursor: "pointer",
                  borderBottom: index === 0 ? "2px solid #10B981" : "none",
                  paddingBottom: "4px"
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Community Templates Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px"
          }}>
            {[
              { 
                title: "E-commerce Store", 
                type: "Website", 
                color: "#10B981",
                code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ShopEase - Your Online Store</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
        .header { background: #10B981; color: white; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 1.5rem; font-weight: 700; }
        .nav { display: flex; gap: 2rem; }
        .nav a { color: white; text-decoration: none; }
        .hero { background: linear-gradient(135deg, #10B981, #059669); color: white; text-align: center; padding: 4rem 2rem; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
        .products { padding: 4rem 2rem; }
        .product-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; max-width: 1200px; margin: 0 auto; }
        .product { background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden; }
        .product-img { height: 200px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; }
        .product-info { padding: 1rem; }
        .price { color: #10B981; font-weight: 700; font-size: 1.2rem; }
        .btn { background: #10B981; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    </style>
</head>
<body>
    <header class="header">
        <div class="logo">ShopEase</div>
        <nav class="nav">
            <a href="#">Home</a>
            <a href="#">Products</a>
            <a href="#">About</a>
            <a href="#">Contact</a>
        </nav>
    </header>
    <section class="hero">
        <h1>Welcome to ShopEase</h1>
        <p>Discover amazing products at unbeatable prices</p>
    </section>
    <section class="products">
        <h2 style="text-align: center; margin-bottom: 3rem;">Featured Products</h2>
        <div class="product-grid">
            <div class="product">
                <div class="product-img">Product Image</div>
                <div class="product-info">
                    <h3>Wireless Headphones</h3>
                    <p class="price">$99.99</p>
                    <button class="btn">Add to Cart</button>
                </div>
            </div>
            <div class="product">
                <div class="product-img">Product Image</div>
                <div class="product-info">
                    <h3>Smart Watch</h3>
                    <p class="price">$199.99</p>
                    <button class="btn">Add to Cart</button>
                </div>
            </div>
            <div class="product">
                <div class="product-img">Product Image</div>
                <div class="product-info">
                    <h3>Laptop Stand</h3>
                    <p class="price">$49.99</p>
                    <button class="btn">Add to Cart</button>
                </div>
            </div>
        </div>
    </section>
</body>
</html>`
              },
              { 
                title: "SaaS Landing Page", 
                type: "Website", 
                color: "#3B82F6",
                code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CloudSync - Streamline Your Workflow</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
        .header { background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 1.5rem; font-weight: 700; color: #3B82F6; }
        .hero { background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; text-align: center; padding: 6rem 2rem; }
        .hero h1 { font-size: 3.5rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.2rem; max-width: 600px; margin: 0 auto 2rem; }
        .cta-btn { background: white; color: #3B82F6; padding: 16px 32px; border: none; border-radius: 8px; font-size: 18px; font-weight: 600; cursor: pointer; }
        .features { padding: 4rem 2rem; background: #f9fafb; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; max-width: 1200px; margin: 0 auto; }
        .feature { background: white; padding: 2rem; border-radius: 8px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .feature-icon { width: 60px; height: 60px; background: #3B82F6; border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; }
    </style>
</head>
<body>
    <header class="header">
        <div class="logo">CloudSync</div>
        <div>
            <button style="background: none; border: 1px solid #3B82F6; color: #3B82F6; padding: 8px 16px; border-radius: 4px; margin-right: 1rem;">Login</button>
            <button style="background: #3B82F6; color: white; border: none; padding: 8px 16px; border-radius: 4px;">Sign Up</button>
        </div>
    </header>
    <section class="hero">
        <h1>Streamline Your Workflow</h1>
        <p>CloudSync helps teams collaborate seamlessly with powerful automation and real-time synchronization.</p>
        <button class="cta-btn">Start Free Trial</button>
    </section>
    <section class="features">
        <h2 style="text-align: center; margin-bottom: 3rem; font-size: 2.5rem;">Why Choose CloudSync?</h2>
        <div class="features-grid">
            <div class="feature">
                <div class="feature-icon">⚡</div>
                <h3>Lightning Fast</h3>
                <p>Sync your data in real-time across all devices with our optimized infrastructure.</p>
            </div>
            <div class="feature">
                <div class="feature-icon">🔒</div>
                <h3>Secure & Private</h3>
                <p>Enterprise-grade security with end-to-end encryption for all your data.</p>
            </div>
            <div class="feature">
                <div class="feature-icon">🚀</div>
                <h3>Easy Integration</h3>
                <p>Connect with your favorite tools and services with our powerful API.</p>
            </div>
        </div>
    </section>
</body>
</html>`
              },
              { 
                title: "Portfolio Site", 
                type: "Personal", 
                color: "#8B5CF6",
                code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alex Johnson - Creative Designer</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; line-height: 1.6; }
        .header { background: #8B5CF6; color: white; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 1.5rem; font-weight: 700; }
        .nav { display: flex; gap: 2rem; }
        .nav a { color: white; text-decoration: none; }
        .hero { background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white; text-align: center; padding: 6rem 2rem; }
        .hero h1 { font-size: 3.5rem; margin-bottom: 1rem; }
        .portfolio { padding: 4rem 2rem; }
        .project-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; max-width: 1200px; margin: 0 auto; }
        .project { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.1); transition: transform 0.3s ease; }
        .project:hover { transform: translateY(-5px); }
        .project-img { height: 200px; background: linear-gradient(45deg, #8B5CF6, #EC4899); display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; }
        .project-info { padding: 1.5rem; }
        .about { background: #f9fafb; padding: 4rem 2rem; text-align: center; }
    </style>
</head>
<body>
    <header class="header">
        <div class="logo">Alex Johnson</div>
        <nav class="nav">
            <a href="#home">Home</a>
            <a href="#portfolio">Portfolio</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
        </nav>
    </header>
    <section class="hero" id="home">
        <h1>Creative Designer</h1>
        <p>I create beautiful and functional designs that make a difference</p>
    </section>
    <section class="portfolio" id="portfolio">
        <h2 style="text-align: center; margin-bottom: 3rem; font-size: 2.5rem;">My Work</h2>
        <div class="project-grid">
            <div class="project">
                <div class="project-img">Brand Identity</div>
                <div class="project-info">
                    <h3>Tech Startup Branding</h3>
                    <p>Complete brand identity for a fintech startup including logo, colors, and guidelines.</p>
                </div>
            </div>
            <div class="project">
                <div class="project-img">Web Design</div>
                <div class="project-info">
                    <h3>E-commerce Website</h3>
                    <p>Modern and responsive website design for an online fashion retailer.</p>
                </div>
            </div>
            <div class="project">
                <div class="project-img">Mobile App</div>
                <div class="project-info">
                    <h3>Food Delivery App</h3>
                    <p>UI/UX design for a local food delivery mobile application.</p>
                </div>
            </div>
        </div>
    </section>
    <section class="about" id="about">
        <h2 style="margin-bottom: 2rem; font-size: 2.5rem;">About Me</h2>
        <p style="max-width: 800px; margin: 0 auto; font-size: 1.1rem;">I'm a passionate designer with 5+ years of experience creating impactful visual solutions. I specialize in branding, web design, and user experience.</p>
    </section>
</body>
</html>`
              },
              { 
                title: "Restaurant Menu", 
                type: "Business", 
                color: "#F59E0B",
                code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bella's Kitchen - Menu</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Georgia', serif; background: #FEF3C7; }
        .header { background: #F59E0B; color: white; text-align: center; padding: 2rem; }
        .header h1 { font-size: 3rem; margin-bottom: 0.5rem; }
        .menu { padding: 3rem 2rem; max-width: 1000px; margin: 0 auto; }
        .menu-section { margin-bottom: 3rem; }
        .menu-section h2 { color: #D97706; font-size: 2rem; margin-bottom: 1.5rem; text-align: center; border-bottom: 2px solid #F59E0B; padding-bottom: 0.5rem; }
        .menu-item { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; padding: 1rem; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .item-info h3 { color: #D97706; margin-bottom: 0.5rem; }
        .item-info p { color: #666; max-width: 400px; }
        .price { color: #F59E0B; font-weight: bold; font-size: 1.2rem; }
        .footer { background: #F59E0B; color: white; text-align: center; padding: 2rem; }
    </style>
</head>
<body>
    <header class="header">
        <h1>Bella's Kitchen</h1>
        <p>Authentic Italian Cuisine</p>
    </header>
    <div class="menu">
        <div class="menu-section">
            <h2>Appetizers</h2>
            <div class="menu-item">
                <div class="item-info">
                    <h3>Bruschetta Trio</h3>
                    <p>Three varieties of our signature bruschetta with fresh tomatoes, basil, and mozzarella</p>
                </div>
                <div class="price">$12</div>
            </div>
            <div class="menu-item">
                <div class="item-info">
                    <h3>Antipasto Platter</h3>
                    <p>Selection of cured meats, cheeses, olives, and marinated vegetables</p>
                </div>
                <div class="price">$18</div>
            </div>
        </div>
        <div class="menu-section">
            <h2>Main Courses</h2>
            <div class="menu-item">
                <div class="item-info">
                    <h3>Spaghetti Carbonara</h3>
                    <p>Classic Roman pasta with eggs, pancetta, and Parmigiano-Reggiano</p>
                </div>
                <div class="price">$22</div>
            </div>
            <div class="menu-item">
                <div class="item-info">
                    <h3>Osso Buco</h3>
                    <p>Braised veal shanks with risotto Milanese and gremolata</p>
                </div>
                <div class="price">$32</div>
            </div>
        </div>
        <div class="menu-section">
            <h2>Desserts</h2>
            <div class="menu-item">
                <div class="item-info">
                    <h3>Tiramisu</h3>
                    <p>Traditional Italian coffee-flavored dessert with mascarpone</p>
                </div>
                <div class="price">$9</div>
            </div>
        </div>
    </div>
    <footer class="footer">
        <p>📍 123 Main Street | 📞 (555) 123-4567 | 🕒 Open Daily 5PM - 11PM</p>
    </footer>
</body>
</html>`
              },
              { 
                title: "Event Booking", 
                type: "App", 
                color: "#EF4444",
                code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EventPro - Book Your Perfect Event</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
        .header { background: #EF4444; color: white; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 1.5rem; font-weight: 700; }
        .hero { background: linear-gradient(135deg, #EF4444, #DC2626); color: white; text-align: center; padding: 4rem 2rem; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
        .booking-form { max-width: 600px; margin: -2rem auto 0; background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.1); position: relative; z-index: 10; }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333; }
        .form-group input, .form-group select { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px; }
        .btn { background: #EF4444; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; width: 100%; }
        .events { padding: 4rem 2rem; background: #f9fafb; }
        .event-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; max-width: 1200px; margin: 0 auto; }
        .event-card { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .event-img { height: 200px; background: linear-gradient(45deg, #EF4444, #F97316); display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; }
        .event-info { padding: 1.5rem; }
    </style>
</head>
<body>
    <header class="header">
        <div class="logo">EventPro</div>
        <nav>
            <a href="#" style="color: white; text-decoration: none; margin: 0 1rem;">Events</a>
            <a href="#" style="color: white; text-decoration: none; margin: 0 1rem;">Venues</a>
            <a href="#" style="color: white; text-decoration: none; margin: 0 1rem;">Contact</a>
        </nav>
    </header>
    <section class="hero">
        <h1>Book Your Perfect Event</h1>
        <p>From corporate meetings to weddings, we make event planning effortless</p>
    </section>
    <div class="booking-form">
        <h2 style="margin-bottom: 2rem; text-align: center;">Quick Booking</h2>
        <form>
            <div class="form-group">
                <label>Event Type</label>
                <select>
                    <option>Conference</option>
                    <option>Wedding</option>
                    <option>Birthday Party</option>
                    <option>Corporate Event</option>
                </select>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label>Date</label>
                    <input type="date">
                </div>
                <div class="form-group">
                    <label>Guests</label>
                    <select>
                        <option>10-25</option>
                        <option>25-50</option>
                        <option>50-100</option>
                        <option>100+</option>
                    </select>
                </div>
            </div>
            <button type="submit" class="btn">Find Venues</button>
        </form>
    </div>
    <section class="events">
        <h2 style="text-align: center; margin-bottom: 3rem; font-size: 2.5rem;">Popular Events</h2>
        <div class="event-grid">
            <div class="event-card">
                <div class="event-img">Corporate Conference</div>
                <div class="event-info">
                    <h3>Tech Summit 2025</h3>
                    <p>🗓️ March 15, 2025 • 📍 Downtown Convention Center</p>
                    <p style="margin-top: 1rem;">Join industry leaders for a day of innovation and networking.</p>
                </div>
            </div>
            <div class="event-card">
                <div class="event-img">Wedding Celebration</div>
                <div class="event-info">
                    <h3>Garden Wedding Package</h3>
                    <p>🗓️ Available Year Round • 📍 Riverside Gardens</p>
                    <p style="margin-top: 1rem;">Beautiful outdoor wedding venue with full service planning.</p>
                </div>
            </div>
        </div>
    </section>
</body>
</html>`
              },
              { 
                title: "Blog Platform", 
                type: "Website", 
                color: "#6366F1",
                code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TechBlog - Latest in Technology</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; }
        .header { background: #6366F1; color: white; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 1.5rem; font-weight: 700; }
        .nav { display: flex; gap: 2rem; }
        .nav a { color: white; text-decoration: none; }
        .hero { background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; text-align: center; padding: 4rem 2rem; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
        .blog { padding: 4rem 2rem; max-width: 1200px; margin: 0 auto; }
        .post-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; }
        .post { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.1); transition: transform 0.3s ease; }
        .post:hover { transform: translateY(-5px); }
        .post-img { height: 200px; background: linear-gradient(45deg, #6366F1, #8B5CF6); display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; }
        .post-content { padding: 1.5rem; }
        .post-meta { color: #666; font-size: 0.9rem; margin-bottom: 1rem; }
        .post h3 { margin-bottom: 0.5rem; color: #333; }
        .read-more { color: #6366F1; text-decoration: none; font-weight: 600; }
        .sidebar { background: #f9fafb; padding: 2rem; border-radius: 8px; }
    </style>
</head>
<body>
    <header class="header">
        <div class="logo">TechBlog</div>
        <nav class="nav">
            <a href="#">Home</a>
            <a href="#">Categories</a>
            <a href="#">About</a>
            <a href="#">Contact</a>
        </nav>
    </header>
    <section class="hero">
        <h1>Latest in Technology</h1>
        <p>Stay updated with the newest trends, reviews, and insights in tech</p>
    </section>
    <div class="blog">
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 3rem;">
            <div class="post-grid">
                <article class="post">
                    <div class="post-img">AI Revolution</div>
                    <div class="post-content">
                        <div class="post-meta">January 15, 2025 • By Alex Chen</div>
                        <h3>The Future of Artificial Intelligence in 2025</h3>
                        <p>Exploring the latest developments in AI technology and what they mean for businesses and consumers alike...</p>
                        <a href="#" class="read-more">Read More →</a>
                    </div>
                </article>
                <article class="post">
                    <div class="post-img">Web Development</div>
                    <div class="post-content">
                        <div class="post-meta">January 12, 2025 • By Sarah Kim</div>
                        <h3>Modern Web Development Trends</h3>
                        <p>A comprehensive look at the frameworks and tools shaping the future of web development...</p>
                        <a href="#" class="read-more">Read More →</a>
                    </div>
                </article>
                <article class="post">
                    <div class="post-img">Cybersecurity</div>
                    <div class="post-content">
                        <div class="post-meta">January 10, 2025 • By Mike Johnson</div>
                        <h3>Cybersecurity Best Practices for 2025</h3>
                        <p>Essential security measures every business should implement to protect against modern threats...</p>
                        <a href="#" class="read-more">Read More →</a>
                    </div>
                </article>
            </div>
            <aside class="sidebar">
                <h3 style="margin-bottom: 1rem;">Popular Categories</h3>
                <ul style="list-style: none;">
                    <li style="padding: 0.5rem 0; border-bottom: 1px solid #eee;"><a href="#" style="text-decoration: none; color: #6366F1;">Artificial Intelligence</a></li>
                    <li style="padding: 0.5rem 0; border-bottom: 1px solid #eee;"><a href="#" style="text-decoration: none; color: #6366F1;">Web Development</a></li>
                    <li style="padding: 0.5rem 0; border-bottom: 1px solid #eee;"><a href="#" style="text-decoration: none; color: #6366F1;">Mobile Apps</a></li>
                    <li style="padding: 0.5rem 0; border-bottom: 1px solid #eee;"><a href="#" style="text-decoration: none; color: #6366F1;">Cybersecurity</a></li>
                </ul>
            </aside>
        </div>
    </div>
</body>
</html>`
              }
            ].map((template, index) => (
              <div
                key={index}
                onClick={() => {
                  setGeneratedCode(template.code);
                  setGeneratedTemplate({
                    id: `community-${index}`,
                    title: template.title,
                    language: 'English',
                    code: template.code,
                    createdAt: new Date().toISOString()
                  });
                  setViewMode("split");
                }}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.1)",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 12px 30px ${template.color}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{
                  height: "120px",
                  background: template.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative"
                }}>
                  <span style={{ color: "white", fontSize: "14px", fontWeight: "600" }}>{template.title}</span>
                  <div style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: "rgba(255,255,255,0.2)",
                    color: "white",
                    padding: "2px 6px",
                    borderRadius: "12px",
                    fontSize: "8px",
                    fontWeight: "600"
                  }}>
                    Click to View
                  </div>
                </div>
                <div style={{ padding: "12px" }}>
                  <div style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.6)",
                    background: "rgba(255,255,255,0.1)",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    display: "inline-block"
                  }}>
                    {template.type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

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
              minHeight: compact ? "32px" : "40px",
              maxHeight: compact ? "64px" : "80px",
              padding: compact ? "8px 10px" : "12px 16px",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: compact ? "8px" : "12px",
              background: "rgba(255,255,255,0.08)",
              color: "white",
              fontSize: compact ? "13px" : "15px",
              outline: "none",
              fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              lineHeight: "1.5",
              wordWrap: "break-word",
              overflowWrap: "break-word",
              whiteSpace: "pre-wrap",
              overflow: "hidden",
              resize: "none",
              boxSizing: "border-box",
              verticalAlign: "top",
              textAlign: "left",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (text.trim() && credits > 0 && !isGenerating) {
                  handleGenerate();
                }
              }
            }}
          />

          {/* Custom animated placeholder */}
          {!text && !compact && (
            <div
              style={{
                position: "absolute",
                top: "28px",
                left: "28px",
                right: "28px",
                pointerEvents: "none",
                color: "rgba(255,255,255,0.45)",
                fontSize: "15px",
                lineHeight: "1.5",
                fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                minHeight: "23px",
                display: "flex",
                alignItems: "flex-start",
                overflow: "hidden",
                boxSizing: "border-box",
                maxHeight: "60px",
                wordBreak: "break-word",
                hyphens: "auto",
              }}
            >
              <span
                style={{
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 3,
                  maxWidth: "calc(100% - 8px)",
                  wordBreak: "break-word",
                  hyphens: "auto",
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
                  alignSelf: "flex-start",
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
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
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
            const { data: { session } } = await supabaseClient.auth.getSession();
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