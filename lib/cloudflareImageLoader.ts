// In a file like lib/cloudflareImageLoader.ts
interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function cloudflareImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  // Cloudflare Image Resizing URL format
  // https://developers.cloudflare.com/images/image-resizing/url-format/
  const params = [`width=${width}`];

  if (quality) {
    params.push(`quality=${quality}`);
  }

  // Make sure the src is an absolute URL
  const url = src.startsWith("/")
    ? `${process.env.NEXT_PUBLIC_SITE_URL}${src}`
    : src;

  // Return the Cloudflare Image Resizing URL
  return `https://diuacm.com/cdn-cgi/image/${params.join(",")}/${url}`;
}
