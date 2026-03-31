import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/panel(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // const role = auth().protect().sessionClaims.metadata.role;
    // if (role != "admin" && role != "user") {
    //   return NextResponse.redirect(new URL("/accessdenied", req.url));
    // }
    await auth().protect();
  }
});
