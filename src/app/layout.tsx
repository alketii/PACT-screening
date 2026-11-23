import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Studimi PACT – Bëhuni pjesë",
  description:
    "Studimi PACT hulumton se si përvojat traumatike ndikojnë në jetën e përditshme. Plotësoni disa pyetje të shkurtra dhe ekipi ynë ju kontakton.",
  openGraph: {
    title: "Studimi PACT – Bëhuni pjesë",
    description: "Disa pyetje të shkurtra, 2–3 minuta. Ekipi i studimit ju kontakton me telefon.",
    locale: "sq_AL",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#0a3334" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sq" className="h-full antialiased">
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
