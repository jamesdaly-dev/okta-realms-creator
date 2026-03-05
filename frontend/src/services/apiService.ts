import axios from 'axios';
import { API_URL } from '../config/oktaConfig';
import type { UploadResponse } from '../types/index';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  async uploadCSV(file: File, accessToken: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadResponse>('/api/realms/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  },

  async listRealms(accessToken: string) {
    const response = await api.get('/api/realms/list', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  },
};
