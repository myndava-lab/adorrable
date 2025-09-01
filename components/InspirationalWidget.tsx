
"use client";
import { useState, useEffect } from "react";

const QUOTES = [
  { text: "The key to success is to focus on goals, not obstacles." },
  { text: "Dream bigger. Do bigger." },
  { text: "Little things make big days." },
  { text: "It's going to be hard, but hard does not mean impossible." },
  { text: "Don't stop when you're tired. Stop when you're done." },
  { text: "Wake up with determination. Go to bed with satisfaction." },
  { text: "Do something today that your future self will thank you for." },
  { text: "The difference between ordinary and extraordinary is that little extra." },
  { text: "Success is what happens after you have survived all your mistakes." },
  { text: "Sometimes we're tested not to show our weaknesses, but to discover our strengths." },
];

export default function InspirationalWidget() {
  const [enabled, setEnabled] = useState(true);
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIndex(Math.floor(Math.random() * QUOTES.length));
    
    // Start appearing animation after component mounts
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
  }, []);

  useEffect(() => {
    if (!enabled || !mounted || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % QUOTES.length);
    }, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [enabled, mounted]);

  const handleHide = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setEnabled(false);
    }, 7000); // 7 seconds disappearing effect
  };

  if (!enabled || !mounted) return null;

  return (
    <>
      <style jsx>{`
        @keyframes slideInFromRight {
          0% {
            transform: translateX(100%) scale(0.8);
            opacity: 0;
          }
          100% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes fadeOutSlideDown {
          0% {
            transform: translateX(0) translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateX(50%) translateY(100px) scale(0.7);
            opacity: 0;
          }
        }
        
        .inspirational-widget {
          animation: ${isVisible && !isAnimatingOut ? 'slideInFromRight 6s cubic-bezier(0.16, 1, 0.3, 1) forwards' : isAnimatingOut ? 'fadeOutSlideDown 7s cubic-bezier(0.55, 0, 0.45, 1) forwards' : ''};
        }
      `}</style>
      
      <div 
        className="inspirational-widget"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "16px",
          background: "linear-gradient(135deg, #10B981, #059669)",
          color: "white",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(16, 185, 129, 0.3)",
          maxWidth: "280px",
          fontSize: "14px",
          zIndex: 1000,
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)",
          transform: !isVisible && !isAnimatingOut ? "translateX(100%) scale(0.8)" : "translateX(0) scale(1)",
          opacity: !isVisible && !isAnimatingOut ? 0 : 1
        }}
      >
        <p style={{ margin: "0 0 12px 0", lineHeight: "1.4" }}>{QUOTES[index].text}</p>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <button 
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.8)",
              fontSize: "12px",
              textDecoration: "underline",
              cursor: "pointer",
              padding: "0"
            }}
            onClick={handleHide}
          >
            Hide
          </button>
          <button 
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.8)",
              fontSize: "12px",
              textDecoration: "underline",
              cursor: "pointer",
              padding: "0"
            }}
            onClick={() => setIndex((prev) => (prev + 1) % QUOTES.length)}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
'use client'

import { useState, useEffect } from 'react'

const inspirationalQuotes = [
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "African Proverb"
  },
  {
    text: "If you want to go fast, go alone. If you want to go far, go together.",
    author: "African Proverb"
  },
  {
    text: "A dream doesn't become reality through magic; it takes sweat, determination and hard work.",
    author: "Colin Powell"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  }
]

interface InspirationalWidgetProps {
  isVisible: boolean
  onClose: () => void
}

export default function InspirationalWidget({ isVisible, onClose }: InspirationalWidgetProps) {
  const [currentQuote, setCurrentQuote] = useState(0)
  const [fadeClass, setFadeClass] = useState('opacity-100')

  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setFadeClass('opacity-0')
      setTimeout(() => {
        setCurrentQuote((prev) => (prev + 1) % inspirationalQuotes.length)
        setFadeClass('opacity-100')
      }, 300)
    }, 4000)

    return () => clearInterval(interval)
  }, [isVisible])

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setFadeClass('opacity-0')
        setTimeout(onClose, 500)
      }, 10000) // Show for 10 seconds

      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  const quote = inspirationalQuotes[currentQuote]

  return (
    <div
      className={`fixed top-20 right-4 max-w-sm bg-gradient-to-r from-emerald-500 to-blue-500 text-white p-6 rounded-lg shadow-lg transition-all duration-500 ${fadeClass} ${isVisible ? 'translate-y-0' : 'translate-y-[-100%]'}`}
      style={{ zIndex: 1000 }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="text-lg font-semibold">✨ Inspiration</div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 text-xl leading-none"
        >
          ×
        </button>
      </div>
      
      <div className={`transition-opacity duration-300 ${fadeClass}`}>
        <p className="text-sm mb-3 leading-relaxed">"{quote.text}"</p>
        <p className="text-xs opacity-90">— {quote.author}</p>
      </div>
    </div>
  )
}
