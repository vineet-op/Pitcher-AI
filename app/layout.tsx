import type { Metadata } from "next";
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Paste a full https:// image URL. 1200×630 works best for LinkedIn + Twitter. */
const OG_IMAGE =
  "https://res.cloudinary.com/dgcjzooxx/image/upload/v1787430373/ChatGPT_Image_Aug_23_2026_01_55_19_AM_od80vp.png";

const TITLE = "Pitcher AI — Turn Your Resume Into a Carousel";
const DESCRIPTION =
  "Upload your PDF resume. Let AI turn your experience into a 12-slide carousel people actually want to read.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Pitcher AI",
    title: TITLE,
    description: DESCRIPTION,
    ...(OG_IMAGE
      ? {
          images: [
            {
              url: OG_IMAGE,
              width: 1200,
              height: 630,
              alt: TITLE,
            },
          ],
        }
      : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    ...(OG_IMAGE ? { images: [OG_IMAGE] } : {}),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
