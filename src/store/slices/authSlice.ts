import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserPayload {
  sub: string;
  appId: string;
  role: string;
  fullName: string;
  iat: number;
  exp: number;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: UserPayload | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: UserPayload }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
