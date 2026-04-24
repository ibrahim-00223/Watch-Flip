import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export const collection = {
  list: (params) => api.get("/collection", { params }),
  create: (data) => api.post("/collection", data),
  update: (id, data) => api.put(`/collection/${id}`, data),
  delete: (id) => api.delete(`/collection/${id}`),
};

export const flips = {
  list: () => api.get("/flips"),
  create: (data) => api.post("/flips", data),
  delete: (id) => api.delete(`/flips/${id}`),
};

export const alertes = {
  list: () => api.get("/alertes"),
  create: (data) => api.post("/alertes", data),
  update: (id, data) => api.put(`/alertes/${id}`, data),
  delete: (id) => api.delete(`/alertes/${id}`),
  run: (id) => api.post(`/alertes/${id}/run`),
};

export const veille = {
  scrape: (data) => api.post("/veille/scrape", data),
  resultats: (params) => api.get("/veille/resultats", { params }),
};
