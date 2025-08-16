function UnsavedIndicator({ offset }: { offset?: string }) {
  const pingOffset =
    offset === undefined ? "1.5" : (Number.parseInt(offset) - 0.5).toString();

  return (
    <>
      <span
        className="absolute size-3 animate-ping rounded-full bg-amber-500 opacity-50"
        style={{
          top: `calc(var(--spacing) * ${pingOffset})`,
          left: `calc(var(--spacing) * ${pingOffset})`,
        }}
      />
      <span
        className="absolute size-2 rounded-full bg-amber-500"
        style={{
          top: `calc(var(--spacing) * ${offset ?? "1"})`,
          left: `calc(var(--spacing) * ${offset ?? "1"})`,
        }}
      />
    </>
  );
}

export { UnsavedIndicator };
