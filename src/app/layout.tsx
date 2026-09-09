import type { Metadata, Viewport } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/baby-seven/theme-provider";

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
  title: "Baby Seven — Novelist, Director & Reels Editor | Blood Disaster",
  description:
    "Creator of the #1 ranked 'Blood Disaster' novel. Hire Baby Seven for professional writing, video directing, reels editing, and scriptwriting.",
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
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0047AB" },
    { media: "(prefers-color-scheme: dark)", color: "#F5B041" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${orbitron.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
