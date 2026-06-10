export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "Jal-Setu",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://jalsetu.me").replace(/\/$/, ""),
  apiUrl: (process.env.NEXT_PUBLIC_API_URL ?? "https://api.jalsetu.me").replace(/\/$/, ""),
  adminUrl: (process.env.NEXT_PUBLIC_ADMIN_URL ?? "https://admin.jalsetu.me").replace(/\/$/, "")
} as const;
