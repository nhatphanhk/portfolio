import React from 'react';
import {
  Github,
  Linkedin,
  Twitter,
  Mail,
  Globe,
  Link,
  Youtube,
  Facebook,
  Instagram,
  ExternalLink,
  Rss,
  Phone,
  MapPin,
  MessageCircle,
  Send,
  AtSign,
  Codepen,
  Gitlab,
  Slack,
  LucideProps
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Github,
  Linkedin,
  Twitter,
  Mail,
  Globe,
  Link,
  Youtube,
  Facebook,
  Instagram,
  ExternalLink,
  Rss,
  Phone,
  MapPin,
  MessageCircle,
  Send,
  AtSign,
  Codepen,
  Gitlab,
  Slack,
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  mail: Mail,
  globe: Globe,
  link: Link,
  youtube: Youtube,
  facebook: Facebook,
  instagram: Instagram,
  externallink: ExternalLink,
  rss: Rss,
  phone: Phone,
  mappin: MapPin,
  messagecircle: MessageCircle,
  send: Send,
  atsign: AtSign,
  codepen: Codepen,
  gitlab: Gitlab,
  slack: Slack,
};

export interface DynamicIconProps extends Omit<LucideProps, 'name'> {
  name?: string | null;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  const IconComponent = name ? (ICON_MAP[name] || ICON_MAP[name.toLowerCase()] || Link) : Link;
  return <IconComponent {...props} />;
};

export default DynamicIcon;
