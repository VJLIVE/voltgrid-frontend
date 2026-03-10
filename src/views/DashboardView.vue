<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Navbar from '@/components/Navbar.vue'
import { useStationsStore, type Station, type StationPayload } from '@/stores/stations'
import { useAuthStore } from '@/stores/auth'

const stationsStore = useStationsStore()
const auth = useAuthStore()

// Filters
const filterStatus = ref<'all' | 'active' | 'inactive' | 'maintenance'>('all')
const filterConnector = ref('all')
const filterPower = ref('all')
const searchQuery = ref('')

const connectorTypes = ['all', 'CCS', 'CHAdeMO', 'Type 2', 'Tesla']
const powerTiers = [
  { label: 'All', value: 'all' },
  { label: 'Up to 50 kW', value: '0-50' },
  { label: '50 – 150 kW', value: '50-150' },
  { label: '150+ kW', value: '150+' },
]

const filteredStations = computed(() => {
  return stationsStore.stations.filter((s) => {
    if (filterStatus.value !== 'all' && s.status !== filterStatus.value) return false
    if (filterConnector.value !== 'all' && s.connectorType !== filterConnector.value) return false
    if (filterPower.value !== 'all') {
      const kw = s.powerOutput ?? 0
      if (filterPower.value === '0-50' && kw > 50) return false
      if (filterPower.value === '50-150' && (kw <= 50 || kw > 150)) return false
      if (filterPower.value === '150+' && kw <= 150) return false
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      return (
        s.name?.toLowerCase().includes(q) ||
        s.address?.toLowerCase().includes(q) ||
        s.connectorType?.toLowerCase().includes(q)
      )
    }
    return true
  })
})

const statusCounts = computed(() => ({
  all: stationsStore.stations.length,
  active: stationsStore.stations.filter((s) => s.status === 'active').length,
  inactive: stationsStore.stations.filter((s) => s.status === 'inactive').length,
  maintenance: stationsStore.stations.filter((s) => s.status === 'maintenance').length,
}))

// Modal
const showModal = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const editingId = ref<number | null>(null)
const modalError = ref('')
const modalLoading = ref(false)

const emptyForm = (): StationPayload => ({
  name: '',
  latitude: 0,
  longitude: 0,
  address: '',
  status: 'active',
  powerOutput: 50,
  connectorType: 'CCS',
})

const form = ref<StationPayload>(emptyForm())

function openAdd() {
  modalMode.value = 'add'
  editingId.value = null
  form.value = emptyForm()
  modalError.value = ''
  showModal.value = true
}

function openEdit(station: Station) {
  modalMode.value = 'edit'
  editingId.value = station.id
  form.value = {
    name: station.name,
    latitude: station.latitude,
    longitude: station.longitude,
    address: station.address ?? '',
    status: station.status,
    powerOutput: station.powerOutput,
    connectorType: station.connectorType,
  }
  modalError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  modalError.value = ''
}

async function submitForm() {
  if (!form.value.name || !form.value.connectorType) {
    modalError.value = 'Name and connector type are required.'
    return
  }
  if (!form.value.latitude || !form.value.longitude) {
    modalError.value = 'Valid latitude and longitude are required.'
    return
  }
  modalLoading.value = true
  modalError.value = ''
  try {
    if (modalMode.value === 'add') {
      await stationsStore.createStation(form.value)
    } else if (editingId.value !== null) {
      await stationsStore.updateStation(editingId.value, form.value)
    }
    closeModal()
  } catch (e: unknown) {
    modalError.value = e instanceof Error ? e.message : 'Operation failed.'
  } finally {
    modalLoading.value = false
  }
}

// Delete
const deleteId = ref<number | null>(null)
const deleteLoading = ref(false)

function confirmDelete(id: number) {
  deleteId.value = id
}

async function doDelete() {
  if (deleteId.value === null) return
  deleteLoading.value = true
  try {
    await stationsStore.deleteStation(deleteId.value)
    deleteId.value = null
  } catch {
    // handle silently — store will preserve state
  } finally {
    deleteLoading.value = false
  }
}

onMounted(() => stationsStore.fetchStations())

function statusClass(status: string) {
  if (status === 'active') return 'badge-active'
  if (status === 'maintenance') return 'badge-maintenance'
  return 'badge-inactive'
}

function statusDot(status: string) {
  if (status === 'active') return 'bg-emerald-400'
  if (status === 'maintenance') return 'bg-amber-400'
  return 'bg-slate-500'
}
</script>

