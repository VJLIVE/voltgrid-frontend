<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)

async function submit() {
  if (!name.value || !email.value || !password.value) {
    error.value = 'Please fill in all fields.'
    return
  }
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters.'
    return
  }
  error.value = ''
  loading.value = true
  try {
    await auth.register(name.value, email.value, password.value, 'driver')
    // Auto-login after registration
    await auth.login(email.value, password.value)
    router.push('/dashboard')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#07090f] flex flex-col">
    <!-- Background -->
    <div
      class="fixed inset-0 opacity-30 pointer-events-none"
      style="background-image: linear-gradient(to right, #1e2d3d 1px, transparent 1px), linear-gradient(to bottom, #1e2d3d 1px, transparent 1px); background-size: 64px 64px;"
    ></div>
    <div class="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-72 bg-blue-600/8 blur-3xl rounded-full pointer-events-none"></div>

    <div class="relative z-10 flex flex-col min-h-screen">
      <!-- Top bar -->
      <div class="px-6 py-5 flex items-center justify-between border-b border-[#1e2d3d]">
        <RouterLink to="/" class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
            <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span class="font-syne font-bold text-white text-sm">VoltGrid</span>
        </RouterLink>
        <RouterLink to="/login" class="text-sm text-slate-500 hover:text-white transition-colors">
          Have an account? <span class="text-blue-400">Sign in →</span>
        </RouterLink>
      </div>

      <!-- Main -->
      <div class="flex-1 flex items-center justify-center px-4 py-16">
        <div class="w-full max-w-md">
          <div class="mb-8">
            <h1 class="font-syne text-3xl font-bold text-white mb-2">Create your account</h1>
            <p class="text-slate-500 text-sm">Join VoltGrid and start managing your charging network.</p>
          </div>

          <div class="bg-[#0d1117] border border-[#1e2d3d] rounded-2xl p-8">
            <form @submit.prevent="submit" class="space-y-5" novalidate>
              <!-- Error -->
              <div v-if="error" class="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <svg class="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path fill-rule="evenodd" d="M18.364 5.636A9 9 0 105.636 18.364 9 9 0 0018.364 5.636zM12 8a1 1 0 011 1v4a1 1 0 11-2 0V9a1 1 0 011-1zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                </svg>
                {{ error }}
              </div>

              <!-- Name -->
              <div>
                <label class="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Full Name</label>
                <input
                  v-model="name"
                  type="text"
                  placeholder="Jane Operator"
                  autocomplete="name"
                  class="input-dark"
                />
              </div>

              <!-- Email -->
              <div>
                <label class="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Email</label>
                <input
                  v-model="email"
                  type="email"
                  placeholder="jane@company.com"
                  autocomplete="email"
                  class="input-dark"
                />
              </div>

              <!-- Password -->
              <div>
                <label class="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Password</label>
                <div class="relative">
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Min. 6 characters"
                    autocomplete="new-password"
                    class="input-dark pr-12"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                    tabindex="-1"
                  >
                    <svg v-if="!showPassword" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Submit -->
              <button
                type="submit"
                :disabled="loading"
                class="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/20 flex items-center justify-center gap-2 text-sm"
              >
                <svg v-if="loading" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {{ loading ? 'Creating account...' : 'Create Account' }}
              </button>
            </form>
          </div>

          <p class="text-center text-sm text-slate-600 mt-6">
            Already have an account?
            <RouterLink to="/login" class="text-blue-400 hover:text-blue-300 transition-colors ml-1">Sign in</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
