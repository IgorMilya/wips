import { api } from './api'
import { invoke } from '@tauri-apps/api/core'

export interface BlacklistedNetwork {
  _id: string
  ssid: string
  bssid: string
}

export const blacklistApi = api.injectEndpoints({
  endpoints: builder => ({
    getBlacklist: builder.query<BlacklistedNetwork[], void>({
      // ✅ Actual call to Tauri command using invoke()
      async queryFn() {
        try {
          const result = await invoke<BlacklistedNetwork[]>('get_blacklist')
          return { data: result }
        } catch (err) {
          return { error: err as any }
        }
      },
    }),
  }),
})

export const { useGetBlacklistQuery } = blacklistApi
