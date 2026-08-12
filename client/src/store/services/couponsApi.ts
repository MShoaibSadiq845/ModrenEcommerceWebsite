import { apiSlice } from './api';

export const couponsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCoupons: builder.query({
      query: () => '/coupons',
      providesTags: ['Order'],
    }),
    validateCoupon: builder.query({
      query: (code: string) => `/coupons/validate/${code}`,
    }),
    createCoupon: builder.mutation({
      query: (data: { code: string; discountPercentage: number; isActive?: boolean }) => ({
        url: '/coupons',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Order'],
    }),
    toggleCoupon: builder.mutation({
      query: (id: string) => ({
        url: `/coupons/${id}/toggle`,
        method: 'PUT',
      }),
      invalidatesTags: ['Order'],
    }),
    deleteCoupon: builder.mutation({
      query: (id: string) => ({
        url: `/coupons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useGetAllCouponsQuery,
  useValidateCouponQuery,
  useCreateCouponMutation,
  useToggleCouponMutation,
  useDeleteCouponMutation,
} = couponsApi;
