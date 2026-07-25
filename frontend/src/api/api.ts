import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://cortex-production-4400.up.railway.app',

});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const setToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const getMe = () => {
  return api.get('/users/me');
};

export const deposit = (amount: number) => {
  return api.post('/wallet/deposit', { amount });
};

export const withdraw = (amount: number) => {
  return api.post('/wallet/withdraw', { amount });
};

