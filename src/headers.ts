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

export type Headers = Record<string, Header>;
export type Header = Record<string, HeaderValue>;

export const createHeaderFile = (headers: Headers): string =>
  Object.keys(headers)
    .map(
      path =>
        `${path}\n${Object.keys(headers[path])
          .map(header => `  ${header}: ${formatValue(headers[path][header])}`)
          .join("\n")}`
    )
    .join("\n");
