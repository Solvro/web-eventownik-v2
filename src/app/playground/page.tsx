"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const Editor = dynamic(
  async () => import("react-email-editor").then((module) => module.EmailEditor),
  {
    ssr: false,
  },
);

export default function PlaygroundPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          <h1 className="text-2xl font-bold">Ładowanie edytora...</h1>
        </div>
      }
    >
      <Editor
        minHeight="100vh"
        options={{
          projectId: 278_139,
        }}
      />
    </Suspense>
  );
}
