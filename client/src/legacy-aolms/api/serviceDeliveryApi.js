import { authenticatedFetch } from './authenticatedFetch';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || '/api'}/service-delivery`;

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Request failed');
  }
  return response.json();
}

// ─────────── Upload Endpoints ───────────

export const uploadWbsExcel = async (file, targetDate) => {
  const formData = new FormData();
  formData.append('file', file);
  let url = `${API_BASE_URL}/upload-wbs`;
  if (targetDate) url += `?date=${encodeURIComponent(targetDate)}`;
  const response = await authenticatedFetch(url, { method: 'POST', body: formData });
  return handleResponse(response);
};

export const uploadResponseExcel = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await authenticatedFetch(`${API_BASE_URL}/upload-response`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(response);
};

// ─────────── Date Change ───────────

export const changeDate = async (selectedDate) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/change-date`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selectedDate }),
  });
  return handleResponse(response);
};

// ─────────── Tab 1: Data Verification ───────────

export const dataVerification = async () => {
  const response = await authenticatedFetch(`${API_BASE_URL}/data-verification`, { method: 'POST' });
  return handleResponse(response);
};

// ─────────── Tab 2: Cross Verification & ONT Check ───────────

export const crossVerifyOnt = async () => {
  const response = await authenticatedFetch(`${API_BASE_URL}/cross-verify-ont`, { method: 'POST' });
  return handleResponse(response);
};

// ─────────── Tab 3: Final Output ───────────

export const finalOutput = async () => {
  const response = await authenticatedFetch(`${API_BASE_URL}/final-output`, { method: 'POST' });
  return handleResponse(response);
};

// ─────────── Status ───────────

export const getStatus = async () => {
  const response = await authenticatedFetch(`${API_BASE_URL}/status`);
  return handleResponse(response);
};
