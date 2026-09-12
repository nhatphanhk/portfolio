import { getMediaLibrary } from '@/lib/actions/media';
import { MediaLibraryClient } from './MediaLibraryClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Media Library — Admin' };

export default async function MediaLibraryPage() {
  const media = await getMediaLibrary();
  return <MediaLibraryClient media={media} />;
}
