"use client";

import { OnboardingTour } from "@/components/OnboardingTour";
import { ThemeProvider } from "@/components/ThemeProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <OnboardingTour />
    </ThemeProvider>
  );
}
