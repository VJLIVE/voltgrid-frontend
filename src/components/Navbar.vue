<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const mobileOpen = ref(false)

function logout() {
  auth.logout()
  mobileOpen.value = false
  router.push('/')
}
</script>

<template>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-[#07090f]/90 backdrop-blur-md border-b border-[#1e2d3d]">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-2.5 group">
        <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
          <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <span class="font-syne font-bold text-lg text-white tracking-tight">VoltGrid</span>
      </RouterLink>

      <!-- Desktop Nav -->
      <div class="hidden md:flex items-center gap-1">
        <RouterLink
          to="/"
          class="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
          active-class="text-white bg-white/5"
          exact-active-class="text-white"
        >
          Home
        </RouterLink>
        <template v-if="auth.isAuthenticated">
          <RouterLink
            to="/dashboard"
            class="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            active-class="text-white bg-white/5"
          >
            Dashboard
          </RouterLink>
          <RouterLink
            to="/map"
            class="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            active-class="text-white bg-white/5"
          >
            Map
          </RouterLink>
        </template>
      </div>

      <!-- Desktop Auth -->
      <div class="hidden md:flex items-center gap-3">
        <template v-if="auth.isAuthenticated">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-[#1e2d3d]">
            <div class="w-2 h-2 rounded-full bg-emerald-400"></div>
            <span class="text-sm text-slate-300 font-medium">{{ auth.user?.name }}</span>
            <span class="text-xs text-slate-600 bg-slate-700/50 px-2 py-0.5 rounded-full">{{ auth.user?.role }}</span>
          </div>
          <button
            @click="logout"
            class="px-4 py-2 text-sm text-slate-400 hover:text-red-400 border border-[#1e2d3d] hover:border-red-400/30 rounded-lg transition-all"
          >
            Logout
          </button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
            Sign In
          </RouterLink>
          <RouterLink
            to="/register"
            class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
          >
            Get Started
          </RouterLink>
        </template>
      </div>

      <!-- Mobile hamburger -->
      <button class="md:hidden p-2 text-slate-400" @click="mobileOpen = !mobileOpen">
        <svg v-if="!mobileOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Mobile menu -->
    <div v-if="mobileOpen" class="md:hidden border-t border-[#1e2d3d] bg-[#07090f] px-6 py-4 flex flex-col gap-2">
      <RouterLink to="/" @click="mobileOpen = false" class="px-4 py-2.5 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all">Home</RouterLink>
      <template v-if="auth.isAuthenticated">
        <RouterLink to="/dashboard" @click="mobileOpen = false" class="px-4 py-2.5 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all">Dashboard</RouterLink>
        <RouterLink to="/map" @click="mobileOpen = false" class="px-4 py-2.5 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all">Map</RouterLink>
        <div class="border-t border-[#1e2d3d] my-2"></div>
        <button @click="logout" class="px-4 py-2.5 text-sm text-red-400 text-left rounded-lg hover:bg-red-400/5 transition-all">Logout</button>
      </template>
      <template v-else>
        <RouterLink to="/login" @click="mobileOpen = false" class="px-4 py-2.5 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all">Sign In</RouterLink>
        <RouterLink to="/register" @click="mobileOpen = false" class="px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg text-center font-medium">Get Started</RouterLink>
      </template>
    </div>
  </nav>
</template>
