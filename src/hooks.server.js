import { SvelteKitAuth } from '@auth/sveltekit';
import Twitter from '@auth/core/providers/twitter';
import { TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET, AUTH_SECRET, PUBLIC_TWITTER_REDIRECT_URI } from '$env/static/private';

export const handle = SvelteKitAuth({
  providers: [
    Twitter({
      clientId: TWITTER_CLIENT_ID,
      clientSecret: TWITTER_CLIENT_SECRET,
      authorization: {
        url: "https://twitter.com/i/oauth2/authorize",
        params: {
          redirect_uri: PUBLIC_TWITTER_REDIRECT_URI,
          response_type: "code",
          scope: "users.read tweet.read offline.access",
          code_challenge_method: "S256"
        }
      },
      token: "https://api.twitter.com/2/oauth2/token" // Added to fix 403 errors
    })
  ],
  secret: AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/auth/signin",
    callback: "/auth/callback/twitter",
    error: "/auth/error"
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.username = token.username;
      }
      return session;
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.username = profile.username;
      }
      return token;
    }
  }
});

// CORS Middleware (Fixes OAuth "Cross-site" error)
export async function handleRequest({ event, resolve }) {
  if (event.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }

  const response = await resolve(event);
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  return response;
}