
"use client";

import { useEffect } from 'react';

declare global {
  interface Window {
    $crisp: any;
    CRISP_WEBSITE_ID: string;
  }
}

export default function CrispChat() {
  useEffect(() => {
    // Only load Crisp in browser environment
    if (typeof window !== 'undefined') {
      window.$crisp = [];
      window.CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID || "your-crisp-website-id";
      
      const script = document.createElement('script');
      script.src = 'https://client.crisp.chat/l.js';
      script.async = true;
      document.getElementsByTagName('head')[0].appendChild(script);

      // Configure Crisp
      window.$crisp.push(['set', 'user:email', '']);
      window.$crisp.push(['set', 'session:segments', [['adorrable-users']]]);
      window.$crisp.push(['set', 'session:data', [['source', 'adorrable-landing']]]);
    }
  }, []);

  return null; // This component doesn't render anything visible
}
'use client'

import { useEffect } from 'react'

export default function CrispChat() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const crispWebsiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID

      if (crispWebsiteId) {
        // Load Crisp chat widget
        window.$crisp = []
        window.CRISP_WEBSITE_ID = crispWebsiteId

        const script = document.createElement('script')
        script.src = 'https://client.crisp.chat/l.js'
        script.async = true
        document.getElementsByTagName('head')[0].appendChild(script)
      }
    }
  }, [])

  return null
}
