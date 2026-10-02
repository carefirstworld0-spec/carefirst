import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import doctorClinic from "@/assets/doctor-clinic.jpg";

function NotFoundComponent() {
  return (
    <div className="relative flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-background p-4 sm:p-6 md:p-8 font-sans text-center">
      {/* Decorative background element */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center justify-center h-full max-h-[800px]">
        {/* Image - dynamically constrained to fit the screen */}
        <div
          className="mx-auto w-full max-w-3xl shrink overflow-hidden rounded-[20px] sm:rounded-[32px] shadow-2xl border border-border"
          style={{ maxHeight: "max(200px, 40vh)" }}
        >
          <img src={doctorClinic} alt="CareFirst Clinic" className="h-full w-full object-cover" />
        </div>

        {/* Content Block */}
        <div className="mt-6 sm:mt-10 shrink-0">
          <h1 className="font-display text-[clamp(3.5rem,10vw,6.5rem)] font-extrabold text-navy leading-none tracking-tight drop-shadow-sm">
            404
          </h1>
          <h2 className="mt-1 sm:mt-3 font-display text-[clamp(1.25rem,4vw,2rem)] font-extrabold text-navy">
            Page not found
          </h2>

          <p className="mx-auto mt-3 sm:mt-5 max-w-md px-4 text-[clamp(0.9rem,2vw,1.1rem)] leading-relaxed text-muted-foreground font-medium">
            The page you're looking for doesn't exist, has been moved, or is temporarily
            unavailable. Let's get you back on track.
          </p>

          <div className="mt-6 sm:mt-10 flex items-center justify-center">
            <Link
              to="/"
              className="flex h-[48px] sm:h-[56px] items-center justify-center gap-3 rounded-[12px] bg-primary px-8 sm:px-10 text-[15px] sm:text-[16px] font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-1 hover:bg-primary/90"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CareFirst Software Solutions" },
      { name: "description", content: "Clinic and hospital management software by CareFirst." },
      { name: "author", content: "CareFirst Software Solutions" },
      { property: "og:title", content: "CareFirst Software Solutions" },
      {
        property: "og:description",
        content: "Clinic and hospital management software by CareFirst.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
