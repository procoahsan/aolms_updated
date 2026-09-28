const API_URL = '/api';

export async function fetchStaff(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });

  const url = `${API_URL}/staff?${query.toString()}`;
  const response = await authenticatedFetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch staff: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchStaffById(id) {
  const response = await authenticatedFetch(`${API_URL}/staff/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch staff member: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchStaffStats() {
  const response = await authenticatedFetch(`${API_URL}/staff/stats`);
  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.statusText}`);
  }
  return response.json();
}

import { authenticatedFetch } from './authenticatedFetch';
