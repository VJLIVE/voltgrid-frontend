import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'
import { API_BASE } from '@/lib/api'

export interface Station {
  id: number
  name: string
  latitude: number
  longitude: number
  address: string
  status: 'active' | 'inactive' | 'maintenance'
  powerOutput: number
  connectorType: string
  createdBy: number
  createdAt: string
}

export type StationPayload = Omit<Station, 'id' | 'createdBy' | 'createdAt'>

export const useStationsStore = defineStore('stations', () => {
  const stations = ref<Station[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  function authHeaders() {
    const auth = useAuthStore()
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth.token}`,
    }
  }

  async function fetchStations() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${API_BASE}/api/stations`, { headers: authHeaders() })
      if (!res.ok) throw new Error('Failed to fetch stations')
      stations.value = await res.json()
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  async function createStation(data: StationPayload) {
    const res = await fetch(`${API_BASE}/api/stations`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || 'Failed to create station')
    }
    await fetchStations()
  }

  async function updateStation(id: number, data: Partial<StationPayload>) {
    const res = await fetch(`${API_BASE}/api/stations/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || 'Failed to update station')
    }
    await fetchStations()
  }

  async function deleteStation(id: number) {
    const res = await fetch(`${API_BASE}/api/stations/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || 'Failed to delete station')
    }
    stations.value = stations.value.filter((s) => s.id !== id)
  }

  return {
    stations,
    loading,
    error,
    fetchStations,
    createStation,
    updateStation,
    deleteStation,
  }
})
