import type { MetadataRoute } from "next";
import { CATEGORIES, SITE } from "@/lib/catalog";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;
  const products = await getProducts();

  const staticRoutes: MetadataRoute.Sitemap = ["", "/privacy", "/terms", "/refunds"].map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1 : 0.3,
  }));

  const bookRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/books/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const collectionRoutes: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${base}/collections/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...bookRoutes, ...collectionRoutes];
}
