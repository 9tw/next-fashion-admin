import "@/css/satoshi.css";
import "@/css/style.css";

import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import type { Metadata } from "next";
import { type PropsWithChildren } from "react";
import { Providers } from "./providers";
import { Header } from "@/components/Layouts/header";
import { Sidebar } from "@/components/Layouts/sidebar";
import NextTopLoader from "nextjs-toploader";

import { Toaster } from "react-hot-toast";
import { UserProvider } from "@/context/UserContext";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: {
    template: "%s | NextAdmin - Next.js Dashboard Kit",
    default: "NextAdmin - Next.js Dashboard Kit",
  },
  description:
    "Next.js admin dashboard toolkit with 200+ templates, UI components, and integrations for fast dashboard development.",
};

export default async function RootLayout({ children }: PropsWithChildren) {
  const cookieStore = await cookies();

  const clientCookie = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    },
  );

  const {
    data: { user },
  } = await clientCookie.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <UserProvider user={user}>
            <NextTopLoader color="#5750F1" showSpinner={false} />

            <div className="flex min-h-screen">
              <Sidebar />

              <div className="w-full bg-gray-2 dark:bg-[#020d1a]">
                <Header />

                <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
                  <Toaster position="bottom-right" />

                  {children}
                </main>
              </div>
            </div>
          </UserProvider>
        </Providers>
      </body>
    </html>
  );
}
