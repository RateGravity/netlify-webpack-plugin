import { ISO3166 } from './iso-3166';
import { LanguageCodes } from './language-codes';

export interface Conditions {
  /**
   * Matches browsers requested language
   */
  readonly language?: LanguageCodes[];
  /**
   * Matches browsers advertized country
   */
  readonly country?: ISO3166[];
  /**
   * Matches users logged in roles
   */
  readonly role?: string[];
}

export interface Redirect {
  /**
   * URL from which to redirect
   */
  readonly from: string;
  /**
   * URL to redirect to
   */
  readonly to: string;
  /**
   * status number for the redirect
   * status 200 is a proxy
   */
  readonly status?: number;
  /**
   * if true force the redirect even if
   * the value is present
   */
  readonly force?: boolean;
  /**
   * Query strings to match, and capture
   */
  readonly query?: Record<string, string>;
  /**
   * Conditions to check for
   */
  readonly conditions?: Conditions;
}

function writeConditions(conditions?: Conditions): string[] {
  if (conditions) {
    return Object.keys(conditions)
      .map((k) => {
        const key = k as keyof Conditions;
        if (conditions[key] && conditions[key]!.length > 0) {
          const capitalized = `${key[0].toUpperCase()}${key.substr(1)}`;
          return `${capitalized}=${conditions[key]!.join(',')}`;
        }
        return null;
      })
      .filter((v): v is string => v != null);
  }
  return [];
}

function writeQueryParams(query?: Record<string, string>): string[] {
  if (query) {
    return Object.keys(query).map((param) => `${param}=${query[param]}`);
  }
  return [];
}

export const createRedirectFile = (patterns: Redirect[]): string =>
  patterns
    .map(({ from, query, to, status = 301, force, conditions }) =>
      [
        from,
        ...writeQueryParams(query),
        to,
        `${status}${force ? '!' : ''}`,
        ...writeConditions(conditions)
      ].join('    ')
    )
    .join('\n');
