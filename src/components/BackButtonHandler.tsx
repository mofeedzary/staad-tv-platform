import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";

/**
 * Browser back-button behavior:
 * - From any non-home page → go straight to "/"
 * - From "/" → stay on "/" (effectively traps back so the user doesn't leave
 *   the app through random history entries from before they entered it).
 */
export function BackButtonHandler() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Seed a sentinel entry so the first "back" triggers popstate instead of
    // leaving the site immediately.
    window.history.pushState({ __staad_sentinel: true }, "");

    const onPop = () => {
      const path = window.location.pathname;
      if (path === "/") {
        // Re-trap on home
        window.history.pushState({ __staad_sentinel: true }, "");
      } else {
        // Replace current entry with home so further back doesn't walk history
        router.navigate({ to: "/", replace: true });
      }
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [router]);

  return null;
}
