import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Baby Seven — Novelist. Director. Story Architect. | Blood Disaster",
  description:
    "Baby Seven — Novelist, Video Director, Reels Editor, and Scriptwriter. Creator of 'Blood Disaster', the #1 ranked novel. Cinematic storytelling across page, screen, and script.",
  keywords: [
    "Blood Disaster Novel",
    "Baby Seven",
    "Video Director",
    "Scriptwriter",
    "Reels Editor",
    "Novelist",
    "Cinematic Storytelling",
    "Screenwriter",
    "Blood Disaster",
  ],
  authors: [{ name: "Baby Seven" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Baby Seven — Novelist. Director. Story Architect.",
    description:
      "Creator of 'Blood Disaster', the #1 ranked novel. Cinematic storytelling across page, screen, and script.",
    siteName: "Baby Seven",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Baby Seven — Novelist. Director. Story Architect.",
    description:
      "Creator of 'Blood Disaster', the #1 ranked novel. Cinematic storytelling across page, screen, and script.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${orbitron.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
