import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface AuthUser {
  name: string
  email: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('voltgrid_token'))
  const user = ref<AuthUser | null>(
    JSON.parse(localStorage.getItem('voltgrid_user') || 'null'),
  )

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || 'Login failed')
    }
    const data = await res.json()
    token.value = data.token
    localStorage.setItem('voltgrid_token', data.token)

    try {
      const payload = JSON.parse(atob(data.token.split('.')[1]))
      const userData: AuthUser = {
        name: email.split('@')[0] ?? email,
        email,
        role: payload.role ?? 'driver',
      }
      user.value = userData
      localStorage.setItem('voltgrid_user', JSON.stringify(userData))
    } catch {
      // token decode failed — non-critical
    }
  }

  async function register(name: string, email: string, password: string, role: string) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || 'Registration failed')
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('voltgrid_token')
    localStorage.removeItem('voltgrid_user')
  }

  return { token, user, isAuthenticated, isAdmin, login, register, logout }
})
