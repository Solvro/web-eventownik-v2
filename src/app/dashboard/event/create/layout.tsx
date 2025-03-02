export default function Layout({
  children,
}: {
  children: Readonly<React.ReactNode>;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-3xl">{children}</div>
    </div>
  );
}
