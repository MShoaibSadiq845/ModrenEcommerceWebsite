import { apiSlice } from './api';

export const productsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params) => ({
        url: '/products',
        params,
      }),
      providesTags: ['Product'],
    }),
    getProductById: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    getCategories: builder.query({
      query: () => '/products/categories',
    }),
    createProduct: builder.mutation({
      query: (data) => ({
        url: '/products',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ['Product', { type: 'Product', id }],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
    toggleSale: builder.mutation({
      query: ({ id, isOnSale, salePrice }) => ({
        url: `/products/${id}/sale`,
        method: 'PUT',
        body: { isOnSale, salePrice },
      }),
      invalidatesTags: (result, error, { id }) => ['Product', { type: 'Product', id }],
    }),
    uploadProductImage: builder.mutation({
      query: (formData) => ({
        url: '/products/upload',
        method: 'POST',
        body: formData,
        formData: true,          // tells RTK Query: skip JSON serialisation, send as multipart
      }),
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetCategoriesQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useToggleSaleMutation,
  useUploadProductImageMutation,
} = productsApi;
