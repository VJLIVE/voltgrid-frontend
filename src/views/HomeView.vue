<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import { API_BASE } from '@/lib/api'

const stats = [
  { value: '2,847', label: 'Charging Stations', sub: 'globally deployed' },
  { value: '94%', label: 'Network Uptime', sub: 'rolling 30 days' },
  { value: '138 MW', label: 'Peak Output', sub: 'across all nodes' },
  { value: '1.2M', label: 'Sessions / month', sub: 'and growing' },
]

const features = [
  {
    title: 'Real-Time Monitoring',
    desc: 'Track every station status, active sessions, and power draw from a single pane of glass.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
  },
  {
    title: 'Smart Geolocation',
    desc: 'Interactive map view with live charger markers, routing intelligence, and area coverage analysis.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
  },
  {
    title: 'Fleet Management',
    desc: 'Add, edit and decommission charging nodes with role-based access. Admins retain full control.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>`,
  },
  {
    title: 'Multi-Connector Support',
    desc: 'CCS, CHAdeMO, Type 2, and Tesla protocols - filter by connector type in real time.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
  },
  {
    title: 'Power Output Analytics',
    desc: 'Filter by kW tier - from 7kW AC home units to 350kW ultra-rapid DC hubs.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`,
  },
  {
    title: 'Role-Based Access',
    desc: 'Granular permissions - admin operators manage infrastructure while drivers get route visibility.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>`,
  },
]

// Staggered delay helper for feature cards
function featureDelay(index: number) {
  return index * 80
}

// ── Health check modal ────────────────────────────────────────────
type HealthStatus = 'idle' | 'checking' | 'online' | 'suspended'

const modalOpen = ref(false)
const healthStatus = ref<HealthStatus>('idle')
const waking = ref(false)
const countdown = ref(60)
let countdownTimer: ReturnType<typeof setInterval> | null = null

onUnmounted(() => { if (countdownTimer) clearInterval(countdownTimer) })

async function openHealthModal() {
  modalOpen.value = true
  await checkHealth()
}

function closeModal() {
  modalOpen.value = false
  healthStatus.value = 'idle'
  waking.value = false
  countdown.value = 60
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null }
}

async function checkHealth() {
  healthStatus.value = 'checking'
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(`${API_BASE}/api/health`, { signal: controller.signal })
    clearTimeout(timeout)
    healthStatus.value = res.ok ? 'online' : 'suspended'
  } catch {
    healthStatus.value = 'suspended'
  }
}

async function wakeServer() {
  waking.value = true
  countdown.value = 60
  // Start countdown
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer!)
      countdownTimer = null
    }
  }, 1000)
  // Keep pinging every 5s until online
  const poll = async () => {
    await checkHealth()
    if (healthStatus.value !== 'online' && countdown.value > 0) {
      setTimeout(poll, 5000)
    } else {
      waking.value = false
      if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null }
    }
  }
  setTimeout(poll, 5000)
}

onMounted(() => openHealthModal())
</script>

