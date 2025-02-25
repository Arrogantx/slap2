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
      }
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

// CORS Middleware (Enable Only If Needed)
export async function handleRequest({ event, resolve }) {
  const response = await resolve(event);

  // Only set CORS headers for API routes
  if (event.url.pathname.startsWith('/auth')) {
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  return response;
}