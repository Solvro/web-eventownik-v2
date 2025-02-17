export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0f0f0]">
      <div className="flex max-w-lg flex-col items-center gap-8">
        {children}
      </div>
    </div>
  );
}
