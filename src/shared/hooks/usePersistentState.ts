import { useEffect, useRef, useState } from "react";

interface Stored<T> {
  value: T;
  expires: number; // epoch ms after which the cache is dropped
}

/**
 * Like useState, but the value is mirrored to localStorage and restored on the
 * next mount — so it survives route changes, reloads, and browser restarts.
 * Entries older than `ttlMs` are discarded (the window slides on each write).
 * Falls back to plain in-memory state if storage is unavailable (private mode).
 */
export function usePersistentState<T>(
  key: string,
  initial: T | (() => T),
  ttlMs: number
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as Stored<T>;
        if (parsed.expires > Date.now()) return parsed.value;
        localStorage.removeItem(key); // expired
      }
    } catch {
      // corrupt JSON or storage blocked — fall through to the initial value
    }
    return typeof initial === "function" ? (initial as () => T)() : initial;
  });

  const ttlRef = useRef(ttlMs);
  useEffect(() => {
    try {
      const payload: Stored<T> = { value: state, expires: Date.now() + ttlRef.current };
      localStorage.setItem(key, JSON.stringify(payload));
    } catch {
      // quota exceeded or storage blocked — keep working in memory
    }
  }, [key, state]);

  return [state, setState];
}
