<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="border-t border-[#1e2d3d] bg-[#0d1117] mt-auto">
    <div class="max-w-7xl mx-auto px-6 py-10">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <!-- Brand -->
        <div>
          <RouterLink to="/" class="flex items-center gap-2 mb-3">
            <div class="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
              <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span class="font-syne font-bold text-white">VoltGrid</span>
          </RouterLink>
          <p class="text-sm text-slate-500 leading-relaxed max-w-xs">
            Production-grade EV charging station management for operators who demand reliability.
          </p>
        </div>

        <!-- Platform links -->
        <div>
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Platform</p>
          <ul class="space-y-2">
            <li><RouterLink to="/" class="text-sm text-slate-400 hover:text-white transition-colors">Home</RouterLink></li>
            <li><RouterLink to="/dashboard" class="text-sm text-slate-400 hover:text-white transition-colors">Dashboard</RouterLink></li>
            <li><RouterLink to="/map" class="text-sm text-slate-400 hover:text-white transition-colors">Live Map</RouterLink></li>
          </ul>
        </div>

        <!-- Status -->
        <div>
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">System</p>
          <div class="flex items-center gap-2 mb-2">
            <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span class="text-sm text-slate-400">All systems operational</span>
          </div>
          <p class="text-xs text-slate-600">API v1.0 · Network uptime 99.97%</p>
        </div>
      </div>

      <div class="border-t border-[#1e2d3d] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p class="text-xs text-slate-600">© 2025 VoltGrid. All rights reserved.</p>
        <p class="text-xs text-slate-700">Built for EV infrastructure at scale.</p>
      </div>
    </div>
  </footer>
</template>
