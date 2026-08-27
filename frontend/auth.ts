import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || 'artic-dev-secret-change-me',
  session: {
    strategy: 'jwt',
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          scope: 'openid email profile',
        },
      },
    }),
  ],
  pages: {
    signIn: '/sign-in',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider !== 'google' || !user?.email) {
        return true;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: user.name,
            email: user.email,
            image: user.image,
            googleId: account.providerAccountId,
          }),
        });

        const payload = await response.json();
        if (!response.ok || !payload?.data?.accessToken) {
          return false;
        }

        (user as typeof user & { accessToken?: string; role?: string }).accessToken =
          payload.data.accessToken;
        (user as typeof user & { accessToken?: string; role?: string }).role =
          payload.data.user?.role || 'USER';

        return true;
      } catch {
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.role = (user as typeof user & { role?: string }).role || 'USER';
        token.accessToken = (user as typeof user & { accessToken?: string }).accessToken || '';
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || session.user.email || 'google-user';
        session.user.role = (token.role as string) || 'USER';
      }
      (session as typeof session & { accessToken?: string }).accessToken =
        (token.accessToken as string | undefined) || '';
      return session;
    },
  },
});
