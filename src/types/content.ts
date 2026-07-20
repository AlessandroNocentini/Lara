export interface SiteMeta {
  siteName: string;
  language: string;
  themeColor: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface HeroContent {
  eyebrow: string;
  headline: string;
  highlightWords: string[];
  image: string;
  socialLinks: SocialLink[];
}

export interface PainPointsContent {
  questions: string[];
  cta: {
    label: string;
    target: string;
  };
}

export interface MethodItem {
  title: string;
  description: string;
  image: string;
}

export interface MethodContent {
  title: string;
  items: MethodItem[];
  section: string;
}

export interface ResultsContent {
  image: string;
  beginner: string;
  intermediate: string;
  advanced: string;
}

export interface AboutContent {
  greeting: string;
  name: string;
  bio: string;
  image: string;
}

export interface ContactContent {
  heading: string;
  description: string;
  successMessage: string;
}

export interface SiteContent {
  meta: SiteMeta;
  hero: HeroContent;
  painPoints: PainPointsContent;
  method: MethodContent;
  results: ResultsContent;
  about: AboutContent;
  contact: ContactContent;
}
