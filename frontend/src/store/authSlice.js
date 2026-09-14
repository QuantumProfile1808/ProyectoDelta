import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiFetch, clearTokens, saveTokens } from "../api/client.js";

export const initializeUser = createAsyncThunk(
  "auth/initializeUser",
  async (_, { rejectWithValue }) => {
    if (!localStorage.getItem("token") && !localStorage.getItem("refresh")) return null;
    try {
      const session = await apiFetch("/api/bff/session/");
      return session.user;
    } catch (error) {
      if (error.status === 401) clearTokens();
      return rejectWithValue(error.message);
    }
  },
  { condition: (_, { getState }) => !getState().auth.requestId && !getState().auth.initialized }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ username, password }, { rejectWithValue, getState, requestId }) => {
    try {
      const tokens = await apiFetch("/api-auth/jwt/create/", {
        auth: false,
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      if (getState().auth.requestId !== requestId) return null;
      saveTokens(tokens);
      const session = await apiFetch("/api/bff/session/");
      return session.user;
    } catch (error) {
      if (getState().auth.requestId === requestId) clearTokens();
      return rejectWithValue(error.message || "No se pudo iniciar la sesion.");
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  const refresh = localStorage.getItem("refresh");
  clearTokens();
  if (refresh) {
    try {
      await apiFetch("/api-auth/jwt/blacklist/", {
        auth: false,
        method: "POST",
        body: JSON.stringify({ refresh }),
      });
    } catch {
      // Local logout is complete even when the server is unavailable.
    }
  }
});

const initialState = {
  user: null,
  loading: true,
  initialized: false,
  requestId: null,
  error: null,
};

const resetSession = (state) => {
  state.user = null;
  state.loading = false;
  state.initialized = true;
  state.requestId = null;
  state.error = null;
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) { state.error = null; },
    sessionExpired: resetSession,
  },
  extraReducers: (builder) => {
    for (const thunk of [initializeUser, loginUser]) {
      builder
        .addCase(thunk.pending, (state, action) => {
          state.loading = true;
          state.error = null;
          state.requestId = action.meta.requestId;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          if (state.requestId !== action.meta.requestId) return;
          state.loading = false;
          state.initialized = true;
          state.requestId = null;
          state.user = action.payload;
        })
        .addCase(thunk.rejected, (state, action) => {
          if (state.requestId !== action.meta.requestId) return;
          resetSession(state);
          state.error = action.payload || action.error.message;
        });
    }
    builder.addCase(logoutUser.pending, resetSession);
  },
});

export const { clearAuthError, sessionExpired } = authSlice.actions;
export default authSlice.reducer;