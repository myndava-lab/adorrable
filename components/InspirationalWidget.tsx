
"use client";
import { useState, useEffect } from "react";

const QUOTES = [
  { text: "Commit your work to the Lord, and your plans will be established. — Proverbs 16:3", type: "verse" },
  { text: "Success is not final; failure is not fatal. — Winston Churchill", type: "quote" },
  { text: "The way to get started is to quit talking and begin doing. — Walt Disney", type: "quote" },
  { text: "Innovation distinguishes between a leader and a follower. — Steve Jobs", type: "quote" },
  { text: "Your limitation—it's only your imagination.", type: "motivational" },
  { text: "Great things never come from comfort zones.", type: "motivational" },
  { text: "Dream it. Wish it. Do it.", type: "motivational" },
  { text: "Success doesn't just find you. You have to go out and get it.", type: "motivational" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", type: "motivational" },
  { text: "Dream bigger. Do bigger.", type: "motivational" },
  { text: "Don't stop when you're tired. Stop when you're done.", type: "motivational" },
  { text: "Wake up with determination. Go to bed with satisfaction.", type: "motivational" },
  { text: "Do something today that your future self will thank you for.", type: "motivational" },
  { text: "Little things make big days.", type: "motivational" },
  { text: "It's going to be hard, but hard does not mean impossible.", type: "motivational" },
  { text: "Don't wait for opportunity. Create it.", type: "motivational" },
  { text: "Sometimes we're tested not to show our weaknesses, but to discover our strengths.", type: "inspirational" },
  { text: "The key to success is to focus on goals, not obstacles.", type: "inspirational" },
  { text: "Dream it. Believe it. Build it.", type: "inspirational" },
  { text: "Trust in the Lord with all your heart. — Proverbs 3:5", type: "verse" },
];

export default function InspirationalWidget() {
  const [enabled, setEnabled] = useState(true);
  const [index, setIndex] = useState(Math.floor(Math.random() * QUOTES.length));

  useEffect(() => {
    if (!enabled || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = setInterval(() => setIndex((prev) => (prev + 1) % QUOTES.length), 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled) return null;
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
