import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import arcjet from "@arcjet/next";
import { detectBot, shield, createMiddleware } from "@arcjet/next";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);

const ARCJET_KEY = process.env.ARCJET_KEY;

if (!ARCJET_KEY) {
  throw new Error("ARCJET_KEY is not defined");
}
const aj = arcjet({
  key: ARCJET_KEY,
  rules: [
    shield({
      mode: "LIVE",
    }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "GO_HTTP"],
    }),
  ],
});

const clerk = clerkMiddleware(async (auth, req) => {
  const authObject = await auth();

  if (!authObject.userId && isProtectedRoute(req)) {
    return authObject.redirectToSignIn();
  }
});

export default createMiddleware(aj, clerk);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
