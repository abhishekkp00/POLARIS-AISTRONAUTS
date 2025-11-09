'use client'

import { AuthProvider as AuthProviderBase } from './AuthContext'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProviderBase>{children}</AuthProviderBase>
}
