import { authenticatedFetch } from './authenticatedFetch';

const API_BASE_URL = `${'/api'}/service-delivery`;

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Request failed');
  }
  return response.json();
}

// ─────────── Upload Endpoints ───────────

export const changeDate = async (selectedDate) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/change-date`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selectedDate }),
  });
  return handleResponse(response);
};

// ─────────── Tab 1: Data Verification ───────────

export const dataVerification = async (selectedDate) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/data-verification`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({selectedDate}) });
  return handleResponse(response);
};

// ─────────── Tab 2: Cross Verification & ONT Check ───────────

export const crossVerifyOnt = async (selectedDate) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/cross-verify-ont`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({selectedDate}) });
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
