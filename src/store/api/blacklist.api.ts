import { api } from './api'
import { BlacklistedNetworkType } from 'types'


const blacklistApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBlacklist: builder.query<BlacklistedNetworkType[], void>({
      query: () => '/blacklist',
      providesTags: ['Blacklist'],
    }),
    addBlacklist: builder.mutation<void, { ssid: string; bssid: string; reason?: string }>({
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

