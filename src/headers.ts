type SimpleHeaderValue = string | number;
type ParameterizedHeaderValue = [
  SimpleHeaderValue,
  { [token: string]: SimpleHeaderValue | boolean } | SimpleHeaderValue[]
];
type SingleValueHeader = ParameterizedHeaderValue | SimpleHeaderValue;
type MultiValueHeader = SingleValueHeader[] | { [key: string]: SingleValueHeader | boolean };

/**
 * Headers can be either single or multi-valued.
 * For single valued headers the value can be a string or number, or
 * it can be an array with the first argument being a string or number, the value of the header
 * and the second argument being an object or array containing the tokens with their values.
 * For the tokens if the value is a boolean is token is name is included if the value is true,
 * otherwise the value is [tokenName]=[tokenValue]; . If tokens is an array tokens are included as [token];
 * For Multi-valued headers the value should be an array of the single valued headers, or an object
 * in the case of an object if the value for a key is a boolean than the header value
 * will be included conditionally. Otherwise the value will be:
 * [key]=[value according to single value spec]
 */
export type HeaderValue = MultiValueHeader | SingleValueHeader;

function isSimpleHeaderValue(value: HeaderValue): value is SimpleHeaderValue {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    value instanceof String ||
    value instanceof Number
  );
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean' || value instanceof Boolean;
}

function isParameterizedHeaderValue(value: HeaderValue): value is ParameterizedHeaderValue {
  if (Array.isArray(value) && value.length === 2) {
    const [parameterValue, tokens] = value;
    if (isSimpleHeaderValue(parameterValue) && tokens !== null && typeof tokens === 'object') {
      if (Array.isArray(tokens)) {
        return tokens.every((v) => isSimpleHeaderValue(v));
      }
      return Object.values(tokens).every((v) => isBoolean(v) || isSimpleHeaderValue(v));
    }
  }
  return false;
}

function writeParameterizedHeaderValue(value: ParameterizedHeaderValue): string {
  const tokenStrings = Array.isArray(value[1])
    ? value[1].map((v) => `${v}`)
    : Object.entries(value[1])
        .map(([key, v]) => {
          if (isBoolean(v)) {
            return v ? key : null;
          }
          return `${key}=${v}`;
        })
        .filter((v) => v != null);
  return `${value[0]}${tokenStrings.length > 0 ? `; ${tokenStrings.join('; ')}` : ''}`;
}

function isSingleValueHeader(value: HeaderValue): value is SingleValueHeader {
  return isParameterizedHeaderValue(value) || isSimpleHeaderValue(value);
}

function writeSingleValueHeader(header: string, value: SingleValueHeader): string {
  const headerValue = isSimpleHeaderValue(value)
    ? `${value}`
    : writeParameterizedHeaderValue(value);
  return `  ${header}: ${headerValue}`;
}

function isMultiValueHeader(value: HeaderValue): value is MultiValueHeader {
  if (value != null && typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.every((v: HeaderValue) => isSingleValueHeader(v));
    } else {
      return Object.values(value).every((v) => isBoolean(v) || isSingleValueHeader(v));
    }
  }
  return false;
}

function writeMultiValueHeader(header: string, value: MultiValueHeader): string[] {
  return Array.isArray(value)
    ? value.map((v) => writeSingleValueHeader(header, v))
    : Object.keys(value)
        .map((key) => {
          const v = value[key];
          if (isBoolean(v)) {
            return v ? key : null;
          }
          return `${key}=${isSimpleHeaderValue(v) ? v : writeParameterizedHeaderValue(v)}`;
        })
        .filter((v): v is string => v != null)
        .map((v) => writeSingleValueHeader(header, v));
}

function writeHeaders(header: string, value: HeaderValue): string[] {
  if (value != null) {
    if (isSingleValueHeader(value)) {
      return [writeSingleValueHeader(header, value)];
    } else if (isMultiValueHeader(value)) {
      return writeMultiValueHeader(header, value);
    }
  }
  return [];
}

export type Headers = { [path: string]: Header };
export type Header = { [header: string]: HeaderValue };

export const createHeaderFile = (headers: Headers): string =>
  Object.keys(headers)
    .map((path) => {
      const headerValues = Object.keys(headers[path])
        .map((header) => writeHeaders(header, headers[path][header]))
        .reduce((acc, next) => {
          acc.push(...next);
          return acc;
        }, []);
      if (headerValues) {
        return [`${path}`, ...headerValues];
      }
      return [];
    })
    .reduce((acc, next) => {
      acc.push(...next);
      return acc;
    }, [])
    .join('\n');
