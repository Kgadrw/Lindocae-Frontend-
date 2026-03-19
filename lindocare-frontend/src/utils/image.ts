export function normalizeImageUrl(url?: string): string {
  if (!url) return '';
  try {
    if (url.startsWith('http')) {
      // If it's a Cloudinary URL, request an optimized variant to avoid Next.js upstream timeouts
      // Example: https://res.cloudinary.com/<cloud>/image/upload/<public_id>
      // ->      https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto,w_1200/<public_id>
      if (/^https?:\/\/res\.cloudinary\.com\//i.test(url) && url.includes('/image/upload/')) {
        // Don't double-apply if transformations already exist after /upload/
        const parts = url.split('/image/upload/');
        if (parts.length === 2) {
          const afterUpload = parts[1] || '';
          const alreadyHasTransform =
            afterUpload.startsWith('f_auto') ||
            afterUpload.startsWith('q_auto') ||
            afterUpload.startsWith('w_') ||
            afterUpload.includes('/f_auto') ||
            afterUpload.includes('/q_auto') ||
            afterUpload.includes('/w_');
          if (!alreadyHasTransform) {
            return `${parts[0]}/image/upload/f_auto,q_auto,w_1200/${afterUpload}`;
          }
        }
      }
      return url;
    }
    const cleaned = url.replace(/^\/+/, '');
    return `https://lindo-project.onrender.com/${cleaned}`;
  } catch {
    return url;
  }
}


