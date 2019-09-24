import axios from "axios";
import { general } from "config";

const api = axios.create({ baseURL: general.base_url });

export default api;
