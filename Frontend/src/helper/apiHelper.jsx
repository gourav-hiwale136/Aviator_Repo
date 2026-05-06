// import apiService from '../utils/apiService';

import apiService from "../utilis/apiService";

let cancelController;

const url = import.meta.env.VITE_API_BASE_URL || "https://amm-api.pluto-online.com/api";

export { url, cancelController };

export const getRequest = async (endpoint) => {
  return makeRequest(endpoint, 'GET');
};

export const putRequest = async (endpoint, body) => {
  return makeRequest(endpoint, 'PUT', body);
};

export const postRequest = async (endpoint, body, isFormData = false) => {
  return makeRequest(endpoint, 'POST', body, isFormData);
};

export const deleteRequest = async (endpoint, body) => {
  return makeRequest(endpoint, 'DELETE', body);
};

const makeRequest = async (endpoint, method, data, isFormData = false) => {
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    if (method === 'GET') {
      return await apiService.get(endpoint, { headers });
    }
    if (method === 'DELETE') {
      return await apiService.del(endpoint, { headers, data });
    }
    if (method === 'PUT') {
      return await apiService.put(endpoint, data, { headers });
    }
    return await apiService.post(endpoint, data, { headers });
  } catch (error) {
    handleErrors(error?.response?.data || error);
    return error?.response?.data;
  }
};

const ErrorReload = (res) => {
  if (res !== undefined && window.location.pathname !== '/') {
    window.location.replace('/');
    localStorage.clear();
  }
};

const handleErrors = (error) => {
  if (error.name === 'AbortError') {
    return;
  }

  if (error !== undefined) {
    if (
      error.message === 'jwt expired' ||
      error.message === 'Please authenticate' ||
      error.message === 'jwt must be provided'
    ) {
      ErrorReload(error);
    }
  }
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);

  const padZero = (num) => (num < 10 ? `0${num}` : num);

  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = padZero(date.getMinutes());
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12;
  const strTime = `${hours}:${minutes} ${ampm}`;
  return `${day}/${month}/${year} ${strTime}`;
};

export default {
  getRequest,
  putRequest,
  postRequest,
  deleteRequest,
  formatDate,
};
