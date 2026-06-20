import "./globals.css";

export const metadata = {
  title: {
    default: "Emberline — What the world is searching for",
    template: "%s · Emberline",
  },
  description:
    "Daily stories built from what people are searching for, right now.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer className="sitefoot">
          <span>Emberline</span>
          <span>·</span>
          <span>AI-assisted, human-reviewed</span>
        </footer>
      </body>
    </html>
  );
}
