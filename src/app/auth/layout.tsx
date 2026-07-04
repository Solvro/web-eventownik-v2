import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function generateMetadata() {
  const t = await getTranslations("Auth");

  return {
    title: t("authentication"),
  };
}

export default async function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // eslint-disable-next-line unicorn/no-await-expression-member
  const session = (await cookies()).get("session");

  if (session != null) {
    redirect("/dashboard/events");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-2">
      <div className="flex max-w-lg flex-col items-center gap-8">
        {children}
      </div>
    </div>
  );
}