<template>
  <div class="min-h-screen bg-[#07090f] flex flex-col">
    <Navbar />

    <!-- Hero -->
    <section class="relative flex items-center justify-center min-h-screen overflow-hidden pt-16">
      <!-- Background grid -->
      <div
        class="absolute inset-0 opacity-40"
        style="background-image: linear-gradient(to right, #1e2d3d 1px, transparent 1px), linear-gradient(to bottom, #1e2d3d 1px, transparent 1px); background-size: 64px 64px;"
      ></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-600/8 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-20 right-20 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <!-- Status pill -->
        <div
          v-motion
          :initial="{ opacity: 0, y: -16 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 500, delay: 100 } }"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/25 bg-blue-500/8 text-blue-400 text-xs font-medium mb-8 tracking-wide"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
          Network Live · 2,847 stations operational
        </div>

        <h1
          v-motion
          :initial="{ opacity: 0, y: 32 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 650, delay: 200 } }"
          class="font-syne text-5xl md:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6"
        >
          Power the Grid.<br />
          <span class="text-blue-500">Charge the Future.</span>
        </h1>

        <p
          v-motion
          :initial="{ opacity: 0, y: 24 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 600, delay: 380 } }"
          class="text-lg md:text-xl text-slate-400 font-light max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          VoltGrid is a production-grade EV charging station management platform.
          Monitor, deploy, and scale your charging network with industrial precision.
        </p>

        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 550, delay: 520 } }"
          class="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <RouterLink
            to="/register"
            class="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-blue-600/20 text-sm"
          >
            Start Managing →
          </RouterLink>
          <RouterLink
            to="/map"
            class="w-full sm:w-auto px-8 py-4 border border-[#1e2d3d] hover:border-blue-500/40 text-slate-300 hover:text-white font-medium rounded-xl transition-all duration-200 text-sm"
          >
            View Live Map
          </RouterLink>
          <button
            @click="openHealthModal"
            class="w-full sm:w-auto px-8 py-4 border border-[#1e2d3d] hover:border-emerald-500/40 text-slate-400 hover:text-emerald-400 font-medium rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-400/60 animate-pulse"></span>
            Server Status
          </button>
        </div>

        <!-- Terminal block -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 28, scale: 0.97 }"
          :enter="{ opacity: 1, y: 0, scale: 1, transition: { duration: 600, delay: 680 } }"
          class="mt-16 max-w-xl mx-auto rounded-xl border border-[#1e2d3d] bg-[#0d1117] p-4 text-left font-mono text-xs hidden md:block"
        >
          <div class="flex items-center gap-1.5 mb-3">
            <div class="w-3 h-3 rounded-full bg-red-500/60"></div>
            <div class="w-3 h-3 rounded-full bg-amber-400/60"></div>
            <div class="w-3 h-3 rounded-full bg-emerald-400/60"></div>
            <span class="ml-2 text-slate-600 text-[10px]">voltgrid-cli</span>
          </div>
          <p class="text-slate-600"><span class="text-blue-400">$</span> voltgrid status --network all</p>
          <p class="text-emerald-400 mt-1">✓ 2847 stations online</p>
          <p class="text-slate-500 mt-0.5">  Peak load: 138 MW · Avg session: 28 min</p>
          <p class="text-blue-400 mt-0.5 animate-pulse">▎</p>
        </div>
      </div>
    </section>

    <!-- Stats bar -->
    <section class="border-t border-b border-[#1e2d3d] bg-[#0d1117]">
      <div class="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-[#1e2d3d]">
        <div
          v-for="(stat, i) in stats"
          :key="stat.label"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration: 500, delay: i * 100 } }"
          class="text-center px-4 first:pl-0 last:pr-0"
        >
          <p class="font-syne text-3xl md:text-4xl font-bold text-white mb-1">{{ stat.value }}</p>
          <p class="text-sm text-slate-300 font-medium">{{ stat.label }}</p>
          <p class="text-xs text-slate-600 mt-0.5">{{ stat.sub }}</p>
        </div>
      </div>
    </section>

    <!-- Features grid -->
    <section class="py-24 px-6">
      <div class="max-w-7xl mx-auto">
        <div
          v-motion
          :initial="{ opacity: 0, y: 24 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration: 550 } }"
          class="text-center mb-16"
        >
          <p class="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-3">Capabilities</p>
          <h2 class="font-syne text-3xl md:text-4xl font-bold text-white mb-4">Built for Scale</h2>
          <p class="text-slate-500 max-w-lg mx-auto text-sm leading-relaxed">
            Everything an EV network operator needs - from single-site installs to nationwide deployments.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="(feature, i) in features"
            :key="feature.title"
            v-motion
            :initial="{ opacity: 0, y: 32, scale: 0.97 }"
            :visible-once="{ opacity: 1, y: 0, scale: 1, transition: { duration: 480, delay: featureDelay(i) } }"
            class="group p-6 rounded-2xl border border-[#1e2d3d] bg-[#0d1117] hover:border-blue-500/30 hover:bg-[#0f1624] transition-all duration-300 cursor-default"
          >
            <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-blue-600/10 group-hover:bg-blue-600/20 transition-colors border border-blue-600/10 group-hover:border-blue-600/20">
              <!-- eslint-disable-next-line vue/no-v-html -->
              <span class="w-5 h-5 text-blue-400 [&>svg]:w-5 [&>svg]:h-5" v-html="feature.icon"></span>
            </div>
            <h3 class="font-syne font-bold text-white text-lg mb-2">{{ feature.title }}</h3>
            <p class="text-slate-500 text-sm leading-relaxed">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="px-6 pb-24">
      <div
        v-motion
        :initial="{ opacity: 0, y: 36, scale: 0.98 }"
        :visible-once="{ opacity: 1, y: 0, scale: 1, transition: { duration: 600 } }"
        class="max-w-5xl mx-auto rounded-2xl border border-blue-500/15 bg-gradient-to-br from-blue-600/10 via-[#0d1117] to-[#0d1117] p-12 md:p-16 text-center relative overflow-hidden"
      >
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-blue-600/15 blur-3xl"></div>
        <div class="relative z-10">
          <p
            v-motion
            :initial="{ opacity: 0, y: 12 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 450, delay: 150 } }"
            class="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-4"
          >
            Ready to deploy?
          </p>
          <h2
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 500, delay: 250 } }"
            class="font-syne text-3xl md:text-5xl font-bold text-white mb-4 leading-tight"
          >
            Start Managing Your<br />Charging Network
          </h2>
          <p
            v-motion
            :initial="{ opacity: 0 }"
            :visible-once="{ opacity: 1, transition: { duration: 500, delay: 380 } }"
            class="text-slate-400 mb-10 max-w-lg mx-auto text-sm leading-relaxed"
          >
            Join operators already running their infrastructure on VoltGrid.
            Real-time insights from day one.
          </p>
          <div
            v-motion
            :initial="{ opacity: 0, y: 16 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 480, delay: 460 } }"
            class="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <RouterLink
              to="/register"
              class="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-blue-600/25 text-sm"
            >
              Create Free Account →
            </RouterLink>
            <RouterLink
              to="/login"
              class="px-8 py-4 text-slate-400 hover:text-white transition-colors text-sm"
            >
              Already have an account?
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>

  <!-- Health Check Modal -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="closeModal"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

        <!-- Modal -->
        <div class="relative z-10 w-full max-w-md bg-[#0d1117] border border-[#1e2d3d] rounded-2xl p-6 shadow-2xl">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              <h3 class="font-syne font-bold text-white text-base">Backend Health Check</h3>
            </div>
            <button @click="closeModal" class="text-slate-500 hover:text-white transition-colors rounded-lg p-1 hover:bg-white/5">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Checking state -->
          <div v-if="healthStatus === 'checking'" class="flex flex-col items-center py-8 gap-4">
            <svg class="w-8 h-8 text-blue-400 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p class="text-slate-400 text-sm">Pinging server…</p>
          </div>

          <!-- Online state -->
          <div v-else-if="healthStatus === 'online'" class="flex flex-col items-center py-8 gap-4">
            <div class="w-16 h-16 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
              <svg class="w-8 h-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
            </div>
            <div class="text-center">
              <p class="text-emerald-400 font-syne font-bold text-lg">Server is Online</p>
              <p class="text-slate-500 text-sm mt-1">Backend is responding normally.</p>
            </div>
            <button @click="checkHealth" class="mt-2 px-5 py-2 rounded-lg border border-[#1e2d3d] text-slate-400 hover:text-white text-sm transition-colors">
              Re-check
            </button>
          </div>

          <!-- Suspended state -->
          <div v-else-if="healthStatus === 'suspended'" class="flex flex-col items-center py-6 gap-5">
            <div class="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
              <svg class="w-8 h-8 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
            </div>
            <div class="text-center">
              <p class="text-amber-400 font-syne font-bold text-lg">Server Suspended</p>
              <p class="text-slate-500 text-sm mt-1 leading-relaxed max-w-xs">
                The backend is currently spun down due to inactivity (Render free tier).
                Click below to wake it up - this may take up to a minute.
              </p>
            </div>

            <!-- Waking state -->
            <div v-if="waking" class="w-full">
              <!-- Countdown ring -->
              <div class="flex flex-col items-center gap-3">
                <div class="relative w-20 h-20">
                  <svg class="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#1e2d3d" stroke-width="6"/>
                    <circle
                      cx="40" cy="40" r="34" fill="none"
                      stroke="#f59e0b" stroke-width="6"
                      stroke-linecap="round"
                      :stroke-dasharray="213.6"
                      :stroke-dashoffset="213.6 * (1 - countdown / 60)"
                      class="transition-all duration-1000"
                    />
                  </svg>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <span class="font-syne font-bold text-amber-400 text-xl">{{ countdown }}</span>
                  </div>
                </div>
                <p class="text-slate-500 text-xs">Waking server… checking every 5 seconds</p>
              </div>
            </div>

            <!-- Wake button -->
            <button
              v-if="!waking"
              @click="wakeServer"
              class="w-full px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl transition-all duration-200 text-sm"
            >
              Wake Server →
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
