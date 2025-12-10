import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/api",
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getAppointments = () => API.get("/appointments");

export const updateStatus = (id, status, notes = "") =>
  API.patch(`/appointments/${id}/status`, { status, notes });

export const rescheduleAppointment = (id, newDate, notes = "") =>
  API.patch(`/appointments/${id}/reschedule`, { newDate, notes });
