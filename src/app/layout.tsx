import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/top-nav";
import { FeedbackSubNav } from "@/components/board/feedback-sub-nav";
import { ToastProvider } from "@/components/ui/toast";
import { UserProfileProvider } from "@/components/profile/user-profile-provider";
import { LiveBoardRefresh } from "@/components/suggestions/live-board-refresh";
import { getSiteSettings } from "@/lib/data/settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.name,
    description: settings.description || `Share ideas and vote on what ${settings.name} builds next.`,
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/synq-icon.png", type: "image/png", sizes: "64x64" },
      ],
      apple: [{ url: "/synq-icon.png", sizes: "64x64" }],
    },
  };
}

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full overflow-hidden antialiased`}
    >
      <body className="flex h-dvh flex-col overflow-y-auto bg-bg text-fg">
        <ToastProvider>
          <UserProfileProvider>
            <LiveBoardRefresh />
            <TopNav />
            <FeedbackSubNav />
            <main className="min-h-0 flex-1">{children}</main>
            {modal}
          </UserProfileProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
