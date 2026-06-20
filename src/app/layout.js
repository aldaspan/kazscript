import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "KazScript — Қазақ жазу жүйелері түрлендіргіші",
  description:
    "KazScript — кириллица, төте жазу, латын жазуларын бір-біріне дәл және жылдам түрлендіретін ашық цифрлық платформа. Қазақ жазу мұрасын цифрлық кеңістікте сақтаймыз.",
  keywords: [
    "қазақ жазу",
    "төте жазу",
    "кириллица",
    "латын",
    "конвертер",
    "түрлендіргіш",
    "kazscript",
    "қазақша",
    "arab kazakh",
    "tote zhazu",
  ],
  authors: [{ name: "KazScript", url: "https://kazscript.com" }],
  creator: "KazScript",
  publisher: "KazScript",
  metadataBase: new URL("https://kazscript.vercel.app"),
  openGraph: {
    title: "KazScript — Қазақ жазу жүйелері түрлендіргіші",
    description:
      "Кириллица ↔ Төте жазу түрлендіргіші. Қазақ жазу мұрасын цифрлық кеңістікте сақтаймыз.",
    url: "https://kazscript.vercel.app",
    siteName: "KazScript",
    locale: "kk_KZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KazScript — Қазақ жазу жүйелері түрлендіргіші",
    description:
      "Кириллица ↔ Төте жазу түрлендіргіші. Қазақ жазу мұрасын цифрлық кеңістікте сақтаймыз.",
  },
  alternates: {
    canonical: "https://kazscript.vercel.app",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="kk"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}