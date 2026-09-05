import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://stratum-iyh5.onrender.com',

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

// --- Трансграничные выплаты ---

export type DeliveryMethod = 'CARD' | 'BANK';

export const getCorridors = () => api.get('/payouts/corridors');

export const getQuote = (payload: {
  sourceCurrency: string;
  sourceAmount: number;
  country: string;
  method: DeliveryMethod;
}) => api.post('/payouts/quote', payload);

export const getBeneficiaries = () => api.get('/payouts/beneficiaries');

export const createBeneficiary = (payload: {
  name: string;
  type?: 'INDIVIDUAL' | 'BUSINESS';
  country: string;
  deliveryMethod: DeliveryMethod;
  cardNumber?: string;
  bankName?: string;
  accountNumber?: string;
  swiftCode?: string;
}) => api.post('/payouts/beneficiaries', payload);

export const createPayout = (payload: {
  beneficiaryId: number;
  sourceCurrency: string;
  sourceAmount: number;
  purpose?: string;
  invoiceReference?: string;
}) => api.post('/payouts', payload);

export const getPayout = (reference: string) =>
  api.get(`/payouts/${reference}`);

export const getPayouts = (page = 1, limit = 10) =>
  api.get('/payouts', { params: { page, limit } });

