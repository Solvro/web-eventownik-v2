import { auth } from "@/auth";

export const middleware = auth((request) => {
  if (request.auth == null) {
    const newUrl = new URL("/auth/login", request.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: ["/((?!api|auth|event|_next/static|_next/image|favicon.ico|$).*)"],
};
