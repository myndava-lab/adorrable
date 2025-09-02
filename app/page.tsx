"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,119,198,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(120,119,198,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="text-white text-xl font-semibold tracking-tight">Adorrable</span>
        </div>

        <div className="hidden md:flex items-center space-x-8 text-gray-300">
          <a href="#features" className="hover:text-white transition-colors duration-200 font-medium">Features</a>
          <a href="#templates" className="hover:text-white transition-colors duration-200 font-medium">Templates</a>
          <a href="#pricing" className="hover:text-white transition-colors duration-200 font-medium">Pricing</a>
          <a href="#docs" className="hover:text-white transition-colors duration-200 font-medium">Docs</a>
        </div>

        <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 pt-16 pb-24 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-300 bg-clip-text text-transparent leading-tight mb-8">
            Build something with
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Adorrable
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12">
            Create apps and culturally intelligent websites by chatting with AI
          </p>

          {/* Main Input Section */}
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl">
              {/* Top Input Bar */}
              <div className="flex items-center mb-6">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask Adorrable to create a business website..."
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-2xl px-6 py-4 text-white placeholder-gray-400 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                    onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
                  />
                </div>
              </div>

              {/* Language Selection and Generate Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400 text-sm font-medium">Language:</span>
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        selectedLanguage === lang
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                          : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50 hover:text-white'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Credits Info */}
          <div className="mt-8 flex justify-center">
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl px-6 py-3 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-300 text-sm">
                  {isLoadingCredits ? "Loading..." : `${credits} credits remaining`}
                </span>
              </div>
              <button
                onClick={() => setShowPricing(true)}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200 underline underline-offset-2"
              >
                Buy More
              </button>
            </div>
          </div>
        </div>

        {/* Generated Code Section */}
        {showCode && generatedCode && (
          <div className="max-w-6xl mx-auto mt-16">
            <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-white flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Generated Website</span>
                </h3>
                <div className="flex space-x-3">
                  <button
                    onClick={openInNewTab}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={downloadCode}
                    className="bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 hover:text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 border border-slate-600/50 hover:border-slate-500/50 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download</span>
                  </button>
                </div>
              </div>
              <pre className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 text-gray-300 text-sm overflow-auto max-h-96 leading-relaxed">
                {generatedCode}
              </pre>
            </div>
          </div>
        )}

        {/* Community Templates Section */}
        <div id="templates" className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">From the Community</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover professionally crafted templates built by our community
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {communityTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleTemplateClick(template)}
                className="group relative bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-2xl hover:border-slate-600/50"
              >
                {/* Template Preview Image */}
                <div className="relative h-48 mb-6 rounded-2xl overflow-hidden">
                  <img
                    src={template.preview}
                    alt={template.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      template.id === "1" ? "bg-blue-500/80 text-white" :
                      template.id === "2" ? "bg-green-500/80 text-white" :
                      "bg-purple-500/80 text-white"
                    }`}>
                      {template.category}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="absolute bottom-4 right-4 flex items-center space-x-3 text-white text-xs">
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{template.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{template.downloads.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Template Info */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors duration-200">
                    {template.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
                    {template.description}
                  </p>

                  {/* Author and Difficulty */}
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>by {template.author}</span>
                    <span className="bg-slate-700/50 px-2 py-1 rounded-lg">{template.difficulty}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Community Template Modal */}
      {showModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl"
          >
            <div className="flex justify-between items-start mb-8">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <h2 className="text-3xl font-bold text-white">{selectedTemplate.title}</h2>
                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                    {selectedTemplate.category}
                  </span>
                </div>
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                  {selectedTemplate.description}
                </p>
                <div className="flex items-center space-x-6 text-sm text-gray-400">
                  <span className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>by {selectedTemplate.author}</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>{selectedTemplate.rating} rating</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>{selectedTemplate.downloads.toLocaleString()} downloads</span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedTemplate(null);
                }}
                className="text-gray-400 hover:text-white transition-colors duration-200 ml-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Code Preview */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 mb-8">
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span>Code Preview</span>
              </h3>
              <pre className="text-gray-300 text-sm overflow-auto max-h-64 leading-relaxed">
                {selectedTemplate.code.substring(0, 800)}...
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  const blob = new Blob([selectedTemplate.code], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${selectedTemplate.title.toLowerCase().replace(/\s+/g, '-')}.html`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 hover:text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 border border-slate-600/50 hover:border-slate-500/50 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download</span>
              </button>
              <button
                onClick={handleUseTemplate}
                disabled={isGeneratingTemplate}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isGeneratingTemplate ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Use Template</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      {showPricing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">Get More Credits</h2>
              <button
                onClick={() => setShowPricing(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Starter Pack</h3>
                <p className="text-gray-400 text-sm mb-6">Perfect for trying out our AI generator</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">$5</span>
                  <span className="text-gray-400 ml-2">for 50 credits</span>
                </div>

                <button
                  onClick={() => {
                    window.location.href = '/payments/local';
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Purchase Credits
                </button>
              </div>
            </div>

            <div className="text-center text-xs text-gray-500">
              <p>Secure payment • Instant delivery • No subscription</p>
            </div>
          </div>
        </div>
      )}

      <CrispChat />
    </div>
  );
}