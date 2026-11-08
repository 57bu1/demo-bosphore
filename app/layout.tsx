import type { Metadata } from "next";
import "./globals.css";
import "./menu.css";
import "./order.css";
import "./planning.css";

export const metadata: Metadata = {
  title: "Le Bosphore | Restaurant turc à Bourges",
  description: "Le Bosphore à Bourges. Découvrez nos spécialités et faites une demande de réservation au 10 boulevard de la République.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}

