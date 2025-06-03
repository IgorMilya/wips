import { api } from './api'

export interface BlacklistedNetwork {
  id: string
  ssid: string
  bssid: string
}

export const blacklistApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBlacklist: builder.query<BlacklistedNetwork[], void>({
      query: () => '/blacklist',
      providesTags: ['Blacklist'],
    }),
    addBlacklist: builder.mutation<void, { ssid: string; bssid: string }>({
      query: (body) => ({
        url: '/blacklist',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Blacklist'],
    }),
    deleteBlacklist: builder.mutation<void, string>({
      query: (id) => ({
        url: `/blacklist/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Blacklist'],
    }),
  }),
})

export const { useGetBlacklistQuery, useAddBlacklistMutation, useDeleteBlacklistMutation } = blacklistApi

