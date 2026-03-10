<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import type { Map as LeafletMap, Marker, CircleMarker } from 'leaflet'
import Navbar from '@/components/Navbar.vue'
import { useStationsStore, type Station } from '@/stores/stations'

// Dynamic leaflet import to avoid SSR issues
let L: typeof import('leaflet') | null = null

const stationsStore = useStationsStore()
const mapEl = ref<HTMLDivElement | null>(null)
let map: LeafletMap | null = null
const markers = new Map<number, Marker | CircleMarker>()

const selectedStation = ref<Station | null>(null)
const sidebarOpen = ref(true)
const filterStatus = ref<'all' | 'active' | 'inactive' | 'maintenance'>('all')
const filterConnector = ref<'all' | 'CCS' | 'CHAdeMO' | 'Type 2' | 'Tesla'>('all')
const searchQuery = ref('')

const connectorTypes = ['all', 'CCS', 'CHAdeMO', 'Type 2', 'Tesla'] as const

const filteredStations = computed(() =>
  stationsStore.stations.filter((s) => {
    if (filterStatus.value !== 'all' && s.status !== filterStatus.value) return false
    if (filterConnector.value !== 'all' && s.connectorType !== filterConnector.value) return false
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      return s.name?.toLowerCase().includes(q) || s.address?.toLowerCase().includes(q)
    }
    return true
  }),
)

function markerColor(status: string) {
  if (status === 'active') return '#34d399'
  if (status === 'maintenance') return '#f59e0b'
  return '#64748b'
}

function createMarkerIcon(status: string) {
  if (!L) return undefined
  const color = markerColor(status)
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:28px;height:28px;">
        <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.15;animation:ping 1.5s ease-in-out infinite;"></div>
        <div style="position:absolute;inset:4px;border-radius:50%;background:${color};box-shadow:0 0 8px ${color}88;border:2px solid #07090f;"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  })
}

function buildPopupHTML(station: Station) {
  const color = markerColor(station.status)
  const statusLabel = station.status.charAt(0).toUpperCase() + station.status.slice(1)
  return `
    <div style="font-family:'DM Sans',sans-serif;background:#0d1117;border:1px solid #1e2d3d;border-radius:12px;padding:14px 16px;min-width:220px;color:#f1f5f9;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        <div style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;box-shadow:0 0 6px ${color};"></div>
        <strong style="font-size:14px;font-family:'Syne',sans-serif;">${station.name ?? 'Unknown'}</strong>
      </div>
      ${station.address ? `<p style="font-size:12px;color:#64748b;margin:0 0 10px;">${station.address}</p>` : ''}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
        <div style="background:#07090f;border:1px solid #1e2d3d;border-radius:8px;padding:8px;">
          <p style="font-size:10px;color:#475569;text-transform:uppercase;letter-spacing:.05em;margin:0 0 2px;">Status</p>
          <p style="font-size:13px;color:${color};margin:0;font-weight:500;">${statusLabel}</p>
        </div>
        <div style="background:#07090f;border:1px solid #1e2d3d;border-radius:8px;padding:8px;">
          <p style="font-size:10px;color:#475569;text-transform:uppercase;letter-spacing:.05em;margin:0 0 2px;">Output</p>
          <p style="font-size:13px;color:#f1f5f9;margin:0;font-weight:500;">${station.powerOutput ? station.powerOutput + ' kW' : '—'}</p>
        </div>
        <div style="background:#07090f;border:1px solid #1e2d3d;border-radius:8px;padding:8px;grid-column:span 2;">
          <p style="font-size:10px;color:#475569;text-transform:uppercase;letter-spacing:.05em;margin:0 0 2px;">Connector</p>
          <p style="font-size:13px;color:#f1f5f9;margin:0;font-weight:500;">${station.connectorType ?? '—'}</p>
        </div>
      </div>
    </div>
  `
}

