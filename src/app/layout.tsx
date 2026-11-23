import type { Metadata, Viewport } from "next";
import "./globals.css";

const title = "Studimi PACT – Bëhuni pjesë e studimit";
const description =
  "Si ndikojnë përvojat traumatike në jetën e përditshme? Përgjigjuni disa pyetjeve të shkurtra (2–3 minuta) dhe ekipi i studimit ju kontakton.";

/** Public address, needed so shared links point at absolute image URLs. */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

// The share image is picked up automatically from src/app/opengraph-image.png (1200×630).
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "Studimi PACT",
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Studimi PACT",
    locale: "sq_AL",
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sq" className="h-full antialiased">
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
