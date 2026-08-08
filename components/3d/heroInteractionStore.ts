"use client";

import { useSyncExternalStore } from "react";

let ctaHovered = false;
const listeners = new Set<() => void>();

export const heroInteractionStore = {
  setCtaHovered(hovered: boolean) {
    if (ctaHovered !== hovered) {
      ctaHovered = hovered;
      listeners.forEach((listener) => listener());
    }
  },
  getCtaHovered() {
    return ctaHovered;
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useCtaHovered() {
  return useSyncExternalStore(
    heroInteractionStore.subscribe,
    heroInteractionStore.getCtaHovered,
    () => false
  );
}
