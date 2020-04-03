export type HeaderValue =
  | string
  | number
  | HeaderValue[]
  | { [k: string]: boolean | HeaderValue };

const formatValue = (value: HeaderValue): string => {
  if (value !== null && typeof value === "object") {
    if (Array.isArray(value)) {
      return value
        .map(v => formatValue(v))
        .filter(v => v !== null)
        .join("; ");
    } else {
      return Object.keys(value)
        .map(key => {
          const v = value[key];
          if (typeof v === "boolean") {
            if (v) {
              return key;
            } else {
              return null;
            }
          }
          return `${key}=${formatValue(v)}`;
        })
        .filter(v => v != null)
        .join("; ");
    }
  }
  return `${value}`;
};

export interface Header {
  readonly for: string,
  readonly values: Record<string, HeaderValue>;
}

export const createHeaderFile = (headers: Header[]): string =>
  headers
    .map(
      ({ ["for"]: path, values }) =>
        `${path}\n${Object.keys(values)
          .map(key => `  ${key}: ${formatValue(values[key])}`)
          .join("\n")}`
    )
    .join("\n");
