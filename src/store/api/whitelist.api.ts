import { api } from './api'
import { WhitelistedNetworkType } from 'types'


const whitelistApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWhitelist: builder.query<WhitelistedNetworkType[], void>({
      query: () => '/whitelist',
      providesTags: ['Whitelist'],
    }),
    addWhitelist: builder.mutation<void, { ssid: string; bssid: string }>({
      query: (body) => ({
        url: '/whitelist',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Whitelist'],
    }),
    deleteWhitelist: builder.mutation<void, string>({
      query: (id) => ({
        url: `/whitelist/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Whitelist'],
    }),
  }),
})

export const { useGetWhitelistQuery, useDeleteWhitelistMutation, useAddWhitelistMutation } = whitelistApi

