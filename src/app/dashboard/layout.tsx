export default function Layout({
  children,
  modals,
}: {
  children: Readonly<React.ReactNode>;
  modals: Readonly<React.ReactNode>;
}) {
  return (
    <>
      {children}
      {modals}
    </>
  );
}
