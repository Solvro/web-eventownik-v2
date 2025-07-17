export function FormContainer({
  children,
  step,
  title,
  description,
  icon,
}: {
  children: Readonly<React.ReactNode>;
  step: Readonly<string>;
  title: Readonly<string>;
  description: Readonly<string>;
  icon: Readonly<React.ReactNode>;
}) {
  return (
    <div className="flex max-h-168 w-full flex-col gap-12">
      <p className="absolute -mt-0.5 text-sm">{step}</p>
      <div className="flex w-full flex-col items-center gap-4">
        <div className="flex rounded-full border border-neutral-300 p-3">
          {icon}
        </div>
        <div className="space-y-1 text-center">
          <p className="text-neutral-500">{title}</p>
          <p className="text-lg font-medium">{description}</p>
        </div>
      </div>
      <div className="overflow-y-auto p-px">{children}</div>
    </div>
  );
}