function renderMarkers() {
  if (!map || !L) return

  const filteredIds = new Set(filteredStations.value.map((s) => s.id))

  // Remove markers for stations no longer in store
  markers.forEach((marker, id) => {
    if (!stationsStore.stations.find((s) => s.id === id)) {
      marker.remove()
      markers.delete(id)
    }
  })

  stationsStore.stations.forEach((station) => {
    const lat = station.latitude
    const lng = station.longitude
    if (!lat || !lng) return

    // Create marker if it doesn't exist yet
    if (!markers.has(station.id)) {
      const icon = createMarkerIcon(station.status)
      const marker = L!.marker([lat, lng], { icon })
        .bindPopup(buildPopupHTML(station), {
          className: 'voltgrid-popup',
          maxWidth: 280,
        })
        .on('click', () => {
          selectedStation.value = station
        })
      markers.set(station.id, marker)
    }

    // Show or hide based on active filters
    const marker = markers.get(station.id)!
    if (filteredIds.has(station.id)) {
      if (!map!.hasLayer(marker)) marker.addTo(map!)
    } else {
      if (map!.hasLayer(marker)) marker.remove()
    }
  })
}

function flyToStation(station: Station) {
  if (!map || !station.latitude || !station.longitude) return
  selectedStation.value = station
  map.flyTo([station.latitude, station.longitude], 15, { duration: 1 })
  markers.get(station.id)?.openPopup()
}

async function initMap() {
  if (!mapEl.value) return
  L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')

  map = L.map(mapEl.value, {
    center: [20, 0],
    zoom: 2,
    zoomControl: false,
  })

  // Dark CartoDB tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
  }).addTo(map)

  L.control.zoom({ position: 'bottomright' }).addTo(map)

  await stationsStore.fetchStations()
  renderMarkers()

  // Auto-fit bounds if stations exist
  const valid = stationsStore.stations.filter((s) => s.latitude && s.longitude)
  if (valid.length > 0) {
    const bounds = L.latLngBounds(valid.map((s) => [s.latitude, s.longitude] as [number, number]))
    map.fitBounds(bounds, { padding: [60, 60] })
  }
}

watch(filteredStations, renderMarkers, { deep: true })

onMounted(initMap)

onUnmounted(() => {
  map?.remove()
  map = null
})

function statusDot(status: string) {
  if (status === 'active') return 'bg-emerald-400'
  if (status === 'maintenance') return 'bg-amber-400'
  return 'bg-slate-500'
}

function statusText(status: string) {
  if (status === 'active') return 'text-emerald-400'
  if (status === 'maintenance') return 'text-amber-400'
  return 'text-slate-400'
}
</script>

