import { HeaderValue } from "./headers";

export const csp = (
  cspPolicy: Record<string, string[]>
): HeaderValue => {
  const [firstPolicy, ...morePolicies] = Object.keys(cspPolicy).map(
    directive => `${directive} ${cspPolicy[directive].join(" ")}`
  );
  if (morePolicies.length > 0) {
    return [firstPolicy, morePolicies];
  }
  return firstPolicy;
};
