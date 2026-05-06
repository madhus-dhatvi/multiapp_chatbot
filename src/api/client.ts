import axios from 'axios';
import { storage } from '../utils/storage';

const apiClient = axios.create({
  baseURL: 'https://apigatway-4j3s.onrender.com',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    accept: '*/*',
  },
});

// Interceptor for adding token if available
apiClient.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
