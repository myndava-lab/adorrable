"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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

type Language = "English" | "French" | "Swahili" | "Pidgin";

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

  // Static community templates - memoized to prevent recreation
  const communityTemplates = useMemo<CommunityTemplate[]>(() => [
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
  ], []);

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

  const handleCloseCommunityModal = useCallback(() => {
    setShowCommunityModal(false);
    setSelectedCommunityTemplate(null);
  }, []);

  const handleUseTemplate = useCallback(() => {
    if (selectedCommunityTemplate) {
      setGeneratedCode(selectedCommunityTemplate.code);
      setShowPreview(true);
      handleCloseCommunityModal();
    }
  }, [selectedCommunityTemplate, handleCloseCommunityModal]);

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

  // Community Template Modal - Memoized to prevent re-renders
  const CommunityTemplateModal = useMemo(() => {
    if (!showCommunityModal || !selectedCommunityTemplate) return null;

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
        onClick={handleCloseCommunityModal}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            borderRadius: "20px",
            padding: "0",
            maxWidth: "900px",
            width: "100%",
            maxHeight: "90vh",
            overflow: "hidden",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              padding: "24px",
              borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)",
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
                  color: "rgba(148, 163, 184, 0.8)",
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
                      background: "linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)",
                      color: "#60a5fa",
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={handleCloseCommunityModal}
              style={{
                background: "none",
                border: "none",
                color: "rgba(148, 163, 184, 0.6)",
                fontSize: "24px",
                cursor: "pointer",
                padding: "4px",
                marginLeft: "16px",
                borderRadius: "6px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.color = "white";
                e.target.style.background = "rgba(239, 68, 68, 0.2)";
                e.target.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "rgba(148, 163, 184, 0.6)";
                e.target.style.background = "none";
                e.target.style.transform = "scale(1)";
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
                color: "rgba(148, 163, 184, 0.9)",
                lineHeight: "1.6",
                marginBottom: "24px",
              }}
            >
              {selectedCommunityTemplate.description}
            </p>

            {/* Preview */}
            <div
              style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "24px",
                border: "1px solid rgba(148, 163, 184, 0.2)",
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
                  borderRadius: "8px",
                  overflow: "auto",
                  maxHeight: "200px",
                  border: "1px solid rgba(148, 163, 184, 0.1)",
                }}
              >
                <pre
                  style={{
                    color: "#e2e8f0",
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
                    color: "rgba(148, 163, 184, 0.6)",
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
                    color: "rgba(148, 163, 184, 0.6)",
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
                    color: "rgba(148, 163, 184, 0.6)",
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
              borderTop: "1px solid rgba(148, 163, 184, 0.2)",
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)",
            }}
          >
            <button
              onClick={handleDownloadTemplate}
              style={{
                background: "linear-gradient(135deg, rgba(148, 163, 184, 0.2) 0%, rgba(148, 163, 184, 0.1) 100%)",
                color: "white",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                padding: "12px 24px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "linear-gradient(135deg, rgba(148, 163, 184, 0.3) 0%, rgba(148, 163, 184, 0.2) 100%)";
                e.target.style.borderColor = "rgba(148, 163, 184, 0.5)";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "linear-gradient(135deg, rgba(148, 163, 184, 0.2) 0%, rgba(148, 163, 184, 0.1) 100%)";
                e.target.style.borderColor = "rgba(148, 163, 184, 0.3)";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              Open Project
            </button>
            <button
              onClick={handleUseTemplate}
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.3)";
              }}
            >
              Remix
            </button>
          </div>
        </div>
      </div>
    );
  }, [showCommunityModal, selectedCommunityTemplate, handleCloseCommunityModal, handleUseTemplate, handleDownloadTemplate]);

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
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          borderRadius: "20px",
          padding: "32px",
          maxWidth: "500px",
          width: "100%",
          border: "1px solid rgba(148, 163, 184, 0.2)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
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
          <p style={{ color: "rgba(148, 163, 184, 0.8)", fontSize: "16px" }}>
            Choose a plan that works for you
          </p>
        </div>

        <div style={{ marginBottom: "32px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid rgba(148, 163, 184, 0.2)",
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
                color: "rgba(148, 163, 184, 0.8)",
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
                  color: "rgba(148, 163, 184, 0.8)",
                  fontSize: "16px",
                  marginLeft: "8px",
                }}
              >
                for 50 credits
              </span>
            </div>
            <button
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "14px",
                width: "100%",
                transition: "all 0.2s",
                boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.4)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.3)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Buy Now
            </button>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              borderRadius: "12px",
              padding: "24px",
              border: "2px solid #3b82f6",
              position: "relative",
              boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-10px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                color: "white",
                padding: "6px 16px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
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
                color: "rgba(148, 163, 184, 0.8)",
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
                  color: "rgba(148, 163, 184, 0.8)",
                  fontSize: "16px",
                  marginLeft: "8px",
                }}
              >
                for 200 credits
              </span>
            </div>
            <button
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "14px",
                width: "100%",
                transition: "all 0.2s",
                boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.4)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.3)";
                e.currentTarget.style.transform = "translateY(0)";
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
            border: "1px solid rgba(148, 163, 184, 0.3)",
            color: "rgba(148, 163, 184, 0.8)",
            padding: "12px 24px",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "14px",
            width: "100%",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(148, 163, 184, 0.1)";
            e.target.style.color = "white";
            e.target.style.borderColor = "rgba(148, 163, 184, 0.5)";
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "none";
            e.target.style.color = "rgba(148, 163, 184, 0.8)";
            e.target.style.borderColor = "rgba(148, 163, 184, 0.3)";
            e.target.style.transform = "translateY(0)";
          }}
        >
          Maybe Later
        </button>
      </div>
    </div>
  );

  if (!mounted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: "18px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(59, 130, 246, 0.3)",
              borderTop: "3px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          Loading Adorrable...
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fade-in-up {
            animation: fadeInUp 0.6s ease-out;
          }
        `}
      </style>

      <main
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          color: "white",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* Header */}
        <header
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
            background: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(10px)",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "32px",
              }}
            >
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  background: "linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Adorrable
              </h1>
              <nav style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                <a
                  href="#features"
                  style={{
                    color: "rgba(148, 163, 184, 0.8)",
                    textDecoration: "none",
                    fontSize: "14px",
                    transition: "all 0.2s ease",
                    padding: "8px 12px",
                    borderRadius: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = "white";
                    e.target.style.background = "rgba(59, 130, 246, 0.1)";
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "rgba(148, 163, 184, 0.8)";
                    e.target.style.background = "transparent";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  Features
                </a>
                <a
                  href="#templates"
                  style={{
                    color: "rgba(148, 163, 184, 0.8)",
                    textDecoration: "none",
                    fontSize: "14px",
                    transition: "all 0.2s ease",
                    padding: "8px 12px",
                    borderRadius: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = "white";
                    e.target.style.background = "rgba(59, 130, 246, 0.1)";
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "rgba(148, 163, 184, 0.8)";
                    e.target.style.background = "transparent";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  Templates
                </a>
                <button
                  onClick={() => setShowPricing(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(148, 163, 184, 0.8)",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    padding: "4px 8px",
                    borderRadius: "6px",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = "white";
                    e.target.style.background = "rgba(148, 163, 184, 0.1)";
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "rgba(148, 163, 184, 0.8)";
                    e.target.style.background = "none";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  Pricing
                </button>
                <a
                  href="#docs"
                  style={{
                    color: "rgba(148, 163, 184, 0.8)",
                    textDecoration: "none",
                    fontSize: "14px",
                    transition: "all 0.2s ease",
                    padding: "8px 12px",
                    borderRadius: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = "white";
                    e.target.style.background = "rgba(59, 130, 246, 0.1)";
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "rgba(148, 163, 184, 0.8)";
                    e.target.style.background = "transparent";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  Docs
                </a>
              </nav>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {user ? (
                <>
                  <div
                    style={{
                      background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      borderRadius: "12px",
                      padding: "8px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>⚡</span>
                    <span style={{ fontSize: "14px", fontWeight: "500" }}>
                      {isLoadingCredits ? "..." : credits} credits
                    </span>
                    <button
                      onClick={() => setShowPricing(true)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#10b981",
                        fontSize: "12px",
                        cursor: "pointer",
                        textDecoration: "underline",
                        transition: "all 0.2s ease",
                        padding: "2px 4px",
                        borderRadius: "4px",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = "#059669";
                        e.target.style.background = "rgba(16, 185, 129, 0.1)";
                        e.target.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = "#10b981";
                        e.target.style.background = "none";
                        e.target.style.transform = "scale(1)";
                      }}
                    >
                      Get more
                    </button>
                  </div>
                  <button
                    onClick={handleSignOut}
                    style={{
                      background: "rgba(148, 163, 184, 0.1)",
                      color: "rgba(148, 163, 184, 0.8)",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      padding: "8px 16px",
                      borderRadius: "10px",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(148, 163, 184, 0.2)";
                      e.target.style.color = "white";
                      e.target.style.borderColor = "rgba(148, 163, 184, 0.4)";
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "rgba(148, 163, 184, 0.1)";
                      e.target.style.color = "rgba(148, 163, 184, 0.8)";
                      e.target.style.borderColor = "rgba(148, 163, 184, 0.2)";
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "none";
                    }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  style={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)";
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.3)";
                  }}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section
          style={{
            padding: "80px 24px 60px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.3), transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              maxWidth: "800px",
              margin: "0 auto",
              position: "relative",
              zIndex: 1,
            }}
            className="animate-fade-in-up"
          >
            <h1
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                fontWeight: "700",
                lineHeight: "1.1",
                marginBottom: "24px",
                background: "linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Build something with Adorrable
            </h1>
            <p
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                color: "rgba(148, 163, 184, 0.8)",
                lineHeight: "1.6",
                marginBottom: "40px",
                maxWidth: "600px",
                margin: "0 auto 40px",
              }}
            >
              Create apps and culturally intelligent websites by chatting with AI
            </p>

            {/* Main Input Section */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                borderRadius: "24px",
                padding: "32px",
                marginBottom: "40px",
                backdropFilter: "blur(10px)",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
              }}
            >
              <p
                style={{
                  color: "rgba(148, 163, 184, 0.7)",
                  fontSize: "16px",
                  marginBottom: "20px",
                  textAlign: "left",
                }}
              >
                Ask Adorrable to create a business website...
              </p>

              <div
                style={{
                  background: "rgba(15, 23, 42, 0.8)",
                  borderRadius: "16px",
                  padding: "20px",
                  marginBottom: "20px",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                }}
              >
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Design a tech startup homepage with testimonials and pricing..."
                  style={{
                    width: "100%",
                    minHeight: "80px",
                    backgroundColor: "transparent",
                    border: "none",
                    color: "white",
                    fontSize: "16px",
                    lineHeight: "1.5",
                    resize: "none",
                    outline: "none",
                    fontFamily: "inherit",
                    "::placeholder": {
                      color: "rgba(148, 163, 184, 0.5)",
                    },
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>🪄</span>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      backgroundColor: "rgba(15, 23, 42, 0.8)",
                      padding: "8px",
                      borderRadius: "12px",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                    }}
                  >
                    {(["English", "French", "Swahili", "Pidgin"] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        style={{
                          background: language === lang
                            ? "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)"
                            : "transparent",
                          color: language === lang ? "white" : "rgba(148, 163, 184, 0.7)",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "8px",
                          fontSize: "14px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          fontWeight: language === lang ? "500" : "400",
                        }}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !prompt.trim()}
                  style={{
                    background: isLoading || !prompt.trim()
                      ? "rgba(148, 163, 184, 0.3)"
                      : "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontWeight: "500",
                    cursor: isLoading || !prompt.trim() ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: isLoading || !prompt.trim()
                      ? "none"
                      : "0 4px 15px rgba(59, 130, 246, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading && prompt.trim()) {
                      e.target.style.background = "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)";
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading && prompt.trim()) {
                      e.target.style.background = "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)";
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.3)";
                    }
                  }}
                >
                  {isLoading ? "Generating..." : "Generate"}
                  {!isLoading && <span>🚀</span>}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Preview Section */}
        {showPreview && generatedCode && (
          <section
            style={{
              padding: "0 24px 40px",
              maxWidth: "1200px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)",
                borderRadius: "20px",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                overflow: "hidden",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "20px 24px",
                  borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
                  background: "rgba(15, 23, 42, 0.5)",
                }}
              >
                <h3 style={{ fontSize: "18px", fontWeight: "600", color: "white" }}>
                  Preview
                </h3>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={handleExport}
                    style={{
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s ease",
                      boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "linear-gradient(135deg, #059669 0%, #047857 100%)";
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 6px 20px rgba(16, 185, 129, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 4px 15px rgba(16, 185, 129, 0.3)";
                    }}
                  >
                    <span>📁</span>
                    Export
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    style={{
                      background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: "0 4px 15px rgba(239, 68, 68, 0.3)",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)";
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 6px 20px rgba(239, 68, 68, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 4px 15px rgba(239, 68, 68, 0.3)";
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
              <div style={{ height: "600px" }}>
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
          </section>
        )}

        {/* Community Templates Section */}
        <section
          style={{
            padding: "40px 24px 80px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
          id="templates"
        >
          <div
            style={{
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)",
              borderRadius: "20px",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              padding: "32px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "32px",
              }}
            >
              <h3
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "white",
                }}
              >
                From the Community
              </h3>
              <span
                style={{
                  color: "rgba(148, 163, 184, 0.6)",
                  fontSize: "14px",
                }}
              >
                {communityTemplates.length} templates
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "24px",
              }}
            >
              {communityTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => openCommunityTemplate(template)}
                  style={{
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)",
                    borderRadius: "16px",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    padding: "20px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    overflow: "hidden",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.5)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.2)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "180px",
                      backgroundColor: "#000",
                      borderRadius: "12px",
                      marginBottom: "16px",
                      backgroundImage: `url(${template.preview})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      border: "1px solid rgba(148, 163, 184, 0.1)",
                    }}
                  />
                  <h4
                    style={{
                      color: "white",
                      fontSize: "18px",
                      fontWeight: "600",
                      marginBottom: "8px",
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
                      color: "rgba(148, 163, 184, 0.8)",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      marginBottom: "16px",
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
                    <span style={{ color: "rgba(148, 163, 184, 0.6)" }}>
                      by {template.author}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ color: "rgba(148, 163, 184, 0.6)" }}>
                        ⭐ {template.rating}
                      </span>
                      <span style={{ color: "rgba(148, 163, 184, 0.6)" }}>
                        📁 {template.downloads.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Simple Footer */}
        <footer
          style={{
            borderTop: "1px solid rgba(148, 163, 184, 0.1)",
            padding: "40px 24px",
            textAlign: "center",
            background: "rgba(15, 23, 42, 0.5)",
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ marginBottom: "24px" }}>
              <a
                href="#about"
                style={{
                  color: "rgba(148, 163, 184, 0.7)",
                  textDecoration: "none",
                  margin: "0 20px",
                  fontSize: "14px",
                  transition: "all 0.2s ease",
                  padding: "4px 8px",
                  borderRadius: "6px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "white";
                  e.target.style.background = "rgba(59, 130, 246, 0.1)";
                  e.target.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "rgba(148, 163, 184, 0.7)";
                  e.target.style.background = "transparent";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                About
              </a>
              <button
                onClick={() => setShowPricing(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(148, 163, 184, 0.7)",
                  textDecoration: "none",
                  margin: "0 20px",
                  cursor: "pointer",
                  fontSize: "14px",
                  transition: "all 0.2s ease",
                  padding: "4px 8px",
                  borderRadius: "6px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "white";
                  e.target.style.background = "rgba(59, 130, 246, 0.1)";
                  e.target.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "rgba(148, 163, 184, 0.7)";
                  e.target.style.background = "transparent";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                Pricing
              </button>
              <a
                href="#templates"
                style={{
                  color: "rgba(148, 163, 184, 0.7)",
                  textDecoration: "none",
                  margin: "0 20px",
                  fontSize: "14px",
                  transition: "all 0.2s ease",
                  padding: "4px 8px",
                  borderRadius: "6px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "white";
                  e.target.style.background = "rgba(59, 130, 246, 0.1)";
                  e.target.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "rgba(148, 163, 184, 0.7)";
                  e.target.style.background = "transparent";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                Templates
              </a>
              <a
                href="#support"
                style={{
                  color: "rgba(148, 163, 184, 0.7)",
                  textDecoration: "none",
                  margin: "0 20px",
                  fontSize: "14px",
                  transition: "all 0.2s ease",
                  padding: "4px 8px",
                  borderRadius: "6px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "white";
                  e.target.style.background = "rgba(59, 130, 246, 0.1)";
                  e.target.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "rgba(148, 163, 184, 0.7)";
                  e.target.style.background = "transparent";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                Support
              </a>
            </div>
            <div
              style={{
                color: "rgba(148, 163, 184, 0.5)",
                fontSize: "14px",
              }}
            >
              © 2025 Adorrable.dev - Made for everyone with a touch of Africa 🌍
            </div>
          </div>
        </footer>

        {/* Inspirational Widget */}
        <InspirationalWidget />

        {/* Modals */}
        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onSuccess={() => setShowAuthModal(false)}
          />
        )}
        {showPricing && <PricingModal />}
        {CommunityTemplateModal}
      </main>
      <CrispChat />
    </>
  );
}