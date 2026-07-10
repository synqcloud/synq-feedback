import { PageShell } from "@/components/layout/page-shell";

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return <PageShell className="h-full px-0 sm:px-0">{children}</PageShell>;
}
