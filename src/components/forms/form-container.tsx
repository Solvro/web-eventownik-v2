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
    <div
      key={step}
      className="flex max-h-144 w-full flex-col gap-8 overflow-y-auto p-4 md:max-h-200 md:gap-12 md:p-0"
    >
      <div className="flex w-full flex-col items-center gap-4">
        <div className="grid w-full grid-cols-3 items-start">
          <p className="text-sm">{step}</p>
          <div className="flex justify-center">
            <div className="rounded-full border border-neutral-300 p-3">
              {icon}
            </div>
          </div>
        </div>
        <div className="space-y-1 text-center">
          <p className="text-neutral-500">{title}</p>
          <p className="text-lg font-medium">{description}</p>
        </div>
      </div>
      <div className="p-px">{children}</div>
    </div>
  );
}
