import { NextRequestWithAuth, withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    if (
      req.nextUrl.pathname.startsWith("/admin") &&
      req.nextauth.token?.role != "ADMIN"
    ) {
      return NextResponse.rewrite(new URL("/forbidden", req.url));
    }
  },
  {
    callbacks: {
      authorized: async ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin", "/admin/meja", "/admin/meja/makanan", "/api/meja"],
};
