
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

  useEffect(() => {
    setMounted(true);
    setIndex(Math.floor(Math.random() * QUOTES.length));
  }, []);

  useEffect(() => {
    if (!enabled || !mounted || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % QUOTES.length);
    }, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [enabled, mounted]);

  if (!enabled || !mounted) return null;

  return (
    <div style={{
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
      border: "1px solid rgba(255,255,255,0.1)"
    }}>
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
          onClick={() => setEnabled(false)}
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
  );
}
