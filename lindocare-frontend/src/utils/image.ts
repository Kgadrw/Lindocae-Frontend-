export function normalizeImageUrl(url?: string): string {
  if (!url) return '';
  try {
    if (url.startsWith('http')) return url;
    const cleaned = url.replace(/^\/+/, '');
    return `https://lindo-project.onrender.com/${cleaned}`;
  } catch {
    return url;
  }
}


