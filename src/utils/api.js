import axios from "axios";
import { store } from "@/stores";

const instance = axios.create({
  baseURL: "/api",
  timeout: 5000,
});

instance.interceptors.request.use((config) => {
  store.setLoading(true);
  return config;
});

instance.interceptors.response.use(
  (response) => {
    store.setLoading(false);
    return response.data;
  },
  (error) => {
    store.setLoading(false);
    return Promise.reject(error);
  }
);

export const getBuildings = () => instance.get("/buildings");
export const getEnergyData = (buildingId, type = "monthly") =>
  instance.get(`/energy?buildingId=${buildingId}&type=${type}`);
export const getBuildingDetail = (buildingId) =>
  instance.get(`/buildings/${buildingId}`);
