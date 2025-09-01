
"use client";
import React, { useState, useEffect } from "react";

const QUOTES = [
  { text: "The key to success is to focus on goals, not obstacles." },
  { text: "Dream bigger. Do bigger." },
  { text: "Little things make big days." },
  { text: "It's going to be hard, but hard does not mean impossible." },
  { text: "Don't stop when you're tired. Stop when you're done." },
  { text: "Wake up with determination. Go to bed with satisfaction." },
  { text: "Do something today that your future self will thank you for." },
  { text: "The difference between ordinary and extraordinary is that little extra." },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts." },
  { text: "The future belongs to those who believe in the beauty of their dreams." },
];

export default function InspirationalWidget() {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % QUOTES.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted || !isVisible) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "320px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "16px",
        padding: "24px",
        color: "white",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.1)",
        zIndex: 1000,
      }}
    >
      <div 
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          cursor: "pointer",
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.2)",
          fontSize: "16px",
          fontWeight: "bold",
          userSelect: "none",
        }}
        onClick={() => setIsVisible(false)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.2)";
        }}
      >
        ×
      </div>

      <div
        style={{
          fontSize: "15px",
          lineHeight: "1.6",
          textAlign: "center",
          minHeight: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "500",
          paddingTop: "8px",
        }}
      >
        {QUOTES[currentQuote]?.text || ""}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "6px",
          marginTop: "20px",
        }}
      >
        {QUOTES.map((_, index) => (
          <div
            key={index}
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: currentQuote === index ? "white" : "rgba(255,255,255,0.4)",
              transition: "background-color 0.3s ease",
              cursor: "pointer",
            }}
            onClick={() => setCurrentQuote(index)}
          />
        ))}
      </div>
    </div>
  );
}
