import { apiSlice } from './api';

export interface NewsletterSubscriber {
  _id: string;
  email: string;
  active: boolean;
  createdAt: string;
}

export const newsletterApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    subscribeNewsletter: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: '/newsletter/subscribe', method: 'POST', body }),
      invalidatesTags: ['Newsletter'],
    }),
    getSubscribers: builder.query<NewsletterSubscriber[], void>({
      query: () => '/newsletter',
      providesTags: ['Newsletter'],
    }),
    getSubscriberCount: builder.query<{ count: number }, void>({
      query: () => '/newsletter/count',
      providesTags: ['Newsletter'],
    }),
    deleteSubscriber: builder.mutation<{ deleted: boolean }, string>({
      query: (id) => ({ url: `/newsletter/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Newsletter'],
    }),
  }),
});

export const {
  useSubscribeNewsletterMutation,
  useGetSubscribersQuery,
  useGetSubscriberCountQuery,
  useDeleteSubscriberMutation,
} = newsletterApi;
