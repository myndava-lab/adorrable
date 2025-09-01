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
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts." },
  { text: "The future belongs to those who believe in the beauty of their dreams." },
];

export default function InspirationalWidget() {
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % QUOTES.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "300px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "16px",
        padding: "20px",
        color: "white",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.1)",
        zIndex: 1000,
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          lineHeight: "1.5",
          textAlign: "center",
          minHeight: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "500",
        }}
      >
        {QUOTES[currentQuote].text}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "6px",
          marginTop: "16px",
        }}
      >
        {QUOTES.map((_, index) => (
          <div
            key={index}
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: currentQuote === index ? "white" : "rgba(255,255,255,0.3)",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}