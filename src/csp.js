export const csp = cspPolicy =>
  Object.keys(cspPolicy).map(
    directive => `${directive} ${cspPolicy[directive].join(" ")}`
  );
