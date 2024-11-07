import axios from "axios";

const api = axios.create({
    baseURL: 'api-ecoleta-one.vercel.app'
});

export default api;