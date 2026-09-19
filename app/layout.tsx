import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "CommonGround — FSHD research community", description: "A fictional patient-led protocol co-design prototype." };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
