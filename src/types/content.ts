export interface SiteMeta {
  siteName: string;
  language: string;
  themeColor: string;
}

export interface HeroContent {
  eyebrow: string;
  headline: string;
  highlightWords: string[];
  image: string;
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
}

export interface MethodContent {
  title: string;
  items: MethodItem[];
}

export interface AboutContent {
  greeting: string;
  name: string;
  bio: string[];
  credentials: string[];
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
  about: AboutContent;
  contact: ContactContent;
}
