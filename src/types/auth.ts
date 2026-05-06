export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  message: string;
}

export interface LogoutResponse {
  message: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
}
