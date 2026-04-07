"use client";

import { createContext, useContext, type ReactNode } from "react";

export interface CountyInfo {
  id: string;
  name: string;
  slug: string;
  center: [number, number];
}

const CountyContext = createContext<CountyInfo | null>(null);

export function CountyProvider({
  county,
  children,
}: {
  county: CountyInfo;
  children: ReactNode;
}) {
  return (
    <CountyContext.Provider value={county}>{children}</CountyContext.Provider>
  );
}

export function useCounty(): CountyInfo {
  const ctx = useContext(CountyContext);
  if (!ctx) throw new Error("useCounty must be used inside CountyProvider");
  return ctx;
}

export function useCountyOptional(): CountyInfo | null {
  return useContext(CountyContext);
}
