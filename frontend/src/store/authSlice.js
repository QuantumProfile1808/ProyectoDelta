import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiFetch } from "../api/client";

async function fetchUserWithProfile(accessToken) {
  const userData = await apiFetch("/api-auth/users/me/", {
    headers: {
      Authorization: `JWT ${accessToken}`,
    },
  });

  const perfilData = await apiFetch(`/api/perfil/?user=${userData.id}`, {
    credentials: "include",
  });

  return {
    ...userData,
    perfil: Array.isArray(perfilData) ? perfilData[0] : perfilData,
  };
}

export const initializeUser = createAsyncThunk(
  "auth/initializeUser",
  async (_, { rejectWithValue }) => {
    try {
      let access = localStorage.getItem("token");
      const refresh = localStorage.getItem("refresh");

      if (!access) return null;

      try {
        return await fetchUserWithProfile(access);
      } catch (error) {
        if (!refresh || error.status !== 401) {
          throw error;
        }
      }

      const refreshed = await apiFetch("/api-auth/jwt/refresh/", {
        method: "POST",
        body: JSON.stringify({ refresh }),
      });

      access = refreshed.access;
      localStorage.setItem("token", access);

      return await fetchUserWithProfile(access);
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
      return rejectWithValue(error.message || "No se pudo iniciar la sesion");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const tokens = await apiFetch("/api-auth/jwt/create/", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      localStorage.setItem("token", tokens.access);
      localStorage.setItem("refresh", tokens.refresh);

      return await fetchUserWithProfile(tokens.access);
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  const refresh = localStorage.getItem("refresh");

  if (refresh) {
    try {
      await apiFetch("/api-auth/jwt/blacklist/", {
        method: "POST",
        body: JSON.stringify({ refresh }),
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  localStorage.removeItem("token");
  localStorage.removeItem("refresh");
});

const initialState = {
  user: null,
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(initializeUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = action.payload || action.error.message;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = action.payload || action.error.message;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
