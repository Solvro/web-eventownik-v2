export function getAttributeLabel(name: string, language: string) {
  try {
    const parsed = JSON.parse(name) as Record<string, string>;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return parsed[language] ?? parsed.pl ?? Object.values(parsed)[0] ?? name;
  } catch {
    return name;
  }
}
