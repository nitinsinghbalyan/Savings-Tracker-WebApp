import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/auth/login", "/auth/signup"],
      disallow: [
        "/dashboard",
        "/plans",
        "/transactions",
        "/insights",
        "/settings",
      ],
    },
  };
}
