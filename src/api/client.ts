import axios from 'axios';
import { storage } from '../utils/storage';

const apiClient = axios.create({
  baseURL: 'https://chatbot-service-eb2k.onrender.com',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    accept: '*/*',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (
    config.url?.includes('/rider/api/chat/start') ||
    config.url?.includes('/rider/api/faq/answer')
  ) {
    console.log(
      '[REQ DUMP]',
      config.method?.toUpperCase(),
      `${config.baseURL || ''}${config.url || ''}`,
      'params=',
      config.params,
      'headers=',
      JSON.stringify(config.headers),
      'body=',
      JSON.stringify(config.data),
    );
  }
  return config;
});

apiClient.interceptors.response.use(
  response => {
    if (
      response.config.url?.includes('/rider/api/chat/start') ||
      response.config.url?.includes('/rider/api/faq/answer')
    ) {
      const setCookie =
        (response.headers as any)?.['set-cookie'] ||
        (response.headers as any)?.['Set-Cookie'];
      console.log(
        '[RES HEADERS]',
        response.config.url,
        'set-cookie=',
        setCookie,
        'all-headers=',
        JSON.stringify(response.headers),
      );
    }
    return response;
  },
  error => {
    if (axios.isAxiosError(error)) {
      const cfg = error.config;
      const method = cfg?.method?.toUpperCase();
      const url = cfg?.baseURL && cfg?.url ? `${cfg.baseURL}${cfg.url}` : cfg?.url;
      console.error(
        '[API ERROR]',
        method,
        url,
        'params=',
        cfg?.params,
        'status=',
        error.response?.status,
        'data=',
        error.response?.data,
      );
    }
    return Promise.reject(error);
  },
);

export default apiClient;