<template>
  <div class="h-screen bg-[#07090f] flex flex-col overflow-hidden">
    <Navbar />

    <div class="flex flex-1 pt-16 overflow-hidden">
      <!-- Sidebar -->
      <aside
        :class="[
          'flex-shrink-0 bg-[#0d1117] border-r border-[#1e2d3d] flex flex-col transition-all duration-300 overflow-hidden',
          sidebarOpen ? 'w-80' : 'w-0'
        ]"
      >
        <div class="flex-1 flex flex-col overflow-hidden p-4 min-w-[320px]">
          <!-- Sidebar header -->
          <div class="mb-4">
            <h2 class="font-syne font-bold text-white text-base mb-3">Charging Network</h2>

            <!-- Search -->
            <div class="relative mb-3">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search stations…"
                class="w-full bg-[#07090f] border border-[#1e2d3d] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <!-- Filters row -->
            <div class="grid grid-cols-2 gap-2">
              <!-- Status dropdown -->
              <div>
                <label class="block text-[10px] text-slate-600 uppercase tracking-widest mb-1 font-semibold">Status</label>
                <div class="relative">
                  <select
                    v-model="filterStatus"
                    class="w-full appearance-none bg-[#07090f] border border-[#1e2d3d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer capitalize pr-7"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                  <svg class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>

              <!-- Connector dropdown -->
              <div>
                <label class="block text-[10px] text-slate-600 uppercase tracking-widest mb-1 font-semibold">Connector</label>
                <div class="relative">
                  <select
                    v-model="filterConnector"
                    class="w-full appearance-none bg-[#07090f] border border-[#1e2d3d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer pr-7"
                  >
                    <option value="all">All Types</option>
                    <option value="CCS">CCS</option>
                    <option value="CHAdeMO">CHAdeMO</option>
                    <option value="Type 2">Type 2</option>
                    <option value="Tesla">Tesla</option>
                  </select>
                  <svg class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats row -->
          <div class="grid grid-cols-3 gap-2 mb-4">
            <div class="bg-[#07090f] border border-[#1e2d3d] rounded-xl p-3 text-center">
              <p class="font-syne font-bold text-emerald-400 text-xl">{{ stationsStore.stations.filter(s => s.status === 'active').length }}</p>
              <p class="text-[10px] text-slate-600">Active</p>
            </div>
            <div class="bg-[#07090f] border border-[#1e2d3d] rounded-xl p-3 text-center">
              <p class="font-syne font-bold text-amber-400 text-xl">{{ stationsStore.stations.filter(s => s.status === 'maintenance').length }}</p>
              <p class="text-[10px] text-slate-600">Maint.</p>
            </div>
            <div class="bg-[#07090f] border border-[#1e2d3d] rounded-xl p-3 text-center">
              <p class="font-syne font-bold text-slate-400 text-xl">{{ stationsStore.stations.filter(s => s.status === 'inactive').length }}</p>
              <p class="text-[10px] text-slate-600">Offline</p>
            </div>
          </div>

          <!-- Station list -->
          <div class="flex-1 overflow-y-auto space-y-2 pr-1">
            <div v-if="stationsStore.loading" class="flex items-center justify-center py-10 text-slate-500 text-sm">
              <svg class="w-4 h-4 animate-spin mr-2" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Loading…
            </div>

            <button
              v-for="station in filteredStations"
              :key="station.id"
              @click="flyToStation(station)"
              :class="[
                'w-full text-left p-3.5 rounded-xl border transition-all',
                selectedStation?.id === station.id
                  ? 'border-blue-500/40 bg-blue-600/8'
                  : 'border-[#1e2d3d] hover:border-slate-600 bg-[#07090f]'
              ]"
            >
              <div class="flex items-center gap-2 mb-1">
                <div :class="['w-2 h-2 rounded-full flex-shrink-0', statusDot(station.status)]"></div>
                <span class="text-sm text-white font-medium truncate">{{ station.name }}</span>
              </div>
              <p class="text-xs text-slate-600 truncate pl-4">{{ station.address || `${station.latitude?.toFixed(3)}, ${station.longitude?.toFixed(3)}` }}</p>
              <div class="flex items-center gap-3 mt-2 pl-4">
                <span :class="['text-xs font-medium', statusText(station.status)]">{{ station.status }}</span>
                <span class="text-xs text-slate-600">{{ station.connectorType }}</span>
                <span class="text-xs text-slate-600">{{ station.powerOutput ? station.powerOutput + ' kW' : '' }}</span>
              </div>
            </button>

            <p v-if="!stationsStore.loading && filteredStations.length === 0" class="text-center text-slate-600 text-sm py-8">
              No stations match the filter.
            </p>
          </div>
        </div>
      </aside>

      <!-- Map + toggle button -->
      <div class="flex-1 relative">
        <!-- Toggle sidebar button -->
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="absolute top-4 left-4 z-[1000] w-9 h-9 bg-[#0d1117] border border-[#1e2d3d] rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/40 transition-all shadow-lg"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path v-if="sidebarOpen" stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
            <path v-else stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
          </svg>
        </button>

        <!-- Station count chip -->
        <div class="absolute top-4 right-4 z-[1000] flex items-center gap-2 px-3 py-1.5 bg-[#0d1117]/90 backdrop-blur-sm border border-[#1e2d3d] rounded-full text-xs text-slate-400 shadow-lg">
          <span class="w-2 h-2 rounded-full bg-blue-500"></span>
          {{ stationsStore.stations.length }} stations on map
        </div>

        <!-- Leaflet map container -->
        <div ref="mapEl" class="w-full h-full"></div>

      </div>
    </div>
  </div>
</template>

<style>
@keyframes ping {
  0%, 100% { transform: scale(1); opacity: 0.15; }
  50% { transform: scale(1.8); opacity: 0; }
}
.voltgrid-popup .leaflet-popup-content-wrapper {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
}
.voltgrid-popup .leaflet-popup-content {
  margin: 0;
}
.voltgrid-popup .leaflet-popup-tip-container {
  display: none;
}
</style>
