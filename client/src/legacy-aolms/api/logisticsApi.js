import { authenticatedFetch } from './authenticatedFetch';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || '/api'}/logistics`;

export const uploadLogisticsExcel = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await authenticatedFetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to upload logistics file');
  }

  return response.json();
};

export const uploadTeamExcel = async (file, selectedDate) => {
  const formData = new FormData();
  formData.append('file', file);

  let url = `${API_BASE_URL}/upload-team`;
  if (selectedDate) {
    url += `?selectedDate=${encodeURIComponent(selectedDate)}`;
  }

  const response = await authenticatedFetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to compare team sheet');
  }

  return response.json();
};

export const changeDate = async (selectedDate) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/change-date`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selectedDate }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to change date');
  }

  return response.json();
};

export const checkOntUpdate = async () => {
  const response = await authenticatedFetch(`${API_BASE_URL}/check-ont`, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to check ONT');
  }

  return response.json();
};
