import dynamic from "next/dynamic";
import { Suspense } from "react";

const Editor = dynamic(
  async () =>
    import("@/components/easy-email-editor").then(
      (module) => module.EasyEmailEditor,
    ),
  // {
  //   ssr: false,
  // },
);

export default function DashboardEventEmailTemplatesNewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Editor />
    </Suspense>
  );
}
