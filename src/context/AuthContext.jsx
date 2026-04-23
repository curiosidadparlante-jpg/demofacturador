import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ id: 'demo-user', email: 'hola@commandsoluciones.com.ar' })
  const [loading, setLoading] = useState(false)

  const signIn = async (email, password) => {
    // Mock login
    return { user: { email } };
  }

  const signOut = async () => {
    // Mock logout
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
