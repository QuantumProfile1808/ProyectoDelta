import { createApi } from "@reduxjs/toolkit/query/react";
import { apiFetch } from "./client.js";
import { sessionExpired } from "../store/authSlice.js";

function withParams(path, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, value);
  });
  return query.size ? `${path}?${query}` : path;
}

export const bffApi = createApi({
  reducerPath: "bffApi",
  baseQuery: async (args, { signal, dispatch }) => {
    const { url, body, ...options } = typeof args === "string" ? { url: args } : args;
    try {
      return { data: await apiFetch(url, {
        ...options, signal,
        ...(body !== undefined ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}),
      }) };
    } catch (error) {
      if (error.status === 401) dispatch(sessionExpired());
      return { error: { status: error.status || "FETCH_ERROR", data: error.data, message: error.message } };
    }
  },
  tagTypes: ["Catalog", "Dashboard", "Categories", "Branches"],
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    getCatalog: builder.query({
      query: ({ sucursal: branchId, inactivos: inactive } = {}) =>
        withParams("/api/bff/catalogo/", { sucursal: branchId, inactivos: inactive }),
      providesTags: ["Catalog", "Categories"],
    }),
    getDashboard: builder.query({
      query: (branchId) => withParams("/api/bff/dashboard/", { sucursal: branchId }),
      providesTags: ["Dashboard"],
    }),
    getCategories: builder.query({
      query: () => "/api/categoria/",
      providesTags: ["Categories"],
    }),
    getBranches: builder.query({
      query: () => "/api/sucursal/",
      providesTags: ["Branches"],
    }),
    getAppliedDiscounts: builder.query({
      query: (items) => ({ url: "/api/descuento/aplicar/", method: "POST", body: { items } }),
      providesTags: ["Catalog"],
      keepUnusedDataFor: 0,
    }),
    createProduct: builder.mutation({
      query: (body) => ({ url: "/api/producto/", method: "POST", body }),
      invalidatesTags: ["Catalog", "Dashboard"],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/api/producto/${id}/`, method: "PATCH", body }),
      invalidatesTags: ["Catalog", "Dashboard"],
    }),
    createMovement: builder.mutation({
      query: (body) => ({ url: "/api/movimiento/", method: "POST", body }),
      invalidatesTags: ["Catalog", "Dashboard"],
    }),
    createCategory: builder.mutation({
      query: (body) => ({ url: "/api/categoria/", method: "POST", body }),
      invalidatesTags: ["Categories"],
    }),
    createBranch: builder.mutation({
      query: (body) => ({ url: "/api/sucursal/", method: "POST", body }),
      invalidatesTags: ["Branches"],
    }),
    importBackup: builder.mutation({
      query: (body) => ({ url: "/api/backup/importar/", method: "POST", body }),
      invalidatesTags: ["Catalog", "Dashboard", "Categories", "Branches"],
    }),
  }),
});

export const {
  useGetCatalogQuery, useGetDashboardQuery, useGetCategoriesQuery, useGetBranchesQuery,
  useCreateProductMutation, useUpdateProductMutation, useCreateMovementMutation,
  useCreateCategoryMutation, useCreateBranchMutation, useImportBackupMutation,
  useGetAppliedDiscountsQuery,
} = bffApi;
