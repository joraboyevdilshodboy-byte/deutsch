import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://deutsch.gg";

  const routes = [
    "",
    "/grammar",
    "/vocabulary",
    "/speaking",
    "/listening",
    "/reading",
    "/writing",
    "/progress",
    "/mock-tests",
    "/login",
    "/register",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
