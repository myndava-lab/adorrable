"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@supabase/supabase-js";

const CrispChat = dynamic(() => import("../components/CrispChat"), {
  ssr: false,
});

type Language = "English" | "French" | "Swahili" | "Pidgin";

interface CommunityTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  downloads: number;
  rating: number;
  tags: string[];
  difficulty: string;
  createdAt: string;
  preview: string;
  code: string;
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("English");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [credits, setCredits] = useState<number>(4);
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CommunityTemplate | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  const languages: Language[] = ["English", "French", "Swahili", "Pidgin"];

  // Community templates data
  const communityTemplates: CommunityTemplate[] = [
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
        .card:hover { transform: translateY(-10px); }
    </style>
</head>
<body>
    <div class="hero">
        <h1>John Doe</h1>
        <p>Full Stack Developer & Designer</p>
    </div>
    <div class="container">
        <div class="grid">
            <div class="card">
                <h3>Web Development</h3>
                <p>Creating modern, responsive websites with the latest technologies.</p>
            </div>
            <div class="card">
                <h3>UI/UX Design</h3>
                <p>Designing beautiful and intuitive user experiences.</p>
            </div>
            <div class="card">
                <h3>Mobile Apps</h3>
                <p>Building cross-platform mobile applications.</p>
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
      tags: ["E-commerce", "Shopping", "Payment", "Product"],
      difficulty: "Advanced",
      createdAt: "2024-01-10",
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
                <p class="product-description">Experience crystal-clear audio with our premium wireless headphones. Featuring active noise cancellation, 30-hour battery life, and premium materials.</p>
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
      downloads: 3150,
      rating: 4.8,
      tags: ["Restaurant", "Menu", "Reservation", "Food"],
      difficulty: "Beginner",
      createdAt: "2024-01-05",
      preview: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop",
      code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restaurant</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Georgia', serif; line-height: 1.6; }
        .hero { background: url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop') center/cover; height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; color: white; }
        .hero-content { background: rgba(0,0,0,0.6); padding: 50px; border-radius: 15px; }
        .hero h1 { font-size: 4rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.3rem; margin-bottom: 2rem; }
        .btn { background: #d4af37; color: white; padding: 15px 30px; border: none; border-radius: 8px; font-size: 1.1rem; cursor: pointer; transition: background 0.3s; text-decoration: none; display: inline-block; }
        .btn:hover { background: #b8941f; }
        .section { padding: 80px 20px; max-width: 1200px; margin: 0 auto; }
        .menu-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin-top: 50px; }
        .menu-item { background: #f8f8f8; padding: 30px; border-radius: 10px; text-align: center; }
    </style>
</head>
<body>
    <div class="hero">
        <div class="hero-content">
            <h1>Bella Vista</h1>
            <p>Authentic Italian Cuisine in the Heart of the City</p>
            <a href="#reservation" class="btn">Make Reservation</a>
        </div>
    </div>
    <div class="section">
        <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 20px;">Our Specialties</h2>
        <div class="menu-grid">
            <div class="menu-item">
                <h3>Pasta Carbonara</h3>
                <p>Traditional Roman pasta with eggs, cheese, and pancetta</p>
                <strong>$18</strong>
            </div>
            <div class="menu-item">
                <h3>Margherita Pizza</h3>
                <p>Fresh tomatoes, mozzarella, and basil on thin crust</p>
                <strong>$16</strong>
            </div>
            <div class="menu-item">
                <h3>Tiramisu</h3>
                <p>Classic Italian dessert with coffee and mascarpone</p>
                <strong>$8</strong>
            </div>
        </div>
    </div>
</body>
</html>`
    }
  ];

  // Load user session and credits
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Load credits
  useEffect(() => {
    const loadCredits = async () => {
      setIsLoadingCredits(true);
      try {
        const response = await fetch('/api/credits');
        if (response.ok) {
          const data = await response.json();
          setCredits(data.credits || 4);
        }
      } catch (error) {
        console.error('Error loading credits:', error);
      } finally {
        setIsLoadingCredits(false);
      }
    };

    loadCredits();
  }, []);

  // Handle clicks outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false);
        setSelectedTemplate(null);
      }
    };

    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setShowCode(false);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, language: selectedLanguage }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedCode(data.code);
        setShowCode(true);
      } else {
        console.error("Generation failed");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTemplateClick = useCallback((template: CommunityTemplate) => {
    setSelectedTemplate(template);
    setShowModal(true);
  }, []);

  const handleUseTemplate = useCallback(async () => {
    if (!selectedTemplate) return;

    setIsGeneratingTemplate(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setGeneratedCode(selectedTemplate.code);
      setShowCode(true);
      setShowModal(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error using template:', error);
    } finally {
      setIsGeneratingTemplate(false);
    }
  }, [selectedTemplate]);

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'adorrable-generated-website.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openInNewTab = () => {
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#0B1020",
      backgroundImage: `
        linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px),
        radial-gradient(600px 300px at 50% 0%, rgba(79,195,247,0.12), transparent 60%)
      `,
      backgroundSize: "40px 40px, 40px 40px, 100% 100%",
      fontFamily: "Inter, ui-sans-serif, system-ui"
    }}>
      {/* Navigation */}
      <nav style={{ 
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 24px",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        <div style={{ 
          color: "#22D3EE",
          fontSize: "20px",
          fontWeight: "600"
        }}>
          Adorrable
        </div>
        <div style={{ 
          display: "flex",
          gap: "24px",
          color: "#94A3B8"
        }}>
          <a href="#features" style={{ 
            color: "inherit",
            textDecoration: "none",
            transition: "color 0.2s"
          }}
          onMouseEnter={(e) => e.target.style.color = "#E5E7EB"}
          onMouseLeave={(e) => e.target.style.color = "#94A3B8"}
          >
            Features
          </a>
          <a href="#templates" style={{ 
            color: "inherit",
            textDecoration: "none",
            transition: "color 0.2s"
          }}
          onMouseEnter={(e) => e.target.style.color = "#E5E7EB"}
          onMouseLeave={(e) => e.target.style.color = "#94A3B8"}
          >
            Templates
          </a>
        </div>
      </nav>

      <main
        style={{
          minHeight: "100vh",
          background: "#0B1020",
          backgroundImage: "linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          color: "#E5E7EB",
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(79, 195, 247, 0.15), transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Hero Section */}
          <div style={{ 
            position: "relative",
            overflow: "hidden",
            borderRadius: "32px",
            padding: "48px 24px",
            marginBottom: "32px"
          }}>
            <div style={{ 
              position: "absolute",
              inset: "0",
              backgroundImage: `
                linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
              opacity: "0.6",
              pointerEvents: "none"
            }} />

            <h1
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                fontWeight: "800",
                lineHeight: "1.1",
                marginBottom: "24px",
                background: "linear-gradient(135deg, #4FC3F7 0%, #7C4DFF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-0.025em",
              }}
            >
              Build something with Adorrable
            </h1>

            <p
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                color: "#94A3B8",
                lineHeight: "1.6",
                marginBottom: "40px",
                maxWidth: "600px",
                margin: "0 auto 40px",
              }}
            >
              Create apps and culturally intelligent websites by chatting with AI
            </p>

            {/* Input Section */}
            <div style={{ 
              borderRadius: "32px",
              border: "1px solid rgba(148,163,184,0.12)",
              background: "rgba(14,21,38,0.7)",
              backdropFilter: "blur(8px)",
              padding: "12px"
            }}>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask Adorrable to create a business website…"
                style={{ 
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#E5E7EB",
                  fontSize: "16px",
                  padding: "8px"
                }}
                onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
              />

              <div style={{ 
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "12px"
              }}>
                {languages.map((lang, index) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    style={{ 
                      background: selectedLanguage === lang
                        ? "#22C55E"
                        : "transparent",
                      color: selectedLanguage === lang ? "white" : "#94A3B8",
                      border: selectedLanguage === lang ? "none" : "1px solid rgba(148, 163, 184, 0.3)",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      fontWeight: selectedLanguage === lang ? "500" : "400",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedLanguage !== lang) {
                        e.target.style.color = "#E5E7EB";
                        e.target.style.background = "rgba(255,255,255,0.05)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedLanguage !== lang) {
                        e.target.style.color = "#94A3B8";
                        e.target.style.background = "transparent";
                      }
                    }}
                  >
                    {lang}
                  </button>
                ))}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  style={{ 
                    marginLeft: "auto",
                    padding: "6px 16px",
                    borderRadius: "9999px",
                    background: "#22C55E",
                    color: "white",
                    border: "none",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    if (!isGenerating && prompt.trim()) {
                      e.target.style.background = "#16A34A";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isGenerating && prompt.trim()) {
                      e.target.style.background = "#22C55E";
                    }
                  }}
                >
                  {isGenerating ? "Generating..." : "Send"}
                </button>
              </div>
            </div>
          </div>

          {/* Credits Bar */}
          <div style={{ 
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "14px",
            marginBottom: "32px"
          }}>
            <div
              style={{
                background: "rgba(34, 197, 94, 0.1)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                borderRadius: "12px",
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ 
                color: "#94A3B8"
              }}>
                {isLoadingCredits ? "..." : credits} credits remaining
              </span>
              <button
                onClick={() => setShowPricing(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#22C55E",
                  fontSize: "12px",
                  cursor: "pointer",
                  textDecoration: "underline",
                  transition: "all 0.2s ease",
                  padding: "2px 4px",
                  borderRadius: "4px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#16A34A";
                  e.target.style.background = "rgba(34, 197, 94, 0.1)";
                  e.target.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#22C55E";
                  e.target.style.background = "none";
                  e.target.style.transform = "scale(1)";
                }}
              >
                Buy More
              </button>
            </div>
          </div>

          {/* Generated Code Section */}
          {showCode && generatedCode && (
            <div style={{ 
              background: "#0E1526",
              border: "1px solid rgba(148,163,184,0.12)",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "32px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.35)"
            }}>
              <div style={{ 
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px"
              }}>
                <h3 style={{ color: "#E5E7EB", fontSize: "18px", fontWeight: "600" }}>
                  Generated Website
                </h3>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={openInNewTab}
                    style={{ 
                      padding: "8px 16px",
                      borderRadius: "8px",
                      background: "#22C55E",
                      color: "white",
                      border: "none",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#16A34A";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "#22C55E";
                    }}
                  >
                    Preview
                  </button>
                  <button
                    onClick={downloadCode}
                    style={{ 
                      padding: "8px 16px",
                      borderRadius: "8px",
                      background: "transparent",
                      color: "#94A3B8",
                      border: "1px solid rgba(148,163,184,0.12)",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = "#E5E7EB";
                      e.target.style.borderColor = "rgba(148,163,184,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = "#94A3B8";
                      e.target.style.borderColor = "rgba(148,163,184,0.12)";
                    }}
                  >
                    Download
                  </button>
                </div>
              </div>
              <pre style={{ 
                background: "#0B1020",
                color: "#E5E7EB",
                padding: "16px",
                borderRadius: "8px",
                fontSize: "14px",
                overflow: "auto",
                maxHeight: "400px",
                border: "1px solid rgba(148,163,184,0.12)"
              }}>
                {generatedCode}
              </pre>
            </div>
          )}

          {/* Community Templates Section */}
          <div id="templates" style={{ marginBottom: "48px" }}>
            <div style={{ 
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px"
            }}>
              <h2 style={{ 
                color: "#E5E7EB",
                fontSize: "24px",
                fontWeight: "600"
              }}>
                From the Community
              </h2>
              <span style={{ 
                color: "#94A3B8",
                fontSize: "14px"
              }}>
                {communityTemplates.length} templates
              </span>
            </div>

            <div style={{ 
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "24px"
            }}>
              {communityTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  style={{ 
                    background: template.id === "3" ? "#F59E0B" : template.id === "2" ? "#10B981" : "#0E1526",
                    border: "1px solid rgba(30, 41, 59, 0.2)",
                    borderRadius: "24px",
                    padding: "32px",
                    marginBottom: "40px",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 10px 30px rgba(0,0,0,.35)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    color: template.id === "3" || template.id === "2" ? "white" : "#E5E7EB"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-4px)";
                    e.target.style.boxShadow = "0 20px 40px rgba(0,0,0,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 10px 30px rgba(0,0,0,.35)";
                  }}
                >
                  <div style={{ 
                    fontSize: "12px",
                    background: template.id === "3" || template.id === "2" ? "rgba(255,255,255,0.2)" : "rgba(148,163,184,0.2)",
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    display: "inline-block",
                    marginBottom: "12px"
                  }}>
                    {template.id === "3" ? "Featured" : template.id === "2" ? "Popular" : "Community"}
                  </div>
                  <h3 style={{ 
                    fontSize: "20px",
                    fontWeight: "600",
                    marginBottom: "8px"
                  }}>
                    {template.title}
                  </h3>
                  <p style={{ 
                    fontSize: "14px",
                    opacity: 0.9,
                    marginBottom: "16px"
                  }}>
                    {template.description}
                  </p>
                  <div style={{ 
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "12px",
                    opacity: 0.8
                  }}>
                    <span>by {template.author}</span>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <span>⭐ {template.rating}</span>
                      <span>↓ {template.downloads.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Community Template Modal */}
      {showModal && selectedTemplate && (
        <div style={{ 
          position: "fixed",
          inset: "0",
          background: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: "1000",
          padding: "20px"
        }}>
          <div
            ref={modalRef}
            style={{ 
              background: "#0E1526",
              border: "1px solid rgba(148,163,184,0.12)",
              borderRadius: "20px",
              padding: "32px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
            }}
          >
            <div style={{ 
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "24px"
            }}>
              <div>
                <h2 style={{ 
                  color: "#E5E7EB",
                  fontSize: "24px",
                  fontWeight: "600",
                  marginBottom: "8px"
                }}>
                  {selectedTemplate.title}
                </h2>
                <p style={{ 
                  color: "#94A3B8",
                  fontSize: "16px",
                  marginBottom: "16px"
                }}>
                  {selectedTemplate.description}
                </p>
                <div style={{ 
                  display: "flex",
                  gap: "16px",
                  fontSize: "14px",
                  color: "#94A3B8"
                }}>
                  <span>by {selectedTemplate.author}</span>
                  <span>⭐ {selectedTemplate.rating}</span>
                  <span>↓ {selectedTemplate.downloads.toLocaleString()}</span>
                  <span>📅 {new Date(selectedTemplate.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedTemplate(null);
                }}
                style={{ 
                  background: "none",
                  border: "none",
                  color: "#94A3B8",
                  fontSize: "24px",
                  cursor: "pointer",
                  padding: "0",
                  lineHeight: "1"
                }}
              >
                ×
              </button>
            </div>

            <div style={{ 
              background: "#0B1020",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px",
              border: "1px solid rgba(148,163,184,0.12)"
            }}>
              <h3 style={{ 
                color: "#E5E7EB",
                fontSize: "16px",
                marginBottom: "12px"
              }}>
                Preview Code
              </h3>
              <pre style={{ 
                color: "#94A3B8",
                fontSize: "12px",
                maxHeight: "200px",
                overflow: "auto",
                lineHeight: "1.4"
              }}>
                {selectedTemplate.code.substring(0, 500)}...
              </pre>
            </div>

            <div style={{ 
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end"
            }}>
              <button
                onClick={() => {
                  const blob = new Blob([selectedTemplate.code], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${selectedTemplate.title.toLowerCase().replace(/\\s+/g, '-')}.html`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                style={{ 
                  background: "transparent",
                  color: "#94A3B8",
                  border: "1px solid rgba(148,163,184,0.12)",
                  padding: "12px 24px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "14px",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#E5E7EB";
                  e.target.style.borderColor = "rgba(148,163,184,0.3)";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#94A3B8";
                  e.target.style.borderColor = "rgba(148,163,184,0.12)";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                Open Project
              </button>
              <button
                onClick={handleUseTemplate}
                disabled={isGeneratingTemplate}
                style={{ 
                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "10px",
                  cursor: isGeneratingTemplate ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  transition: "all 0.2s ease",
                  opacity: isGeneratingTemplate ? 0.7 : 1,
                  boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)"
                }}
                onMouseEnter={(e) => {
                  if (!isGeneratingTemplate) {
                    e.target.style.background = "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)";
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isGeneratingTemplate) {
                    e.target.style.background = "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.3)";
                  }
                }}
              >
                {isGeneratingTemplate ? "Processing..." : "Remix"}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Pricing Modal */}
      {showPricing && (
        <div style={{ 
          position: "fixed",
          inset: "0",
          background: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: "1000",
          padding: "20px"
        }}>
          <div style={{ 
            background: "#0E1526",
            border: "1px solid rgba(148,163,184,0.12)",
            borderRadius: "20px",
            padding: "32px",
            maxWidth: "500px",
            width: "100%",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
          }}>
            <div style={{ 
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px"
            }}>
              <h2 style={{ 
                color: "#E5E7EB",
                fontSize: "24px",
                fontWeight: "600"
              }}>
                Get More Credits
              </h2>
              <button
                onClick={() => setShowPricing(false)}
                style={{ 
                  background: "none",
                  border: "none",
                  color: "#94A3B8",
                  fontSize: "24px",
                  cursor: "pointer"
                }}
              >
                ×
              </button>
            </div>

            <div style={{ 
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid rgba(148,163,184,0.2)",
              marginBottom: "16px"
            }}>
              <h3 style={{ 
                color: "white",
                fontSize: "20px",
                marginBottom: "8px"
              }}>
                Starter Pack
              </h3>
              <p style={{ 
                color: "rgba(148, 163, 184, 0.8)",
                fontSize: "14px",
                marginBottom: "16px"
              }}>
                Perfect for trying out our AI generator
              </p>
              <div style={{ 
                display: "flex",
                alignItems: "baseline",
                marginBottom: "16px"
              }}>
                <span style={{ 
                  color: "white",
                  fontSize: "32px",
                  fontWeight: "600"
                }}>
                  $5
                </span>
                <span style={{ 
                  color: "rgba(148, 163, 184, 0.8)",
                  fontSize: "16px",
                  marginLeft: "8px"
                }}>
                  for 50 credits
                </span>
              </div>
              <button
                onClick={() => {
                  window.location.href = '/payments/local';
                }}
                style={{ 
                  width: "100%",
                  background: "#22C55E",
                  color: "white",
                  border: "none",
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#16A34A";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#22C55E";
                }}
              >
                Purchase Credits
              </button>
            </div>
          </div>
        </div>
      )}

      <CrispChat />
    </div>
  );
}