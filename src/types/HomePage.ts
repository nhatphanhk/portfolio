export interface CarouselProps {
  items: Array<{ text: string; href?: string }>;
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
}

export interface SkillsCarouselProps {
  skills: string[];
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
}

export interface CertificationsCarouselProps {
  certifications: Array<{ text: string; href?: string }>;
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
}

export interface SkillIcon {
  name: string;
  icon: string;
}

export interface CertificationIcon {
  name: string;
  icon: string;
}
