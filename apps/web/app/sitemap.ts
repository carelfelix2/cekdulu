import type { MetadataRoute } from 'next';
import { featuredProducts, trendingArticles } from '@/lib/mock-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const staticRoutes = ['', '/deals', '/admin'].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date()
  }));

  const productRoutes = featuredProducts.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date()
  }));

  const articleRoutes = trendingArticles.map((article) => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: new Date(article.publishedAt)
  }));

  return [...staticRoutes, ...productRoutes, ...articleRoutes];
}
