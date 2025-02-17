import { auth } from "@/auth";

export const middleware = auth((request) => {
  if (request.auth == null && request.nextUrl.pathname !== "/auth/login") {
    const newUrl = new URL("/auth/login", request.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|$).*)",
    "/dashboard",
  ],
};
