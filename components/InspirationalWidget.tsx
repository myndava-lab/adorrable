
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
    <div className="fixed bottom-4 right-4 p-4 bg-green-600 text-white rounded-md shadow-md max-w-xs text-sm z-50">
      <p>{QUOTES[index].text}</p>
      <div className="mt-2 flex justify-between">
        <button className="text-xs underline" onClick={() => setEnabled(false)}>Hide</button>
        <button className="text-xs underline" onClick={() => setIndex((prev) => (prev + 1) % QUOTES.length)}>Next</button>
      </div>
    </div>
  );
}
