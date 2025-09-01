
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@supabase/supabase-js";
import AuthModal from "../components/AuthModal";
import InspirationalWidget from "../components/InspirationalWidget";

// Dynamic import for CrispChat to avoid SSR issues
const CrispChat = dynamic(() => import("../components/CrispChat"), {
  ssr: false,
});

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Language = "English" | "French" | "Swahili";

interface Template {
  id: string;
  title: string;
  description: string;
  code: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  tags: string[];
  author: string;
  downloads: number;
  rating: number;
  createdAt: string;
}

interface CommunityTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  downloads: number;
  rating: number;
  tags: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  createdAt: string;
  preview: string;
  code: string;
}

export default function Home() {
  // State management
  const [mounted, setMounted] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState<Language>("English");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [credits, setCredits] = useState<number>(0);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);
  const [showPricing, setShowPricing] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [selectedCommunityTemplate, setSelectedCommunityTemplate] = useState<CommunityTemplate | null>(null);
  const [communityTemplates] = useState<CommunityTemplate[]>([
    {
      id: "1",
      title: "Modern Portfolio Website",
      description: "A sleek, responsive portfolio website with smooth animations and modern design.",
      category: "Portfolio",
      author: "Sarah Chen",
      downloads: 2840,
      rating: 4.9,
      tags: ["Portfolio", "Responsive", "Modern", "Animations"],
      difficulty: "Intermediate",
      createdAt: "2024-01-15",
      preview: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
      code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modern Portfolio</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 100px 20px; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.2rem; opacity: 0.9; }
        .container { max-width: 1200px; margin: 0 auto; padding: 80px 20px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
        .card { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); transition: transform 0.3s; }
        .card:hover { transform: translateY(-5px); }
    </style>
</head>
<body>
    <section class="hero">
        <h1>John Doe</h1>
        <p>Full Stack Developer & UI/UX Designer</p>
    </section>
    <div class="container">
        <div class="grid">
            <div class="card">
                <h3>Web Development</h3>
                <p>Creating responsive and dynamic web applications using modern technologies.</p>
            </div>
            <div class="card">
                <h3>UI/UX Design</h3>
                <p>Designing intuitive and beautiful user interfaces that enhance user experience.</p>
            </div>
            <div class="card">
                <h3>Mobile Apps</h3>
                <p>Building cross-platform mobile applications with React Native and Flutter.</p>
            </div>
        </div>
    </div>
</body>
</html>`
    },
    {
      id: "2",
      title: "E-commerce Product Page",
      description: "A complete e-commerce product page with shopping cart functionality and payment integration.",
      category: "E-commerce",
      author: "Mike Rodriguez",
      downloads: 1920,
      rating: 4.7,
      tags: ["E-commerce", "Shopping", "Product", "Cart"],
      difficulty: "Advanced",
      createdAt: "2024-01-12",
      preview: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop",
      code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Page</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; background: #f5f5f5; }
        .product-container { max-width: 1200px; margin: 50px auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .product-grid { display: grid; grid-template-columns: 1fr 1fr; }
        .product-image { background: url('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop') center/cover; height: 500px; }
        .product-info { padding: 40px; }
        .product-title { font-size: 2.5rem; margin-bottom: 15px; color: #333; }
        .product-price { font-size: 2rem; color: #e74c3c; margin-bottom: 20px; }
        .product-description { color: #666; margin-bottom: 30px; line-height: 1.8; }
        .btn { background: #3498db; color: white; padding: 15px 30px; border: none; border-radius: 8px; font-size: 1.1rem; cursor: pointer; transition: background 0.3s; }
        .btn:hover { background: #2980b9; }
    </style>
</head>
<body>
    <div class="product-container">
        <div class="product-grid">
            <div class="product-image"></div>
            <div class="product-info">
                <h1 class="product-title">Premium Headphones</h1>
                <div class="product-price">$299.99</div>
                <p class="product-description">Experience premium sound quality with these professional-grade headphones. Featuring noise cancellation, wireless connectivity, and 30-hour battery life.</p>
                <button class="btn">Add to Cart</button>
            </div>
        </div>
    </div>
</body>
</html>`
    },
    {
      id: "3",
      title: "Restaurant Landing Page",
      description: "An elegant restaurant landing page with menu showcase and reservation system.",
      category: "Restaurant",
      author: "Emma Thompson",
      downloads: 3156,
      rating: 4.8,
      tags: ["Restaurant", "Food", "Landing", "Menu"],
      difficulty: "Beginner",
      createdAt: "2024-01-10",
      preview: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop",
      code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bella Vista Restaurant</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Georgia', serif; }
        .hero { background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=800&fit=crop') center/cover; height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; color: white; }
        .hero h1 { font-size: 4rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.5rem; margin-bottom: 2rem; }
        .btn { background: #d4af37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 1.1rem; transition: background 0.3s; }
        .btn:hover { background: #b8941f; }
        .section { padding: 80px 20px; text-align: center; }
        .container { max-width: 1200px; margin: 0 auto; }
    </style>
</head>
<body>
    <section class="hero">
        <div>
            <h1>Bella Vista</h1>
            <p>Authentic Italian Cuisine in the Heart of the City</p>
            <a href="#menu" class="btn">View Menu</a>
        </div>
    </section>
    <section class="section">
        <div class="container">
            <h2>Our Story</h2>
            <p>For over 30 years, Bella Vista has been serving authentic Italian cuisine made with the finest ingredients imported directly from Italy.</p>
        </div>
    </section>
</body>
</html>`
    }
  ]);

  const previewRef = useRef<HTMLIFrameElement>(null);

  // Initialize component
  useEffect(() => {
    setMounted(true);
    
    // Check authentication
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        fetchCredits(user.id);
      } else {
        setIsLoadingCredits(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchCredits(session.user.id);
        } else {
          setCredits(0);
          setIsLoadingCredits(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchCredits = async (userId: string) => {
    try {
      setIsLoadingCredits(true);
      const response = await fetch("/api/credits", {
        headers: {
          "user-id": userId,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits || 0);
      }
    } catch (error) {
      console.error("Failed to fetch credits:", error);
    } finally {
      setIsLoadingCredits(false);
    }
  };

  const handleGenerate = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (credits <= 0) {
      setShowPricing(true);
      return;
    }

    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": user.id,
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          language,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setGeneratedCode(data.code);
        setShowPreview(true);
        setCredits(prev => Math.max(0, prev - 1));
      } else {
        throw new Error(data.message || "Failed to generate code");
      }
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!generatedCode) return;

    try {
      const blob = new Blob([generatedCode], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${prompt.slice(0, 30).replace(/[^a-z0-9]/gi, "_")}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export file. Please try again.");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const openCommunityTemplate = useCallback((template: CommunityTemplate) => {
    setSelectedCommunityTemplate(template);
    setShowCommunityModal(true);
  }, []);

  const CommunityTemplateModal = useCallback(() => {
    if (!showCommunityModal || !selectedCommunityTemplate) return null;

    const handleCloseModal = useCallback(() => {
      setShowCommunityModal(false);
      setSelectedCommunityTemplate(null);
    }, []);

    const handleUseTemplate = useCallback(() => {
      if (selectedCommunityTemplate) {
        setGeneratedCode(selectedCommunityTemplate.code);
        setShowPreview(true);
        handleCloseModal();
      }
    }, [selectedCommunityTemplate, handleCloseModal]);

    const handleDownloadTemplate = useCallback(() => {
      if (selectedCommunityTemplate) {
        const blob = new Blob([selectedCommunityTemplate.code], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedCommunityTemplate.title.replace(/[^a-z0-9]/gi, "_")}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }, [selectedCommunityTemplate]);

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
        }}
        onClick={handleCloseModal}
      >
        <div
          style={{
            backgroundColor: "#1a1a1a",
            borderRadius: "12px",
            padding: "0",
            maxWidth: "900px",
            width: "100%",
            maxHeight: "90vh",
            overflow: "hidden",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              padding: "24px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div style={{ flex: 1 }}>
              <h2
                style={{
                  color: "white",
                  fontSize: "24px",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                {selectedCommunityTemplate.title}
              </h2>
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: "14px",
                  marginBottom: "12px",
                }}
              >
                by {selectedCommunityTemplate.author} • {selectedCommunityTemplate.downloads.toLocaleString()} downloads
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {selectedCommunityTemplate.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      backgroundColor: "rgba(59, 130, 246, 0.2)",
                      color: "#60a5fa",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={handleCloseModal}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "24px",
                cursor: "pointer",
                padding: "4px",
                marginLeft: "16px",
              }}
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div
            style={{
              padding: "24px",
              overflowY: "auto",
              maxHeight: "calc(90vh - 200px)",
            }}
          >
            <p
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                lineHeight: "1.6",
                marginBottom: "24px",
              }}
            >
              {selectedCommunityTemplate.description}
            </p>

            {/* Preview */}
            <div
              style={{
                backgroundColor: "#0a0a0a",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "24px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <h4
                style={{
                  color: "white",
                  fontSize: "16px",
                  marginBottom: "12px",
                }}
              >
                Code Preview
              </h4>
              <div
                style={{
                  backgroundColor: "#000",
                  padding: "12px",
                  borderRadius: "6px",
                  overflow: "auto",
                  maxHeight: "200px",
                }}
              >
                <pre
                  style={{
                    color: "#e5e7eb",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    margin: 0,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selectedCommunityTemplate.code.slice(0, 500)}...
                </pre>
              </div>
            </div>

            {/* Template Info */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div>
                <div
                  style={{
                    color: "rgba(255, 255, 255, 0.6)",
                    fontSize: "12px",
                    marginBottom: "4px",
                  }}
                >
                  Category
                </div>
                <div style={{ color: "white", fontSize: "14px" }}>
                  {selectedCommunityTemplate.category}
                </div>
              </div>
              <div>
                <div
                  style={{
                    color: "rgba(255, 255, 255, 0.6)",
                    fontSize: "12px",
                    marginBottom: "4px",
                  }}
                >
                  Difficulty
                </div>
                <div style={{ color: "white", fontSize: "14px" }}>
                  {selectedCommunityTemplate.difficulty}
                </div>
              </div>
              <div>
                <div
                  style={{
                    color: "rgba(255, 255, 255, 0.6)",
                    fontSize: "12px",
                    marginBottom: "4px",
                  }}
                >
                  Rating
                </div>
                <div style={{ color: "white", fontSize: "14px" }}>
                  ⭐ {selectedCommunityTemplate.rating}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "24px",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={handleDownloadTemplate}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.2s",
              }}
            >
              Download
            </button>
            <button
              onClick={handleUseTemplate}
              style={{
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.2s",
              }}
            >
              Use Template
            </button>
          </div>
        </div>
      </div>
    );
  }, [showCommunityModal, selectedCommunityTemplate]);

  // Pricing Modal Component
  const PricingModal = () => (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={() => setShowPricing(false)}
    >
      <div
        style={{
          backgroundColor: "#1a1a1a",
          borderRadius: "12px",
          padding: "32px",
          maxWidth: "500px",
          width: "100%",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2
            style={{
              color: "white",
              fontSize: "28px",
              fontWeight: "600",
              marginBottom: "8px",
            }}
          >
            Get More Credits
          </h2>
          <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "16px" }}>
            Choose a plan that works for you
          </p>
        </div>

        <div style={{ marginBottom: "32px" }}>
          <div
            style={{
              backgroundColor: "#0a0a0a",
              borderRadius: "8px",
              padding: "24px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              marginBottom: "16px",
            }}
          >
            <h3
              style={{
                color: "white",
                fontSize: "20px",
                marginBottom: "8px",
              }}
            >
              Starter Pack
            </h3>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "14px",
                marginBottom: "16px",
              }}
            >
              Perfect for trying out our AI generator
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                marginBottom: "16px",
              }}
            >
              <span
                style={{
                  color: "white",
                  fontSize: "32px",
                  fontWeight: "600",
                }}
              >
                $5
              </span>
              <span
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: "16px",
                  marginLeft: "8px",
                }}
              >
                for 50 credits
              </span>
            </div>
            <button
              style={{
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                width: "100%",
              }}
            >
              Buy Now
            </button>
          </div>

          <div
            style={{
              backgroundColor: "#0a0a0a",
              borderRadius: "8px",
              padding: "24px",
              border: "2px solid #3b82f6",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-10px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "4px 12px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              BEST VALUE
            </div>
            <h3
              style={{
                color: "white",
                fontSize: "20px",
                marginBottom: "8px",
              }}
            >
              Pro Pack
            </h3>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "14px",
                marginBottom: "16px",
              }}
            >
              Great for regular users and small projects
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                marginBottom: "16px",
              }}
            >
              <span
                style={{
                  color: "white",
                  fontSize: "32px",
                  fontWeight: "600",
                }}
              >
                $15
              </span>
              <span
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: "16px",
                  marginLeft: "8px",
                }}
              >
                for 200 credits
              </span>
            </div>
            <button
              style={{
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                width: "100%",
              }}
            >
              Buy Now
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowPricing(false)}
          style={{
            background: "none",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "rgba(255, 255, 255, 0.7)",
            padding: "12px 24px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            width: "100%",
          }}
        >
          Maybe Later
        </button>
      </div>
    </div>
  );

  const renderInputSection = () => (
    <div
      style={{
        backgroundColor: "#0a0a0a",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "24px",
        marginBottom: "24px",
      }}
    >
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe what you want to build... (e.g., 'A modern portfolio website with dark theme and animations')"
        style={{
          width: "100%",
          minHeight: "120px",
          backgroundColor: "#000",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "8px",
          color: "white",
          padding: "16px",
          fontSize: "16px",
          lineHeight: "1.5",
          resize: "vertical",
          fontFamily: "inherit",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "16px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <label
            style={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "14px",
            }}
          >
            Language:
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            style={{
              backgroundColor: "#1a1a1a",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "6px",
              color: "white",
              padding: "8px 12px",
              fontSize: "14px",
            }}
          >
            <option value="English">English</option>
            <option value="French">French</option>
            <option value="Swahili">Swahili</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          style={{
            backgroundColor: isLoading || !prompt.trim() ? "#374151" : "#3b82f6",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "500",
            cursor: isLoading || !prompt.trim() ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {isLoading ? "Generating..." : "Generate"}
          {!isLoading && <span>⚡</span>}
        </button>
      </div>
    </div>
  );

  const renderPreview = () => {
    if (!showPreview || !generatedCode) return null;

    return (
      <div
        style={{
          backgroundColor: "#0a0a0a",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          overflow: "hidden",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <h3 style={{ color: "white", fontSize: "18px", fontWeight: "500" }}>
            Preview
          </h3>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={handleExport}
              style={{
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>📁</span>
              Export
            </button>
            <button
              onClick={() => setShowPreview(false)}
              style={{
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
        <div style={{ height: "500px" }}>
          <iframe
            ref={previewRef}
            srcDoc={generatedCode}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              backgroundColor: "white",
            }}
            title="Generated Website Preview"
          />
        </div>
      </div>
    );
  };

  const renderCommunityTemplates = () => (
    <div
      style={{
        backgroundColor: "#0a0a0a",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "24px",
        marginBottom: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ color: "white", fontSize: "20px", fontWeight: "500" }}>
          From the Community
        </h3>
        <span
          style={{
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: "14px",
          }}
        >
          {communityTemplates.length} templates
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "16px",
        }}
      >
        {communityTemplates.map((template) => (
          <div
            key={template.id}
            onClick={() => openCommunityTemplate(template)}
            style={{
              backgroundColor: "#1a1a1a",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "16px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.5)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                width: "100%",
                height: "150px",
                backgroundColor: "#000",
                borderRadius: "6px",
                marginBottom: "12px",
                backgroundImage: `url(${template.preview})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <h4
              style={{
                color: "white",
                fontSize: "16px",
                fontWeight: "500",
                marginBottom: "6px",
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {template.title}
            </h4>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "14px",
                lineHeight: "1.4",
                marginBottom: "12px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {template.description}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "12px",
              }}
            >
              <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                by {template.author}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                  ⭐ {template.rating}
                </span>
                <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                  📁 {template.downloads.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUserSection = () => {
    if (!user) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1
              style={{
                color: "white",
                fontSize: "32px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Welcome to Adorrable.dev
            </h1>
            <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "16px" }}>
              Generate beautiful websites with AI
            </p>
          </div>
          <button
            onClick={() => setShowAuthModal(true)}
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
        </div>
      );
    }

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1
            style={{
              color: "white",
              fontSize: "32px",
              fontWeight: "600",
              marginBottom: "8px",
            }}
          >
            Welcome back!
          </h1>
          <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "16px" }}>
            Ready to create something amazing?
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              backgroundColor: "#0a0a0a",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ color: "#10b981", fontSize: "16px" }}>⚡</span>
            <span style={{ color: "white", fontSize: "16px", fontWeight: "500" }}>
              {isLoadingCredits ? "..." : credits} credits
            </span>
            <button
              onClick={() => setShowPricing(true)}
              style={{
                background: "none",
                border: "none",
                color: "#3b82f6",
                fontSize: "14px",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Get more
            </button>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              backgroundColor: "#1a1a1a",
              color: "rgba(255, 255, 255, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              padding: "12px 16px",
              borderRadius: "8px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  };

  const renderChatView = () => (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        color: "white",
        padding: "24px",
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {renderUserSection()}
        {renderInputSection()}
        {renderPreview()}
        {renderCommunityTemplates()}
      </div>

      {/* Inspirational Widget */}
      <InspirationalWidget />

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      )}
      {showPricing && <PricingModal />}
      <CommunityTemplateModal />

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

  if (!mounted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "white", fontSize: "18px" }}>Loading...</div>
      </div>
    );
  }

  return (
    <>
      {renderChatView()}
      <CrispChat />
    </>
  );
}
