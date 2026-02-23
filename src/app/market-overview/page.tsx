"use client";
import Page from "@/views/MarketOverview";

import { Suspense } from "react";

export default function RoutePage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>}><Page /></Suspense>;
}
