import { SvelteKitAuth } from '@auth/sveltekit';
import Twitter from '@auth/core/providers/twitter';
import { TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET } from '$env/static/private';
import { supabase } from './supabase';

export const { handle, signIn, signOut } = SvelteKitAuth({
  providers: [
    Twitter({
      clientId: TWITTER_CLIENT_ID,
      clientSecret: TWITTER_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.id_str,
          name: profile.name,
          username: profile.screen_name,
          image: profile.profile_image_url_https
        };
      }
    })
  ],
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