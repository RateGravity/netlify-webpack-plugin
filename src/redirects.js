export const createRedirectFile = patterns =>
  patterns
    .map(
      ({ from, to, status = 301, force }) =>
        `${from}    ${to}    ${status}${force ? "!" : ""}`
    )
    .join("\n");
