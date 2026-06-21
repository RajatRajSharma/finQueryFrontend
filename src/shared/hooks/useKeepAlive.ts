import { useEffect } from "react";
import { pingHealth } from "@/shared/api/client";
import { KEEPALIVE_ENABLED, KEEPALIVE_INTERVAL_MS } from "@/shared/constants";

/**
 * Keeps the free-tier backend awake while the app is open by pinging /health on
 * an interval (default 9 min). Fires once immediately so the first real request
 * doesn't pay the cold-start. No-op when VITE_KEEPALIVE_ENABLED=false.
 */
export function useKeepAlive(): void {
  useEffect(() => {
    if (!KEEPALIVE_ENABLED) return;
    void pingHealth(); // warm it up right away
    const id = setInterval(() => void pingHealth(), KEEPALIVE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
}
