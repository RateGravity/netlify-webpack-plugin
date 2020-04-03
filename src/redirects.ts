export interface Redirect {
  readonly 'from': string;
  readonly to: string;
  readonly status?: number;
  readonly force?: Boolean;
}

export const createRedirectFile = (patterns: Redirect[]): string =>
  patterns
    .map(
      ({ from, to, status = 301, force }) =>
        `${from}    ${to}    ${status}${force ? "!" : ""}`
    )
    .join("\n");
