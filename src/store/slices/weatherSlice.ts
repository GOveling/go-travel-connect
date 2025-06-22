
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  location: {
    city: string;
    country: string;
    region: string;
  };
}

interface WeatherState {
  data: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: WeatherState = {
  data: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    setWeatherLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setWeatherData: (state, action: PayloadAction<WeatherData>) => {
      state.data = action.payload;
      state.isLoading = false;
      state.error = null;
      state.lastUpdated = Date.now();
    },
    setWeatherError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearWeatherData: (state) => {
      state.data = null;
      state.error = null;
      state.lastUpdated = null;
    },
    updateLocation: (state, action: PayloadAction<{ city: string; country: string; region: string }>) => {
      if (state.data) {
        state.data.location = action.payload;
      }
    },
  },
});

export const {
  setWeatherLoading,
  setWeatherData,
  setWeatherError,
  clearWeatherData,
  updateLocation,
} = weatherSlice.actions;
export default weatherSlice.reducer;
