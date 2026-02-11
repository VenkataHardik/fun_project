import { getSessionFromCookie } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import AppHeader from "@/components/AppHeader";
import ReducedMotionProvider from "@/components/ReducedMotionProvider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionFromCookie();
  if (!session) redirect("/login");

  const friendName = process.env.FRIEND_DISPLAY_NAME?.trim();
  const appTitle = friendName ? `${friendName}'s Penguin` : "Penguin Pet";

  return (
    <ReducedMotionProvider>
    <div className="min-h-screen bg-gradient-to-br from-ice-50 via-white to-mint-100">
      <AppHeader>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="font-semibold text-gray-800">
            {appTitle}
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-ice-600 py-2.5 px-3 min-h-[44px] inline-flex items-center"
            >
              Pet
            </Link>
            <Link
              href="/profile"
              className="text-sm text-gray-600 hover:text-ice-600 py-2.5 px-3 min-h-[44px] inline-flex items-center"
            >
              Profile
            </Link>
            <a
              href="https://digibouquet.vercel.app/bouquet/ea0d013a-2c83-4346-bd4f-87552ec912d6"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-ice-600 py-2.5 px-3 min-h-[44px] inline-flex items-center gap-1.5"
              aria-label="Open your bouquet"
            >
              <span aria-hidden>🎁</span>
              Gift
            </a>
            <LogoutButton />
          </nav>
        </div>
      </AppHeader>
      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
    </div>
    </ReducedMotionProvider>
  );
}
