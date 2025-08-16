function UnsavedIndicator({
  pingOffset,
  markerOffset,
}: {
  pingOffset?: string;
  markerOffset?: string;
}) {
  return (
    <>
      <span
        className="absolute size-3 animate-ping rounded-full bg-amber-500 opacity-50"
        style={{
          top: `calc(var(--spacing) * ${pingOffset ?? "1.5"})`,
          left: `calc(var(--spacing) * ${pingOffset ?? "1.5"})`,
        }}
      />
      <span
        className="absolute size-2 rounded-full bg-amber-500"
        style={{
          top: `calc(var(--spacing) * ${markerOffset ?? "1"})`,
          left: `calc(var(--spacing) * ${markerOffset ?? "1"})`,
        }}
      />
    </>
  );
}

export { UnsavedIndicator };
