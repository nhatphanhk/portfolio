import { getProfile, getSocialLinks } from '@/lib/actions/about';
import FooterClient from './FooterClient';

const Footer = async () => {
  const year = new Date().getFullYear();
  const profile = await getProfile();
  const socialLinks = await getSocialLinks();

  return (
    <FooterClient
      year={year}
      profileName={profile.name}
      profileTagline={profile.tagline}
      socialLinks={socialLinks}
    />
  );
};

export default Footer;

