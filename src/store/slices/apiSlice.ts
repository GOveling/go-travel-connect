import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ApiRequestState {
  [key: string]: {
    data: any;
    isLoading: boolean;
    error: string | null;
    lastUpdated: number | null;
  };
}

interface ApiState {
  requests: ApiRequestState;
}

const initialState: ApiState = {
  requests: {},
};

const apiSlice = createSlice({
  name: "api",
  initialState,
  reducers: {
    setApiLoading: (
      state,
      action: PayloadAction<{ key: string; loading: boolean }>
    ) => {
      const { key, loading } = action.payload;
      if (!state.requests[key]) {
        state.requests[key] = {
          data: null,
          isLoading: false,
          error: null,
          lastUpdated: null,
        };
      }
      state.requests[key].isLoading = loading;
    },
    setApiData: (state, action: PayloadAction<{ key: string; data: any }>) => {
      const { key, data } = action.payload;
      if (!state.requests[key]) {
        state.requests[key] = {
          data: null,
          isLoading: false,
          error: null,
          lastUpdated: null,
        };
      }
      state.requests[key].data = data;
      state.requests[key].isLoading = false;
      state.requests[key].error = null;
      state.requests[key].lastUpdated = Date.now();
    },
    setApiError: (
      state,
      action: PayloadAction<{ key: string; error: string }>
    ) => {
      const { key, error } = action.payload;
      if (!state.requests[key]) {
        state.requests[key] = {
          data: null,
          isLoading: false,
          error: null,
          lastUpdated: null,
        };
      }
      state.requests[key].error = error;
      state.requests[key].isLoading = false;
    },
    clearApiData: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      if (state.requests[key]) {
        delete state.requests[key];
      }
    },
  },
});

export const { setApiLoading, setApiData, setApiError, clearApiData } =
  apiSlice.actions;
export default apiSlice.reducer;
