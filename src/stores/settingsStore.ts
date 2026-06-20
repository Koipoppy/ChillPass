import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  apiKey: string
  model: string
  storagePath: string
  githubToken: string
  setApiKey: (key: string) => void
  setModel: (model: string) => void
  setStoragePath: (path: string) => void
  setGithubToken: (token: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: '',
      model: 'deepseek-chat',
      storagePath: '',
      githubToken: '',
      setApiKey: (key) => set({ apiKey: key }),
      setModel: (model) => set({ model }),
      setStoragePath: (path) => set({ storagePath: path }),
      setGithubToken: (token) => set({ githubToken: token }),
    }),
    {
      name: 'chillpass-settings',
    }
  )
)
