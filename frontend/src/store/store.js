import { configureStore, createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer, { loginUser, logoutUser, sessionExpired } from "./authSlice.js";
import { bffApi } from "../api/bffApi.js";
import { clearTokens } from "../api/client.js";

export function createAppStore() {
  const listener = createListenerMiddleware();
  listener.startListening({
    matcher: isAnyOf(loginUser.pending, logoutUser.pending, sessionExpired),
    effect: (action, { dispatch }) => {
      if (!logoutUser.pending.match(action)) clearTokens();
      dispatch(bffApi.util.getRunningQueriesThunk()).forEach((query) => query.abort());
      dispatch(bffApi.util.getRunningMutationsThunk()).forEach((mutation) => mutation.abort());
      dispatch(bffApi.util.resetApiState());
    },
  });
  return configureStore({
    reducer: { auth: authReducer, [bffApi.reducerPath]: bffApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware()
      .prepend(listener.middleware).concat(bffApi.middleware),
  });
}

export const store = createAppStore();
setupListeners(store.dispatch);