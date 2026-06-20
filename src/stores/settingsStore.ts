import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  apiKey: string
  model: string
  storagePath: string
  setApiKey: (key: string) => void
  setModel: (model: string) => void
  setStoragePath: (path: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: '',
      model: 'deepseek-chat',
      storagePath: '',
      setApiKey: (key) => set({ apiKey: key }),
      setModel: (model) => set({ model }),
      setStoragePath: (path) => set({ storagePath: path }),
    }),
    {
      name: 'chillpass-settings',
    }
  )
)
