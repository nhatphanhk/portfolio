/**
 * Service helpers for uploading images, re-hosting external URLs (e.g. Notion expiring URLs),
 * and converting base64 data URIs to File objects.
 */

export interface UploadResult {
  url: string;
  id?: string;
  filename: string;
  size?: number;
  type?: string;
}

/**
 * Upload a single File object (from drag-drop, file picker, or clipboard) to /api/upload
 */
export async function uploadBlogImage(file: File, fileType: string = 'blog'): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', fileType);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to upload image');
  }

  return {
    url: data.url,
    id: data.id,
    filename: data.filename || file.name,
    size: data.size,
    type: data.type,
  };
}

/**
 * Ask backend to download an external image URL (e.g. Notion signed URL) and re-host it
 * permanently on Vercel Blob or local storage.
 */
export async function rehostExternalImage(imageUrl: string, fileType: string = 'blog'): Promise<UploadResult> {
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl, fileType }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to re-host external image');
  }

  return {
    url: data.url,
    id: data.id,
    filename: data.filename,
    size: data.size,
    type: data.type,
  };
}

/**
 * Convert a base64 Data URI (e.g. pasted from Microsoft Word or Google Docs) into a File object.
 */
export function dataUriToFile(dataUri: string, defaultName: string = `pasted-${Date.now()}`): File {
  const splitIndex = dataUri.indexOf(',');
  if (splitIndex === -1) {
    throw new Error('Invalid Data URI');
  }

  const header = dataUri.slice(0, splitIndex);
  const base64Data = dataUri.slice(splitIndex + 1);

  const mimeMatch = header.match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
  const extension = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'png';

  const byteString = atob(base64Data);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uintArray = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uintArray[i] = byteString.charCodeAt(i);
  }

  const filename = defaultName.includes('.') ? defaultName : `${defaultName}.${extension}`;
  return new File([arrayBuffer], filename, { type: mimeType });
}
