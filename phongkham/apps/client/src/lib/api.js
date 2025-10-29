import axios from 'axios';

export const api = axios.create({ baseURL: '/api' });

// Patients
export async function fetchPatients(q, visitPurpose, visitStatus) {
  const res = await api.get('/patients', { params: { q, visitPurpose, visitStatus } });
  return res.data;
}

export async function getPatient(id) {
  const res = await api.get(`/patients/${id}`);
  return res.data;
}

export async function createPatient(data) {
  const res = await api.post('/patients', data);
  return res.data;
}

export async function updatePatient(id, data) {
  const res = await api.put(`/patients/${id}`, data);
  return res.data;
}

export async function deletePatient(id) {
  const res = await api.delete(`/patients/${id}`);
  return res.data;
}

// Refractions
export async function fetchRefractions(patientId) {
  const res = await api.get('/refractions', { params: { patientId } });
  return res.data;
}

export async function createRefraction(payload) {
  const res = await api.post('/refractions', payload);
  return res.data;
}

export async function updateRefraction(id, payload) {
  const res = await api.put(`/refractions/${id}`, payload);
  return res.data;
}

export async function deleteRefraction(id) {
  const res = await api.delete(`/refractions/${id}`);
  return res.data;
}

// Examinations
export async function fetchExaminations(patientId) {
  const res = await api.get('/examinations', { params: { patientId } });
  return res.data;
}

export async function createExamination(payload) {
  const res = await api.post('/examinations', payload);
  return res.data;
}

export async function updateExamination(id, payload) {
  const res = await api.put(`/examinations/${id}`, payload);
  return res.data;
}

export async function deleteExamination(id) {
  const res = await api.delete(`/examinations/${id}`);
  return res.data;
}

// Products
export async function fetchProducts(category, q) {
  const res = await api.get('/products', { params: { category, q } });
  return res.data;
}

export async function getProduct(id) {
  const res = await api.get(`/products/${id}`);
  return res.data;
}

export async function createProduct(data) {
  const res = await api.post('/products', data);
  return res.data;
}

export async function updateProduct(id, data) {
  const res = await api.put(`/products/${id}`, data);
  return res.data;
}

export async function deleteProduct(id) {
  const res = await api.delete(`/products/${id}`);
  return res.data;
}

// Invoices
export async function fetchInvoices(status) {
  const res = await api.get('/invoices', { params: { status } });
  return res.data;
}

export async function getInvoice(id) {
  const res = await api.get(`/invoices/${id}`);
  return res.data;
}

export async function createInvoice(data) {
  const res = await api.post('/invoices', data);
  return res.data;
}

export async function updateInvoiceStatus(id, status) {
  const res = await api.patch(`/invoices/${id}/status`, { status });
  return res.data;
}

export async function updateInvoiceSignature(id, signature) {
  const res = await api.patch(`/invoices/${id}/signature`, { signature });
  return res.data;
}

export async function deleteInvoice(id) {
  const res = await api.delete(`/invoices/${id}`);
  return res.data;
}

// Stats
export async function fetchDashboardStats() {
  const res = await api.get('/stats/dashboard');
  return res.data;
}

export async function fetchMonthlyRevenue(year) {
  const res = await api.get('/stats/revenue/monthly', { params: { year } });
  return res.data;
}

export async function fetchProductCategories() {
  const res = await api.get('/stats/products/categories');
  return res.data;
}

// Vouchers
export async function fetchVouchers() {
  const res = await api.get('/vouchers');
  return res.data;
}

export async function validateVoucher(code, amount) {
  const res = await api.post('/vouchers/validate', { code, amount });
  return res.data;
}

export async function createVoucher(data) {
  const res = await api.post('/vouchers', data);
  return res.data;
}

export async function updateVoucher(id, data) {
  const res = await api.put(`/vouchers/${id}`, data);
  return res.data;
}

export async function deleteVoucher(id) {
  const res = await api.delete(`/vouchers/${id}`);
  return res.data;
}

export default api;
