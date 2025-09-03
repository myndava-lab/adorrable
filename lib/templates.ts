
// Template imports
import generalFree from "@/data/templates/general_free.json";
import restaurantNg from "@/data/templates/restaurant_ng.json";
import fashionNg from "@/data/templates/fashion_ng.json";
import realestateNg from "@/data/templates/realestate_ng.json";
import ecommerceUs from "@/data/templates/ecommerce_us.json";
import portfolioUs from "@/data/templates/portfolio_us.json";
import agencyUs from "@/data/templates/agency_us.json";
import clinicKe from "@/data/templates/clinic_ke.json";
import educationKe from "@/data/templates/education_ke.json";
import consultancyIn from "@/data/templates/consultancy_in.json";
import restaurantIn from "@/data/templates/restaurant_in.json";
import boutiqueIn from "@/data/templates/boutique_in.json";
import saasEu from "@/data/templates/saas_eu.json";
import freelancerEu from "@/data/templates/freelancer_eu.json";
import ecommerceAs from "@/data/templates/ecommerce_as.json";
import hospitalityAs from "@/data/templates/hospitality_as.json";

export interface TemplateData {
  meta: {
    title: string;
    payments: string;
  };
  styles: {
    primary: string;
    accent: string;
    font_head: string;
    font_body: string;
  };
  sections: Array<{
    type: string;
    [key: string]: any;
  }>;
}

export interface Template {
  id: string;
  name: string;
  region: string;
  industry: string;
  tier: string;
  data: TemplateData;
}

// Template catalog
export const templateCatalog: Template[] = [
  // General fallback (always free)
  {
    id: "general_free",
    name: "General Business",
    region: "global",
    industry: "general",
    tier: "free",
    data: generalFree as TemplateData
  },
  
  // Nigeria (NG)
  {
    id: "restaurant_ng",
    name: "Nigerian Restaurant",
    region: "ng",
    industry: "restaurant",
    tier: "pro",
    data: restaurantNg as TemplateData
  },
  {
    id: "fashion_ng",
    name: "Afro Fashion Boutique",
    region: "ng",
    industry: "fashion",
    tier: "pro",
    data: fashionNg as TemplateData
  },
  {
    id: "realestate_ng",
    name: "Nigerian Real Estate",
    region: "ng",
    industry: "realestate",
    tier: "pro",
    data: realestateNg as TemplateData
  },
  
  // United States (US)
  {
    id: "ecommerce_us",
    name: "US E-commerce Store",
    region: "us",
    industry: "ecommerce",
    tier: "pro",
    data: ecommerceUs as TemplateData
  },
  {
    id: "portfolio_us",
    name: "Creative Portfolio",
    region: "us",
    industry: "portfolio",
    tier: "pro",
    data: portfolioUs as TemplateData
  },
  {
    id: "agency_us",
    name: "Digital Marketing Agency",
    region: "us",
    industry: "agency",
    tier: "pro",
    data: agencyUs as TemplateData
  },
  
  // Kenya (KE)
  {
    id: "clinic_ke",
    name: "Kenyan Healthcare Clinic",
    region: "ke",
    industry: "clinic",
    tier: "pro",
    data: clinicKe as TemplateData
  },
  {
    id: "education_ke",
    name: "Kenyan School",
    region: "ke",
    industry: "education",
    tier: "pro",
    data: educationKe as TemplateData
  },
  
  // India (IN)
  {
    id: "consultancy_in",
    name: "Indian Consultancy",
    region: "in",
    industry: "consultancy",
    tier: "pro",
    data: consultancyIn as TemplateData
  },
  {
    id: "restaurant_in",
    name: "Indian Restaurant",
    region: "in",
    industry: "restaurant",
    tier: "pro",
    data: restaurantIn as TemplateData
  },
  {
    id: "boutique_in",
    name: "Indian Designer Boutique",
    region: "in",
    industry: "boutique",
    tier: "pro",
    data: boutiqueIn as TemplateData
  },
  
  // Europe (EU)
  {
    id: "saas_eu",
    name: "European SaaS Platform",
    region: "eu",
    industry: "saas",
    tier: "enterprise",
    data: saasEu as TemplateData
  },
  {
    id: "freelancer_eu",
    name: "European Freelancer",
    region: "eu",
    industry: "freelancer",
    tier: "pro",
    data: freelancerEu as TemplateData
  },
  
  // Asia (AS)
  {
    id: "ecommerce_as",
    name: "Asian E-commerce",
    region: "as",
    industry: "ecommerce",
    tier: "pro",
    data: ecommerceAs as TemplateData
  },
  {
    id: "hospitality_as",
    name: "Asian Resort & Spa",
    region: "as",
    industry: "hospitality",
    tier: "enterprise",
    data: hospitalityAs as TemplateData
  }
];

export function findTemplate(region: string, industry: string, userTier: string = 'free'): Template {
  // First try to find exact match
  const exactMatch = templateCatalog.find(
    t => t.region === region && 
         t.industry === industry && 
         canAccessTier(userTier, t.tier)
  );
  
  if (exactMatch) return exactMatch;
  
  // Try region match with any industry
  const regionMatch = templateCatalog.find(
    t => t.region === region && canAccessTier(userTier, t.tier)
  );
  
  if (regionMatch) return regionMatch;
  
  // Try industry match with any region
  const industryMatch = templateCatalog.find(
    t => t.industry === industry && canAccessTier(userTier, t.tier)
  );
  
  if (industryMatch) return industryMatch;
  
  // Fallback to general template (always accessible)
  return templateCatalog.find(t => t.id === 'general_free')!;
}

function canAccessTier(userTier: string, templateTier: string): boolean {
  const tierHierarchy = { 'free': 0, 'pro': 1, 'enterprise': 2 };
  return tierHierarchy[userTier as keyof typeof tierHierarchy] >= 
         tierHierarchy[templateTier as keyof typeof tierHierarchy];
}

export function getCulturalPaymentMethod(region: string): string {
  const paymentMethods: Record<string, string> = {
    'ng': 'paystack',
    'ke': 'mpesa',
    'in': 'razorpay', 
    'us': 'stripe',
    'eu': 'stripe',
    'as': 'alipay'
  };
  
  return paymentMethods[region] || 'stripe';
}

export function getRegionalLanguage(region: string): string {
  const languages: Record<string, string> = {
    'ng': 'English',
    'ke': 'English', 
    'in': 'English',
    'us': 'English',
    'eu': 'English',
    'as': 'English'
  };
  
  return languages[region] || 'English';
}
