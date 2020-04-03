export const csp = (cspPolicy: Record<string, string[]>) =>
  Object.keys(cspPolicy).map(
    directive => `${directive} ${cspPolicy[directive].join(" ")}`
  );
