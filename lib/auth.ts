import { NextAuthOptions, getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn:  '/login',
    signOut: '/',
    error:   '/auth/error',
  },
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user || !user.password) return null
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null
        return { id: String(user.id), name: user.name, email: user.email, image: user.avatarUrl ?? null }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google sign-in — upsert the user in our DB
      if (account?.provider === 'google' && user.email) {
        const existing = await prisma.user.findUnique({ where: { email: user.email } })
        if (!existing) {
          await prisma.user.create({
            data: {
              name:      user.name  ?? 'Member',
              email:     user.email,
              googleId:  user.id,
              avatarUrl: user.image ?? null,
              interests: '',
            },
          })
        } else if (!existing.googleId) {
          // Link Google to existing account
          await prisma.user.update({
            where: { id: existing.id },
            data:  { googleId: user.id, avatarUrl: existing.avatarUrl ?? user.image ?? null },
          })
        }
      }
      return true
    },

    async jwt({ token, user, account }) {
      if (user) {
        // Fetch our internal DB id
        if (account?.provider === 'google' && user.email) {
          const dbUser = await prisma.user.findUnique({ where: { email: user.email } })
          if (dbUser) token.id = String(dbUser.id)
        } else {
          token.id = user.id
        }
      }
      return token
    },

    async session({ session, token }) {
      if (token?.id) session.user.id = token.id as string
      return session
    },
  },
}

export const getSession = () => getServerSession(authOptions)
