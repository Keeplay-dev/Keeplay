"use client";

import { Suspense } from "react";
import ChatsView from "@/components/ChatsView";

export default function ChatsPage() {
  return (
    <div className="fade-in" style={{ padding: "0" }}>
      <Suspense fallback={<div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Carregando conversas...</div>}>
        <ChatsView />
      </Suspense>
    </div>
  );
}

