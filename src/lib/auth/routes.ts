export const protectedPrefixes = [
  "/dashboard",
  "/plans",
  "/transactions",
  "/insights",
  "/settings",
];

export const authPaths = ["/auth/login", "/auth/signup"];

export function isProtectedPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    protectedPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  );
}

export function isAuthPath(pathname: string): boolean {
  return authPaths.includes(pathname);
}
