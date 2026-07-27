export interface SiteMeta {
  siteName: string;
  image: string;
  language: string;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface HeroContent {
  eyebrow: string;
  image: string;
  socialLinks: SocialLink[];
}

export interface PainPointsContent {
  heading: string;
  highlightWords: string[];
  image: string;
  questions: string[];
  cta: {
    label: string;
    target: string;
  };
  visible: boolean;
}

export interface CursorAssets {
  spritzImage: string;
  iceImage: string;
  orangeSliceImage: string;
}

export interface MethodItem {
  title: string;
  description: string;
  image: string;
}

export interface MethodContent {
  title: string;
  introSubtitle: string;
  introText: string;
  stepsLabel: string;
  steps: string[];
  lessonsSubtitle: string;
  items: MethodItem[];
  visible: boolean;
}

export interface ResultsContent {
  title: string;
  image: string;
  beginner: string;
  intermediate: string;
  visible: boolean;
}

export interface ServiceItem {
  title: string;
  description: string;
  icon: string;
}

export interface ServicesContent {
  title: string;
  items: ServiceItem[];
  visible: boolean;
}

export interface Testimonial {
  name: string;
  text: string;
  date: string;
  gender: "male" | "female" | "other";
}

export interface TestimonialsContent {
  title: string;
  items: Testimonial[];
  visible: boolean;
}

export interface AboutContent {
  greeting: string;
  name: string;
  bio: string;
  image: string;
  visible: boolean;
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
  services: ServicesContent;
  results: ResultsContent;
  testimonials: TestimonialsContent;
  about: AboutContent;
  contact: ContactContent;
  cursor: CursorAssets;
}
