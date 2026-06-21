import "./globals.css";
import { SITE_NAME, SITE_URL, websiteJsonLd } from "../lib/seo";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — What the world is searching for`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Daily stories built from what people are searching for, right now — browse by country or search any nation.",
  alternates: { canonical: "/" },
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  const jsonLd = websiteJsonLd();

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <footer className="sitefoot">
          <span>{SITE_NAME}</span>
          <span>·</span>
          <span>AI-assisted, human-reviewed</span>
        </footer>
      </body>
    </html>
  );
}
