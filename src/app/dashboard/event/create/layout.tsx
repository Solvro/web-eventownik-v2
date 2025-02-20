export default function CreateEventFormLayout({
  children,
}: {
  children: Readonly<React.ReactNode>;
}) {
  return <div className="p-6">{children}</div>;
}
