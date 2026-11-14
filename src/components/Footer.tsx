import { getProfile, getSocialLinks } from '@/lib/actions/about';
import { getServerLocale } from '@/lib/i18n/server';
import FooterClient from './FooterClient';

const Footer = async () => {
  const year = new Date().getFullYear();
  const locale = await getServerLocale();
  const [profile, socialLinks] = await Promise.all([getProfile(locale), getSocialLinks()]);

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

