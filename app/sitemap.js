import { siteConfig } from '@/data/siteConfig';
import { solutionPages } from '@/data/valueLatamContent';

export default function sitemap() {
  const now = new Date();
  const internalPaths = Object.values(solutionPages).map((page) => page.path);

  return [
    {
      url: siteConfig.url,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...internalPaths.map((path) => ({
      url: `${siteConfig.url}${path}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    })),
    {
      url: `${siteConfig.url}/privacidad`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
