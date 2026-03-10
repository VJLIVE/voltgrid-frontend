<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'

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
    desc: 'CCS, CHAdeMO, Type 2, and Tesla protocols — filter by connector type in real time.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
  },
  {
    title: 'Power Output Analytics',
    desc: 'Filter by kW tier — from 7kW AC home units to 350kW ultra-rapid DC hubs.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`,
  },
  {
    title: 'Role-Based Access',
    desc: 'Granular permissions — admin operators manage infrastructure while drivers get route visibility.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>`,
  },
]

// Staggered delay helper for feature cards
function featureDelay(index: number) {
  return index * 80
}
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
            Everything an EV network operator needs — from single-site installs to nationwide deployments.
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
</template>
