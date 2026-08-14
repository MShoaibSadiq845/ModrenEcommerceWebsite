import { apiSlice } from './api';

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  adminReply: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const contactApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* Public — submit a contact message */
    submitContact: builder.mutation<ContactMessage, {
      name: string;
      email: string;
      subject: string;
      message: string;
    }>({
      query: (body) => ({ url: '/contact', method: 'POST', body }),
      invalidatesTags: ['Contact'],
    }),

    /* Admin — get all messages */
    getContactMessages: builder.query<ContactMessage[], void>({
      query: () => '/contact',
      providesTags: ['Contact'],
    }),

    /* Admin — unread count */
    getContactUnreadCount: builder.query<{ count: number }, void>({
      query: () => '/contact/unread-count',
      providesTags: ['Contact'],
    }),

    /* Admin — mark as read */
    markContactRead: builder.mutation<ContactMessage, string>({
      query: (id) => ({ url: `/contact/${id}/read`, method: 'PUT' }),
      invalidatesTags: ['Contact'],
    }),

    /* Admin — reply by email */
    replyContact: builder.mutation<ContactMessage, { id: string; reply: string }>({
      query: ({ id, reply }) => ({
        url: `/contact/${id}/reply`,
        method: 'POST',
        body: { reply },
      }),
      invalidatesTags: ['Contact'],
    }),

    /* Admin — delete */
    deleteContact: builder.mutation<{ deleted: boolean }, string>({
      query: (id) => ({ url: `/contact/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Contact'],
    }),
  }),
});

export const {
  useSubmitContactMutation,
  useGetContactMessagesQuery,
  useGetContactUnreadCountQuery,
  useMarkContactReadMutation,
  useReplyContactMutation,
  useDeleteContactMutation,
} = contactApi;