<template>
  <div class="min-h-screen bg-[#07090f] flex flex-col">
    <Navbar />

    <main class="flex-1 pt-16">
      <div class="max-w-7xl mx-auto px-6 py-10">
        <!-- Page header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 class="font-syne text-2xl md:text-3xl font-bold text-white mb-1">Charging Stations</h1>
            <p class="text-sm text-slate-500">
              {{ stationsStore.stations.length }} stations total ·
              <span class="text-emerald-400">{{ statusCounts.active }} active</span>
            </p>
          </div>
          <button
            v-if="auth.isAdmin"
            @click="openAdd"
            class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-blue-600/20"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Add Station
          </button>
        </div>

        <!-- Status tabs + filters -->
        <div class="flex flex-col lg:flex-row gap-4 mb-6">
          <!-- Status tabs -->
          <div class="flex items-center gap-1 bg-[#0d1117] border border-[#1e2d3d] rounded-xl p-1">
            <button
              v-for="tab in (['all', 'active', 'inactive', 'maintenance'] as const)"
              :key="tab"
              @click="filterStatus = tab"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize',
                filterStatus === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              ]"
            >
              {{ tab }}
              <span class="ml-1.5 text-xs opacity-60">{{ statusCounts[tab] }}</span>
            </button>
          </div>

          <!-- Right filters -->
          <div class="flex flex-wrap items-center gap-3 flex-1">
            <!-- Search -->
            <div class="relative flex-1 min-w-[180px]">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search stations…"
                class="w-full bg-[#0d1117] border border-[#1e2d3d] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <!-- Connector filter -->
            <select
              v-model="filterConnector"
              class="bg-[#0d1117] border border-[#1e2d3d] rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option v-for="c in connectorTypes" :key="c" :value="c">
                {{ c === 'all' ? 'All Connectors' : c }}
              </option>
            </select>

            <!-- Power filter -->
            <select
              v-model="filterPower"
              class="bg-[#0d1117] border border-[#1e2d3d] rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option v-for="tier in powerTiers" :key="tier.value" :value="tier.value">
                {{ tier.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="stationsStore.loading" class="flex items-center justify-center py-24">
          <div class="flex items-center gap-3 text-slate-400">
            <svg class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Loading stations…
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="stationsStore.error" class="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {{ stationsStore.error }}
          <button @click="stationsStore.fetchStations()" class="ml-3 underline text-red-300">Retry</button>
        </div>

        <!-- Empty state -->
        <div v-else-if="filteredStations.length === 0 && !stationsStore.loading" class="flex flex-col items-center justify-center py-24 text-center">
          <div class="w-16 h-16 rounded-2xl bg-[#0d1117] border border-[#1e2d3d] flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <p class="text-slate-400 font-medium mb-1">No stations found</p>
          <p class="text-slate-600 text-sm">
            {{ stationsStore.stations.length === 0 ? 'Add your first charging station to get started.' : 'Try adjusting your filters.' }}
          </p>
        </div>

        <!-- Station grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <div
            v-for="station in filteredStations"
            :key="station.id"
            class="group bg-[#0d1117] border border-[#1e2d3d] rounded-2xl p-5 hover:border-blue-500/25 transition-all duration-300"
          >
            <!-- Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1 min-w-0 pr-3">
                <h3 class="font-syne font-bold text-white text-base truncate">{{ station.name }}</h3>
                <p class="text-xs text-slate-500 mt-0.5 truncate">{{ station.address || `${station.latitude}, ${station.longitude}` }}</p>
              </div>
              <span :class="statusClass(station.status)">
                <span :class="['w-1.5 h-1.5 rounded-full', statusDot(station.status)]"></span>
                {{ station.status }}
              </span>
            </div>

            <!-- Details grid -->
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="bg-[#07090f] rounded-xl p-3 border border-[#1e2d3d]">
                <p class="text-[10px] text-slate-600 uppercase tracking-wider mb-1">Connector</p>
                <p class="text-sm text-white font-medium">{{ station.connectorType || '—' }}</p>
              </div>
              <div class="bg-[#07090f] rounded-xl p-3 border border-[#1e2d3d]">
                <p class="text-[10px] text-slate-600 uppercase tracking-wider mb-1">Output</p>
                <p class="text-sm text-white font-medium">{{ station.powerOutput ? `${station.powerOutput} kW` : '—' }}</p>
              </div>
              <div class="bg-[#07090f] rounded-xl p-3 border border-[#1e2d3d]">
                <p class="text-[10px] text-slate-600 uppercase tracking-wider mb-1">Latitude</p>
                <p class="text-sm text-slate-300 font-mono">{{ station.latitude?.toFixed(4) }}</p>
              </div>
              <div class="bg-[#07090f] rounded-xl p-3 border border-[#1e2d3d]">
                <p class="text-[10px] text-slate-600 uppercase tracking-wider mb-1">Longitude</p>
                <p class="text-sm text-slate-300 font-mono">{{ station.longitude?.toFixed(4) }}</p>
              </div>
            </div>

            <!-- Actions (admin only) -->
            <div v-if="auth.isAdmin" class="flex items-center gap-2 pt-3 border-t border-[#1e2d3d]">
              <button
                @click="openEdit(station)"
                class="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-slate-400 hover:text-blue-400 border border-[#1e2d3d] hover:border-blue-500/30 rounded-lg transition-all"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Edit
              </button>
              <button
                @click="confirmDelete(station.id)"
                class="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-slate-400 hover:text-red-400 border border-[#1e2d3d] hover:border-red-500/30 rounded-lg transition-all"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal"></div>

        <div class="relative z-10 w-full max-w-lg bg-[#0d1117] border border-[#1e2d3d] rounded-2xl p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <h2 class="font-syne text-xl font-bold text-white">
              {{ modalMode === 'add' ? 'Add Station' : 'Edit Station' }}
            </h2>
            <button @click="closeModal" class="text-slate-500 hover:text-white transition-colors">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div v-if="modalError" class="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {{ modalError }}
          </div>

          <form @submit.prevent="submitForm" class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Station Name</label>
              <input v-model="form.name" type="text" placeholder="Downtown Fast Charge Hub" class="input-dark" />
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Address</label>
              <input v-model="form.address" type="text" placeholder="123 Main St, City, Country" class="input-dark" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Latitude</label>
                <input v-model.number="form.latitude" type="number" step="any" placeholder="51.5074" class="input-dark" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Longitude</label>
                <input v-model.number="form.longitude" type="number" step="any" placeholder="-0.1278" class="input-dark" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Connector Type</label>
                <select v-model="form.connectorType" class="input-dark cursor-pointer">
                  <option v-for="c in ['CCS', 'CHAdeMO', 'Type 2', 'Tesla']" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Power Output (kW)</label>
                <input v-model.number="form.powerOutput" type="number" min="1" max="1000" placeholder="150" class="input-dark" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Status</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  v-for="s in ['active', 'inactive', 'maintenance']"
                  :key="s"
                  @click="form.status = s as 'active' | 'inactive' | 'maintenance'"
                  :class="[
                    'py-2.5 rounded-xl text-xs font-medium border transition-all capitalize',
                    form.status === s
                      ? s === 'active' ? 'bg-emerald-400/15 border-emerald-400/50 text-emerald-400'
                        : s === 'maintenance' ? 'bg-amber-400/15 border-amber-400/50 text-amber-400'
                        : 'bg-slate-500/15 border-slate-500/50 text-slate-300'
                      : 'border-[#1e2d3d] text-slate-500 hover:border-slate-600'
                  ]"
                >
                  {{ s }}
                </button>
              </div>
            </div>

            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="closeModal"
                class="flex-1 py-3 border border-[#1e2d3d] hover:border-slate-600 text-slate-400 hover:text-white text-sm rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="modalLoading"
                class="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <svg v-if="modalLoading" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {{ modalLoading ? 'Saving...' : modalMode === 'add' ? 'Add Station' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="deleteId !== null" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="deleteId = null"></div>
        <div class="relative z-10 w-full max-w-sm bg-[#0d1117] border border-[#1e2d3d] rounded-2xl p-6 shadow-2xl">
          <div class="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h3 class="font-syne font-bold text-white text-lg mb-2">Delete Station</h3>
          <p class="text-slate-500 text-sm mb-6">This action cannot be undone. The station will be permanently removed.</p>
          <div class="flex gap-3">
            <button
              @click="deleteId = null"
              class="flex-1 py-2.5 border border-[#1e2d3d] hover:border-slate-600 text-slate-400 text-sm rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              @click="doDelete"
              :disabled="deleteLoading"
              class="flex-1 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <svg v-if="deleteLoading" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ deleteLoading ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
