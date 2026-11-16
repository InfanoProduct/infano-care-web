import type { CSSProperties } from 'react';

export function cssStyle(style: string): CSSProperties {
  const entries = style.split(';').flatMap((declaration) => {
    const separator = declaration.indexOf(':');
    if (separator < 0) return [];

    const property = declaration.slice(0, separator).trim();
    const value = declaration.slice(separator + 1).trim();
    if (!property || !value) return [];

    const reactProperty = property.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
    return [[reactProperty, value]];
  });

  return Object.fromEntries(entries) as CSSProperties;
}
