import { apiSlice } from './api';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  avatar?: string;
}

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: () => '/users',
      providesTags: ['User'],
    }),

    getUserById: builder.query({
      query: (id: string) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    // Update name / phone
    updateProfile: builder.mutation<any, UpdateProfilePayload>({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Upload avatar image (multipart) → Cloudinary → saves URL to DB
    uploadAvatar: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: '/users/avatar',
        method: 'POST',
        body: formData,
        // Don't set Content-Type — browser sets multipart boundary automatically
        formData: true,
      }),
      invalidatesTags: ['User'],
    }),

    // Save / update shipping address
    updateShippingAddress: builder.mutation<any, ShippingAddress>({
      query: (data) => ({
        url: '/users/shipping-address',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    updateUserRole: builder.mutation({
      query: ({ id, role }: { id: string; role: string }) => ({
        url: `/users/${id}/role`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: ['User'],
    }),

    deleteUser: builder.mutation({
      query: (id: string) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useUpdateShippingAddressMutation,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} = usersApi;
