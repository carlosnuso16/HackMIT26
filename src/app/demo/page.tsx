"use client";

import { DemoReel } from "@/components/demo/DemoReel";
import Link from "next/link";
import { Suspense } from "react";
import "./demo.css";

export default function DemoPage() {
  return (
    <main>
      <div className="demo-page-bar">
        <Link href="/" className="demo-page-brand">
          Cyto
        </Link>
        <span className="demo-page-meta">Product demo · ~64s</span>
        <Link href="/analyze" className="demo-page-link">
          Open workspace
        </Link>
      </div>
      <Suspense fallback={<div className="demo-root" data-theme="dark" />}>
        <DemoReel />
      </Suspense>
    </main>
  );
}
